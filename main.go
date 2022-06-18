package main

import (
	"net/http"

	"html/template"
	"embed"

	"os"
	"io/fs"
	"path"

	"strings"

	"time"
	"bytes"

	"errors"
	"math"
	"os/exec"

	"fmt"
	"log"

	"regexp"

	"github.com/gabriel-vasile/mimetype"
)


//go:embed internalpages/*
var internalPages embed.FS
var tmpl *template.Template

var re *regexp.Regexp  		= regexp.MustCompile(`(.*?)( |\n)`)

// i literally have no other name for this 
// and honestly given that it has two objects i wish it wasn't necessary
// (it's for the file listing template)
type Foo struct { 
	Directory 	[]os.FileInfo
	FolderName 	string
}

func main() {
	tmpl = template.New("")
	tmpl.Funcs(template.FuncMap{
		"Include": 		Include,
		"Time": 		Time,
		"FileType": 	FileType,
		"PrettySize": 	PrettySize,
		"Diskfree": 	Diskfree,
	})
	_, err := tmpl.ParseFS(internalPages, "internalpages/*")
	if err != nil {
		log.Println(err)
	}

	s := &http.Server{
		Addr:           ":8080",
		Handler:        http.HandlerFunc(handlerFunc),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	if err := s.ListenAndServe(); err != nil {
		log.Fatalln(err);
	}
}

func handlerFunc(w http.ResponseWriter, r *http.Request) {
	// How are we trying to access the site?
	switch r.Method {
		case http.MethodGet, http.MethodHead: // Nothing. Continue.
		default:
			// Send them an error.
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
	}
	var fileToServe string
	var internal bool
	pagename := r.URL.EscapedPath()
	pagename = strings.Replace(pagename,".html","",1)
	pagename = strings.Replace(pagename,".php","",1) 
	switch(pagename) {
		case "/":
			internal = true
			fileToServe = "index"
		case "/dirlist", "/generic_image", "/generic_text", "/has_script", "/no_script":
			internal = true
			fileToServe = strings.Replace(pagename,"/","",1)
		default:
			internal = false
			fileToServe = strings.Replace(pagename,"/","",1)
	}

	// Is it an internal page? If so, switch to that function.
	if(internal) {
		ServeInternalPage(w, fileToServe)
		return
	// otherwise go through the function to see what we need to serve.
	} else {
		ServeFileOrFolder(w, r, fileToServe)
		return
	}
	
}

func ServeFileOrFolder(w http.ResponseWriter, r *http.Request, filename string) {
	// This is my main excuse for not using mux, basically we use a query string
	// to determine whether the file should *actually* be served or not. This allows me
	// to redirect most valid requests to the home page and then have the Javascript create
	// a window with the page (which uses the query string).

	// (TODO: include the file contents in a noscript tag for those on javascript-less browsers)

	embed := false
	embedQuery := r.URL.Query().Get("embed")
	if(embedQuery == "true") {
		embed = true
	}

	// Is it a directory? If so, switch to that function.
	if finfo, err := os.Lstat(filename); err == nil {
		if(finfo.Mode().IsDir()) {
			if(embed) {
				ServeFolder(w,filename)
			} else {
				ServeInternalPage(w, "index")
			}
			return
		}
	}
	// it could also be in the pages directory
	if finfo, err := os.Lstat("./pages/"+filename); err == nil {
		if(finfo.Mode().IsDir()) {
			if(embed) {
				ServeFolder(w,"./pages/"+filename)
			} else {
				ServeInternalPage(w, "index")
			}
			return
		}
	}

	// Ok, so we're loading a file. There's three places a file could be.

	// 1. as an extensionless file in pages/
	if page, err := os.ReadFile("./pages/"+filename); err == nil {
		ServeFile(w,"./pages"+filename,page)
		return
	} else {
		// if we didn't get a 404 back there, send a 500 error.
		if(!os.IsNotExist(err)) {
			SendError(w,500,filename,err)
			return
		}
	}

	// 2. as an html file in pages/
	if page, err := os.ReadFile("./pages/"+filename+".html"); err == nil {
		if(embed) {
			ServeFile(w,"./pages/"+filename+".html",page)
		} else {
			ServeInternalPage(w, "index")
		}
		return
	} else {
		if(!os.IsNotExist(err)) {
			SendError(w,500,filename,err)
			return
		}
	}

	// 3. just anywhere in the file system.
	if file, err := os.Open(path.Clean(filename)); err == nil {
		stat, err := file.Stat()
		if(err != nil) {
			SendError(w,500,filename,err)
			return
		}
		http.ServeContent(w, r, stat.Name(), stat.ModTime(), file)
		return
	}

	// If we are still here then give the user a 404.
	err := errors.New("File or folder does not exist")
	SendError(w,404,filename,err)
}

// function for writing the contents of a directory to the writer
func ServeFolder(w http.ResponseWriter, Foldername string) {
	directoryFile, err := os.Open(Foldername)
	if(err != nil) {SendError(w,500,Foldername,err)}
	Directory, err := directoryFile.Readdir(0)
	if(err != nil) {SendError(w,500,Foldername,err)}

	w.WriteHeader(200)
	w.Header().Set("Content-Type", "text/html")
	w.Header().Set("Content-Name", Foldername)

	//FoldernameStripped := strings.Replace(Foldername, ".", "", 1)
	fuck := Foo{Directory,Foldername+"/"}

	if err := tmpl.ExecuteTemplate(w, "dirlist.html",fuck); err != nil {
		w.Write([]byte(err.Error()))
	}
}

// function for writing the contents of a file to the writer
func ServeFile(w http.ResponseWriter, filename string, page []byte) {
	w.WriteHeader(200)
	// Get the content type for that file to send.
	contentType := ContentType("./"+filename)
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Name", filename)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(page)))
	_, err := w.Write(page)
	if(err != nil) {
		fmt.Println(err)
		return
	}
	return
}

// function to write an internal (template) page to the writer 
func ServeInternalPage(w http.ResponseWriter, filename string) {
	w.WriteHeader(200)
	contentType := ContentType("./internalpages/"+filename+".html")
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Name", filename)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len([]byte(Include(filename)))))
	fmt.Printf("Sending internal page %s.html\n",filename)

	i, err := w.Write([]byte(Include(filename)))
	if(err != nil) {
		fmt.Println(err)
		return
	}

	fmt.Printf("%d bytes written for %s.html!\n",i,filename)
} 

func SendError(w http.ResponseWriter, code int, pagename string, err error) {
	w.WriteHeader(500)
	fmt.Printf("Sending %d error for %s, %s\n\n",code,pagename,err.Error())
	w.Write([]byte(fmt.Sprintf("<h1>Error %d</h1>%s",code,err)))
	return
}

func ContentType(filename string) (string) {
	mtype, err := mimetype.DetectFile(filename)
	if(err != nil) {
		return "application/x-octet-stream"
	}
	return mtype.String()
}

// function for executing and including templates before i realized this is is just a thing you can do with in the templating language itself
func Include(filename string) (string) {
	var returnString bytes.Buffer
	if err := tmpl.ExecuteTemplate(&returnString, filename+".html",nil); err != nil {
		return err.Error()
	}
	return returnString.String()
}

// function for returning the server time
func Time() (string) {
	today := time.Now().UTC() // the UTC date
	yesterday := today.Unix() - 820454400 // 820454400 = Jan 1 1996, 12:00AM
	date := time.Unix(yesterday,0)
	return date.Format("Mon Jan 02 2006")
}

// function for returning a string based on the file type of something.
func FileType(filename string) (string) {
	if finfo, err := os.Lstat(filename); err == nil {
		switch mode := finfo.Mode(); {
			case mode.IsDir():					return "folder"
			case mode.IsRegular():  			return "document"
			case mode&fs.ModeSymlink != 0: 		return "symlink"
			case mode&fs.ModeNamedPipe != 0: 	return "named pipe"
			default: 							return "unknown"
		}
	} else {
		return "error ("+err.Error()+")"
	}
}

// function that converts a number to bytes 
func PrettySize(size_ int64) (string) {
	size := float64(size_)
	// If the size is 4096, make an unsafe approximation and assume it's a folder. 
	// it's not like users will be able to upload files, worst that happens is that 
	// I accidentally put in a file that's 4096 bytes
	if(size == 4096) {
		return "-"
	}
	switch(math.Round(math.Log10(size))) {
		case 1, 2, 3: 		return fmt.Sprintf("%.0fB",size) 	// B
		case 4, 5: 			return fmt.Sprintf("%.0fK",size)	// K
		case 6, 7: 			return fmt.Sprintf("%.0fMB",size)	// MB
		case 8, 9: 			return fmt.Sprintf("%.0fGB",size)	// GB
		case 10, 11: 		return fmt.Sprintf("%.0fTB",size)	// TB
		case 12, 13:		return fmt.Sprintf("%.0fPB",size)	// PB
		case 14, 15: 		return fmt.Sprintf("%.0fEB",size)	// EB
		case 16, 17: 		return fmt.Sprintf("%.0fZB",size)	// ZB
		case 18, 19: 		return fmt.Sprintf("%.0fYB",size)	// YB
	}
	return "-"
}

// function to show how much disk space is left on the server
func Diskfree() (string) {
	cmd := exec.Command("df","-h","/")
	df, err := cmd.Output()
	if(err != nil) {
		return "Error getting disk space: "+err.Error()
	}
	dfSplit := re.FindAll(df,-1)
	return string(dfSplit[20])
}