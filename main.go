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

	"github.com/gabriel-vasile/mimetype"
)

//go:embed internalpages/*
var internalPages embed.FS
var tmpl *template.Template

func main() {
	tmpl = template.New("")
	tmpl.Funcs(template.FuncMap{
		"Include": Include,
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
	pagename = strings.Replace(pagename,".html","",99)
	pagename = strings.Replace(pagename,".php","",99)
	switch(pagename) {
		case "/":
			internal = true
			fileToServe = "index"
		case "/dirlist", "/generic_image", "/generic_text", "/has_script", "/no_script":
			internal = true
			fileToServe = strings.Replace(pagename,"/","",99)
		default:
			internal = false
			fileToServe = strings.Replace(pagename,"/","",99)
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
		fmt.Printf("%d bytes written for %s.html!\n\n",i,fileToServe)
	} else {
		// Otherwise we should read it as it currently is, without loading it into memory, and serve it.
		// First, try and load it from an html file in the pages folder
		page, err := os.ReadFile("./pages"+pagename+".html")
		if(err != nil) {
			// If that fails, check if it's because it doesn't exist,
			if(os.IsNotExist(err)) {
				// and if it is then try and load it as a file in the filesystem.
				page, err = os.ReadFile("."+pagename)
				if(err != nil) {
					// If that fails, we've reached the point of a 404
					w.WriteHeader(404)
					fmt.Printf("Sending 404 error for %s\n\n",pagename)
					w.Write([]byte(err.Error()))
					return
				}
				// If it succeeds, though, report a success and send it, and make sure the 
				// header is set correctly
				w.WriteHeader(200)
				fmt.Printf("Sending raw file %s\n",pagename)
				// Get the content type for that file to send.
				contentType := ContentType("."+pagename)
				w.Header().Set("Content-Type", contentType)
				w.Header().Set("Content-Disposition", "attachment; filename="+pagename)
				w.Header().Set("Content-Name", pagename)
				fmt.Println(contentType)
				i, err := w.Write(page)
				if(err != nil) {
					fmt.Println(err)
					return
				}
				fmt.Printf("%d bytes written for %s!\n\n",i,pagename)
				return
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
		w.Header().Set("Content-Name", pagename)
		fmt.Printf("Sending page %s\n",pagename)
		i, err := w.Write(page)
		if(err != nil) {
			fmt.Println(err)
			return
		}
		fmt.Printf("%d bytes written for %s!\n\n",pagename,i)
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