package main

import (
	"fmt"
	"image"
	"image/png"
	"image/color"
	//"image/draw"
	"strings"
	"os"
	"net/http"
	"strconv"

	"golang.org/x/image/font"
	"github.com/golang/freetype"
	"github.com/golang/freetype/truetype"
)

var fonts map[string]*truetype.Font
var context *freetype.Context
func init() {
	context = freetype.NewContext() 
	context.SetDPI(96)
	context.SetSrc(image.Black)
	context.SetHinting(font.HintingNone)

	// Load the font files we'll use
	charcoalFile, err := os.ReadFile("resources/CHARCOAL.TTF")
	if(err != nil) {
		fmt.Println(err)
		os.Exit(1)
	}
	genevaFile, err := os.ReadFile("resources/geneva.ttf")
	if(err != nil) {
		fmt.Println(err)
		os.Exit(1)
	}
	monacoFile, err := os.ReadFile("resources/monaco_9.ttf")
	if(err != nil) {
		fmt.Println(err)
		os.Exit(1)
	}

	// Then load them into a map that we can referenced later
	fonts = make(map[string]*truetype.Font)
	fonts["charcoal"], err = truetype.Parse(charcoalFile)
	if(err != nil) {
		fmt.Println(err)
		os.Exit(1)
	}
	fonts["geneva"], err = truetype.Parse(genevaFile)
	if(err != nil) {
		fmt.Println(err)
		os.Exit(1)
	}
	fonts["monaco"], err = truetype.Parse(monacoFile)
	if(err != nil) {
		fmt.Println(err)
		os.Exit(1)
	}
}

func DrawString(text, fontname string, fontsize int, width, height int, r, g, b int) (result *image.RGBA, err error) {
	// create and pre-fill an image with a certain color
	result = image.NewRGBA(image.Rect(0,0,width+5,height+2))
	ourColor := color.NRGBA{
		R:uint8(r),
		G:uint8(g),
		B:uint8(b),
		A:255,
	}
	for y := 0; y < height+2; y++ {
		for x := 0; x < width+5; x++ {
			result.Set(x,y,ourColor)
		}
	}

	// settings
	switch(strings.ToLower(fontname)) {
		case "charcoal": 	context.SetFont(fonts["charcoal"])
		case "geneva": 		context.SetFont(fonts["geneva"])
		default: 			context.SetFont(fonts["monaco"])
	}
	context.SetClip(result.Bounds())
	context.SetDst(result)
	context.SetFontSize(float64(fontsize))

	textLength := len(text)
	point := freetype.Pt(3+((width/2)-(textLength*2)-(textLength/2)),((height/2)))

	_, err = context.DrawString(text, point)
	if(err != nil) {
		return nil, err
	}

	return result, nil
}

func ImageHandle(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	// Default values
	text, fontname := "This is a test", "monaco"
	width, height := 0, 16
	red, green, blue := 255, 255, 255
	fontsize := 12
	var err error
	
	// If any of the URL parameters are set, replace said default values with them.
	if(query["text"] != nil) {text = query["text"][0]}
	if(query["fontname"] != nil) {fontname = query["fontname"][0]}
	if(query["width"] != nil) {
		width, err = strconv.Atoi(query["width"][0])
		if(err != nil) {
			SendError(w,500,r.URL.String(),err)
			fmt.Fprintf(w, err.Error())
			return
		}
	} else {
		width = (len(text)*4)+len(text)
	}
	if(query["height"] != nil) {
		height, err = strconv.Atoi(query["height"][0])
		if(err != nil) {
			SendError(w,500,r.URL.String(),err)
			fmt.Fprintf(w, err.Error())
			return
		}
	}

	if(query["r"] != nil) {
		red, err = strconv.Atoi(query["r"][0])
		if(err != nil) {
			SendError(w,500,r.URL.String(),err)
			fmt.Fprintf(w, err.Error())
			return
		}
	}

	if(query["g"] != nil) {
		green, err = strconv.Atoi(query["g"][0])
		if(err != nil) {
			SendError(w,500,r.URL.String(),err)
			fmt.Fprintf(w, err.Error())
			return
		}
	}

	if(query["b"] != nil) {
		blue, err = strconv.Atoi(query["b"][0])
		if(err != nil) {
			SendError(w,500,r.URL.String(),err)
			fmt.Fprintf(w, err.Error())
			return
		}
	}

	if(query["fontsize"] != nil) {
		fontsize, err = strconv.Atoi(query["fontsize"][0])
		if(err != nil) {
			SendError(w,500,r.URL.String(),err)
			fmt.Fprintf(w, err.Error())
			return
		}
	}

	// Get the generated image
	image, err := DrawString(text,fontname,fontsize,width,height,red,green,blue)
	if(err != nil) {
		SendError(w,500,r.URL.String(),err)
		fmt.Fprintf(w, err.Error())
		return
	}
	err = png.Encode(w, image)
	if(err != nil) {
		SendError(w,500,r.URL.String(),err)
		fmt.Fprintf(w, err.Error())
		return
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Content-Name", r.URL.String())

}

