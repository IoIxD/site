package main
// This file contains functions related to getting the current time, and formatting it.

import (
	"time"
)

// function for returning the server time as a formatted date.
func Time() (string) {
	today := time.Now().UTC() // the UTC date
	yesterday := today.Unix() - 820454400 // 820454400 = Jan 1 1996, 12:00AM
	date := time.Unix(yesterday,0)
	return date.Format("Mon Jan 02 2006")
}

// function for returning a time any other function gets, as a nice shortened string
// (mostly for file modification dates)
func PrettyTime(timeRaw time.Time) (string) {
	timeFormat := "Mon, Jan 2, 2006"
	timeFormatPart2 := "03:04 PM"

	timeRawFmt := timeRaw.Format(timeFormat)

	dateNow := time.Now().UTC()
	dateNowFmt := dateNow.Format(timeFormat)

	if(dateNowFmt == timeRawFmt) {
		return timeRaw.Format("Today, "+timeFormatPart2)
	} else {
		return timeRaw.Format(timeFormat+", "+timeFormatPart2)
	}
	return ""
}


