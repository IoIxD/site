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
	// Is it an internal page? If so, treat it like a template.
	if(internal) {
		w.WriteHeader(200)
		contentType := ContentType("./internalpages/"+fileToServe+".html")
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", "attachment; filename="+fileToServe)
		w.Header().Set("Content-Name", pagename)

		fmt.Printf("Sending internal page %s.html\n",fileToServe)

		i, err := w.Write([]byte(Include(fileToServe)))
		if(err != nil) {
			fmt.Println(err)
			return
		}

		fmt.Printf("%d bytes written for %s.html!\n",i,fileToServe)

	} else {
		// Otherwise we should read it as it currently is, without loading it 
		// into memory, and serve it.
		// First, assume it's the name of a page in the html folder
		page, err := os.ReadFile("./pages/"+fileToServe+"/.html")
		if(err != nil) {
			if(os.IsNotExist(err)) {
				// If the file doesn't exist, then try and load it from anywhere within the directory
				file, err := os.Open(path.Clean(fileToServe))
				if(err != nil) {
					w.WriteHeader(404)
					fmt.Printf("Sending 404 error for %s, %s\n\n",pagename,err.Error())
					w.Write([]byte(err.Error()))
					return
				}
				stat, err := file.Stat()
				if(err != nil) {
					w.Write([]byte(err.Error()))
					return
				}
				http.ServeContent(w, r, stat.Name(), stat.ModTime(), file)
			} else {
				w.WriteHeader(500)
				fmt.Printf("Sending 500 error for %s, %s\n\n",pagename,err.Error())
				w.Write([]byte(err.Error()))
				return
			}
		} else {
			w.WriteHeader(500)
			fmt.Printf("Sending 500 error for %s, %s\n\n",pagename,err.Error())
			w.Write([]byte(err.Error()))
			return
		}
		w.WriteHeader(200)
		// Get the content type for that file to send.
		contentType := ContentType("./"+fileToServe)
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", "attachment; filename="+fileToServe)
		w.Header().Set("Content-Name", pagename)
		fmt.Printf("Sending %s\n",fileToServe)
		i, err := w.Write(page)
		if(err != nil) {
			fmt.Println(err)
			return
		}
		fmt.Printf("%d bytes written for %s\n\n",i,fileToServe)
	}
}

func Include(filename string) (string) {
	var returnString bytes.Buffer
	if err := tmpl.ExecuteTemplate(&returnString, filename+".html",nil); err != nil {
		return err.Error()
	}
	return returnString.String()
}

func ContentType(filename string) (string) {
	mtype, err := mimetype.DetectFile(filename)
	if(err != nil) {
		return "application/x-octet-stream"
	}
	fmt.Println(mtype.String())
	return mtype.String()
}

func Time() (string) {
	today := time.Now().UTC() // the UTC date
	yesterday := today.Unix() - 820454400 // 820454400 = Jan 1 1996, 12:00AM
	date := time.Unix(yesterday,0)
	return date.Format("Mon Jan 02 2006")
}