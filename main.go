package main

import (
	"net/http"
	"html/template"
	"embed"
	"os"
	"strings"
	"bytes"
	"fmt"
	"log"
	"path"
	"errors"
	"time"
)


//go:embed internalpages/*
var internalPages embed.FS
var tmpl *template.Template

// i really don't know what else to call this tbh, it's really only here
// because golang's templates function won't accept more then on variable  
type Foo struct { 
	Directory 						[]os.FileInfo
	FolderName,	StrippedFoldername 	string
}

func main() {
	tmpl = template.New("")
	tmpl.Funcs(template.FuncMap{
		"Include": 		Include,
		"Time": 		Time,
		"FileType": 	FileType,
		"PrettySize": 	PrettySize,
		"PrettyTime": 	PrettyTime,
		"Diskfree": 	Diskfree,
		"IsDirectory": 	IsDirectory,
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

	// Whether or not a page being served should actually be served, or if we should just serve the index page.
	embed := false
	embedQuery := r.URL.Query().Get("embed")
	if(embedQuery == "true") {
		embed = true
	}

	// Is it a directory? If so, switch to the function for serving those.
	if(IsDirectory(filename)) {
		if(embed) {
			ServeFolder(w,filename)
		} else {
			ServeInternalPage(w, "index")
		}
		return
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

	// we strip the foldername of the pages/ prefix on the server side because god forbid 
	// this site use one more line of javascript
	StrippedFoldername := strings.Replace(Foldername,"pages/","",1)
	fuck := Foo{Directory,Foldername+"/",StrippedFoldername+"/"}

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


// function for executing and including templates before i realized this is is just a thing you can do with in the templating language itself
func Include(filename string) (string) {
	var returnString bytes.Buffer
	if err := tmpl.ExecuteTemplate(&returnString, filename+".html",nil); err != nil {
		return err.Error()
	}
	return returnString.String()
}