package main
// This file contains functions that relate to the file listing.

import (
	//"strconv"
	"os"
	"os/exec"
	"math"
	"io/fs"
	"fmt"
	"strings"
	"github.com/gabriel-vasile/mimetype"
)

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

	log10 := math.Round(math.Log10(float64(size)))
	switch(log10) {
		case 1, 2, 3: 		return fmt.Sprintf("%.0fB",math.Round(size 	/1)) 				// B
		case 4, 5, 6: 		return fmt.Sprintf("%.0fK",math.Round(size 	/math.Pow(10,3)))	// K
		case 7, 8, 9: 		return fmt.Sprintf("%.0fMB",math.Round(size 	/math.Pow(10,6)))	// MB
		case 10, 11, 12: 	return fmt.Sprintf("%.0fGB",math.Round(size 	/math.Pow(10,9)))	// GB
		case 13, 14, 15: 	return fmt.Sprintf("%.0fTB",math.Round(size 	/math.Pow(10,12)))	// TB
		case 16, 17, 18:	return fmt.Sprintf("%.0fPB",math.Round(size 	/math.Pow(10,15)))	// PB
		case 19, 20, 21: 	return fmt.Sprintf("%.0fEB",math.Round(size 	/math.Pow(10,18)))	// EB
		case 22, 23, 24: 	return fmt.Sprintf("%.0fZB",math.Round(size 	/math.Pow(10,21)))	// ZB
		case 25, 26, 27: 	return fmt.Sprintf("%.0fYB",math.Round(size 	/math.Pow(10,24)))	// YB
	}
	return "-"
}

// function to show how much disk space is left on the server
func Diskfree() (string) {
	cmd := exec.Command("df","--output=avail","-h","/")
	df, err := cmd.Output()
	if(err != nil) {
		return "Error getting disk space: "+err.Error()
	}
	dfSecondLine := strings.Split(string(df),"\n")[1]
	return dfSecondLine+"B"
}


// function for checking if something is a directory
func IsDirectory(filename string) (bool) {
	if finfo, err := os.Lstat(filename); err == nil {
		if(finfo.Mode().IsDir()) {
			return true
		}
	} else {
		// this is to be used in templates so we can't actually handle the error
		return false
	}
	// it could also be a directory in the pages directory
	if finfo, err := os.Lstat("./pages/"+filename); err == nil {
		if(finfo.Mode().IsDir()) {
			return true
		}
	} else {
		return false
	}
	return false
}

// determine the mime type of a file without handling the error (because it will be used by a template)
func ContentType(filename string) (string) {
	mtype, err := mimetype.DetectFile(filename)
	if(err != nil) {
		return "application/x-octet-stream"
	}
	return mtype.String()
}
