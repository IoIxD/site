package main
// This file contains functions that relate to the file listing.

import (
	"strconv"
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
func PrettySize(size int64) (string) {
	// If the size is 4096, make an unsafe approximation and assume it's a folder. 
	// it's not like users will be able to upload files, worst that happens is that 
	// I accidentally put in a file that's 4096 bytes
	if(size == 4096) {
		return "-"
	}

	log10 := math.Round(math.Log10(float64(size)))
	sizeNew := size/int64(math.Pow(10,log10))
	switch(log10) {
		case 1, 2, 3: 		return fmt.Sprintf("%dB",sizeNew) 	// B
		case 4, 5: 			return fmt.Sprintf("%dK",sizeNew)		// K
		case 6, 7: 			return fmt.Sprintf("%dMB",sizeNew)	// MB
		case 8, 9: 			return fmt.Sprintf("%dGB",sizeNew)	// GB
		case 10, 11: 		return fmt.Sprintf("%dTB",sizeNew)	// TB
		case 12, 13:		return fmt.Sprintf("%dPB",sizeNew)	// PB
		case 14, 15: 		return fmt.Sprintf("%dEB",sizeNew)	// EB
		case 16, 17: 		return fmt.Sprintf("%dZB",sizeNew)	// ZB
		case 18, 19: 		return fmt.Sprintf("%dYB",sizeNew)	// YB
	}
	return "-"
}

// function to show how much disk space is left on the server
func Diskfree() (string) {
	cmd := exec.Command("df","-B1","--output=avail","/")
	df, err := cmd.Output()
	if(err != nil) {
		return "Error getting disk space: "+err.Error()
	}
	dfSecondLine := strings.Split(string(df),"\n")[1]
	dfFinal, err := strconv.Atoi(dfSecondLine)
	if(err != nil) {
		return "Error converting the df output to an int64: "+err.Error()
	} 
	return PrettySize(int64(dfFinal)) // use PrettySize instead of -h for consistency 
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
