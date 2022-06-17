package main

import (
	"net/http"
	"html/template"
	"embed"
	"os"
	"strings"
	"log"
	"time"
	"bytes"
	"fmt"
	"path"

	"github.com/gabriel-vasile/mimetype"
)

//go:embed internalpages/*
var internalPages embed.FS
var tmpl *template.Template

func main() {
	tmpl = template.New("")
	tmpl.Funcs(template.FuncMap{
		"Include": Include,
		"Time": Time,
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
	// inline function for sending the contents 
	writeFile := func(w http.ResponseWriter, fileToServe, pagename string, page []byte) {
		w.WriteHeader(200)
		// Get the content type for that file to send.
		contentType := ContentType("./"+fileToServe)
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", "attachment; filename="+fileToServe)
		w.Header().Set("Content-Name", pagename)
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(page)))
		_, err := w.Write(page)
		if(err != nil) {
			fmt.Println(err)
			return
		}
		return
	}

	// Whether or not a page being served should actually be served, or if we should just serve the index
	embed := false
	embedQuery := r.URL.Query().Get("embed")
	if(embedQuery == "true") {
		embed = true
	}

	// Is it an internal page? If so, treat it like a template.
	if(internal) {
		serveInternalPage(w, fileToServe)
	} else {
		// Otherwise we should read it as it currently is, without loading it 
		// into memory, and serve it.
		// First, assume it's the name of a page in the html folder without an extension
		page, err := os.ReadFile("./pages/"+fileToServe)
		if(err != nil) {
			if(!os.IsNotExist(err)) {
				SendError(w,500,pagename,err)
				return
			}

			// Then assume it has an extension
			page, err = os.ReadFile("./pages/"+fileToServe+".html")

			if(err != nil) {
				if(!os.IsNotExist(err)) {
					SendError(w,500,pagename,err)
					return
				}
			} else {
				// If there's no error, serve it, but only if the embed query string is here.
				if(embed) {
					writeFile(w,"./pages/"+fileToServe+".html",pagename,page)
				} else {
					// if it isn't, we just serve the index page and let the javascript handle opening a window for this page.
					serveInternalPage(w, "index")
				}
				return
			}

			// Finally, try and load it from anywhere within the root directory. 
			// Send a 404 if this doesn't work.

			file, err := os.Open(path.Clean(fileToServe))
			if(err != nil) {
				SendError(w,404,pagename,err)
				return
			}

			stat, err := file.Stat()
			if(err != nil) {
				SendError(w,404,pagename,err)
				return
			}
			http.ServeContent(w, r, stat.Name(), stat.ModTime(), file)
		} else {
			writeFile(w,"./pages"+fileToServe,pagename,page)
		}
	}
}

// function to serve an internal page

func serveInternalPage(w http.ResponseWriter, filename string) {
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

func Include(filename string) (string) {
	var returnString bytes.Buffer
	if err := tmpl.ExecuteTemplate(&returnString, filename+".html",nil); err != nil {
		return err.Error()
	}
	return returnString.String()
}

func Time() (string) {
	today := time.Now().UTC() // the UTC date
	yesterday := today.Unix() - 820454400 // 820454400 = Jan 1 1996, 12:00AM
	date := time.Unix(yesterday,0)
	return date.Format("Mon Jan 02 2006")
}