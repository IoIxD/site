"use strict";
class InvalidPageError {
    name;
    message;
    constructor(page) {
        this.name = "InvalidPageError";
        this.message = `Invalid page '${page}' given`;
    }
}
class WindowAlreadyRemovedError {
    name;
    message;
    constructor(page) {
        this.name = "WindowAlreadyRemovedError";
        this.message = `Tried to remove window '${page}' but it was already removed.`;
    }
}
// global variables
var mx = 0;
var my = 0;
var mx_o = 0;
var my_o = 0;
var wx_o = 0;
var wy_o = 0;
var hoveredWin;
var mouseDown = 0;
var titlebar_additions = "";
var options_iframe = "";
var movingWindow = 0;
var onPhone = false;
var lastTop = 0;
var port = window.location.port ? ":" + window.location.port : "";
function addEventListeners() {
    document.addEventListener("mousedown", function (e) {
        if (e.which != 1) {
            return;
        }
        mouseDown = 1;
        if (hoveredWin) {
            mx_o = e.pageX;
            my_o = e.pageY;
            let ex = hoveredWin.style.left;
            let ey = hoveredWin.style.top;
            if (ex.includes("%")) {
                wx_o = +(window.innerWidth) * +("." + ex.replace('%', ''));
            }
            else {
                wx_o = +(ex.replace('px', ''));
            }
            if (ey.includes("%")) {
                wy_o = +(window.innerHeight) * +("." + ey.replace('%', ''));
            }
            else {
                wy_o = +(ey.replace('px', ''));
            }
        }
        ;
    }, false);
    document.addEventListener("mouseup", function () {
        mouseDown = 0;
        if (movingWindow) {
            let el = hoveredWin;
            if (el == null) {
                return;
            }
            movingWindowReset();
            movingWindowDetect(el);
        }
    }, false);
    // DRAGGING
    document.addEventListener("mousemove", function (e) {
        mx = e.pageX;
        my = e.pageY;
        // are we moving a window?
        if (movingWindow) {
            if (!hoveredWin) {
                return;
            }
            // if the window we're supposed to be moving is maximized then no we aren't.
            if (hoveredWin.classList.contains("maximized")) {
                return;
            }
            // move whatever window we're hovering over.
            // first get what the position should be, in pixels.
            let newTop = (+(e.pageY - my_o) + +wy_o);
            let newLeft = (+(e.pageX - mx_o) + +wx_o);
            hoveredWin.style.top = newTop + "px";
            hoveredWin.style.left = newLeft + "px";
            hoveredWin.style.zIndex = "999";
        }
        else {
            // otherwise, check if we could be moving one, by checking if the mouse is down and we're over a window
            if (mouseDown) {
                if (hoveredWin) {
                    movingWindow = 1;
                }
            }
        }
        xeyesCheck(e);
    }, false);
}
var properties = getJSON(window.location.protocol + "//" + window.location.host + "/resources/pages/properties.json");
var fake_windows = {};
class FakeWindow {
    page;
    width;
    height;
    left;
    top;
    title;
    options = [];
    linked_element;
    exoptions;
    removePrevious;
    constructor(page, exoptions = "", removePrevious = true) {
        if (properties[page] === undefined) {
            let url = window.location.pathname.replace('.html', '');
            page = url.replace('/', '');
            let pageRoot = url.split("/")[0] ? 0 : url.split("/")[1];
            let pageToMatch = pageRoot;
            if (page.match(/\.txt$/gm)) {
                exoptions += "valload " + page;
                pageToMatch = "generic_text";
            }
            else if (page.match(/\.png$/gm)) {
                exoptions += "valload " + page;
                pageToMatch = "generic_image";
            }
            else {
                pageToMatch = pageRoot;
                this.options.push("dirlist");
            }
            this.width = properties[`${pageToMatch}`].width;
            this.height = properties[`${pageToMatch}`].height;
            this.left = properties[`${pageToMatch}`].left;
            this.top = properties[`${pageToMatch}`].top;
            this.options = properties[`${pageToMatch}`].options.split(" ");
            this.title = properties[`${pageToMatch}`].name;
        }
        else {
            this.width = properties[`${page}`].width;
            this.height = properties[`${page}`].height;
            this.left = properties[`${page}`].left;
            this.top = properties[`${page}`].top;
            this.options = properties[`${page}`].options.split(" ");
            this.title = properties[`${page}`].name;
        }
        this.page = page;
        this.exoptions = exoptions;
        this.removePrevious = removePrevious;
        this.linked_element = null;
        if (document.getElementById(page) || page == null) {
            throw new InvalidPageError(page);
        }
    }
}
function addFakeWindowToDOM(win) {
    for (let key in fake_windows) {
        let value = fake_windows[key];
        if (value == undefined) {
            continue;
        }
        if (!value?.options.includes("noanim")) {
            value.linked_element?.classList.add('noanim');
        }
        if (win.removePrevious && onPhone) {
            removeFakeWindowFromDOM(value);
        }
    }
    if (onPhone) {
        win.options.push("noanim");
    }
    if (!win.options.includes("noanim")) {
        document.documentElement.style.setProperty('--iw', win.width, "");
        document.documentElement.style.setProperty('--ih', win.height, "");
        document.documentElement.style.setProperty('--ix', win.left, "");
        document.documentElement.style.setProperty('--iy', win.top, "");
        document.documentElement.style.setProperty('--mpx', mx + "px", "");
        document.documentElement.style.setProperty('--mpy', my + "px", "");
    }
    if (win.options.includes("nooverflow")) {
        options_iframe = "scrolling='no'";
    }
    else {
        options_iframe = "";
    }
    if (win.options.includes("textfile")) {
        titlebar_additions = "<span class='wp-bar-fake'></span>";
    }
    else {
        titlebar_additions = "";
    }
    let pageUrl;
    if (win.options.includes("dirlist")) {
        pageUrl = `/resources/pages/dirlist.php?dir=resources/pages/${win.page}/`;
    }
    else {
        pageUrl = `/resources/pages/${win.page}.php`;
    }
    if (win.exoptions.includes("valload")) {
        win.exoptions = win.exoptions.replace("valload ", "");
        // the text wasn't replaced and i couldn't get the css to properly cut off the title how i wanted. i should come back to win.
        // title = exoptions.replace("%2F","\/");
        pageUrl += "?val=" + win.exoptions;
        win.page += "_" + makeid(6);
    }
    // create the div properly so we can reference it later.
    var div = document.createElement("div");
    div.style.display = "block";
    div.style.width = win.width;
    div.style.height = win.height;
    div.style.left = win.left;
    div.style.top = win.top;
    div.id = win.page;
    div.classList.add("window");
    if (win.options.length != 0) {
        for (var i in win.options) {
            let option = win.options[i].replace(/\s/g, "");
            if (option != "") {
                div.classList.add(option);
            }
        }
    }
    // skip ahead a bit 
    div.innerHTML += `
  <span class="titlebar">
      <span class='tl_lines'></span>
      <span onclick="windowRemove('${win.page}');"class='tl_button close'></span>
      <span class="title">` + win.title + `</span>
      <span onclick="windowMaximizeToggle(this.parentElement.parentElement);" class='tl_button maxmin'></span>
      <span onclick="windowShadeToggle(this.parentElement.parentElement);" class='tl_button shade'></span>
    </span>
    `;
    div.innerHTML += titlebar_additions;
    // create the contents div and properly add it to the div.
    var contents = document.createElement("span");
    contents.classList.add("content");
    if (win.options.length != 0) {
        for (var i in win.options) {
            let option = win.options[i].replace(/\s/g, "");
            if (option != "") {
                div.classList.add(option);
            }
        }
    }
    setPageContents(contents, pageUrl);
    div.appendChild(contents);
    var windowDrag = document.createElement("span");
    windowDrag.classList.add("window-drag");
    div.appendChild(windowDrag);
    document.body.appendChild(div);
    div.querySelector(".titlebar")?.addEventListener("mouseenter", (e) => {
        let target = e.target;
        if (target == null) {
            return;
        }
        let parentElement = target.parentElement;
        if (parentElement == null) {
            return;
        }
        movingWindowDetect(parentElement);
    });
    div.querySelector(".titlebar")?.addEventListener("mouseleave", (e) => {
        if (!movingWindow) {
            movingWindowReset();
        }
    });
}
function removeFakeWindowFromDOM(win) {
    movingWindowReset();
    document.getElementById(win.page)?.remove();
}
function getWindows() {
    return Array.from(document.querySelectorAll(".window"));
}
function movingWindowDetect(el) {
    if (el == null) {
        return;
    }
    if (el.classList.contains("window")) {
        hoveredWin = el;
        let windows = getWindows();
        // disallow every window from being selected while we're moving the current one.
        for (var i = 0; i < windows.length; i++) {
            if (windows[i] != hoveredWin) {
                windows[i].style.pointerEvents = 'none';
                windows[i].style.userSelect = 'none';
                windows[i].style.zIndex = '0';
            }
        }
    }
}
function movingWindowReset() {
    movingWindow = 0;
    hoveredWin = null;
    var windows = getWindows();
    for (var i = 0; i < windows.length; i++) {
        if (windows[i] != hoveredWin) {
            windows[i].style.pointerEvents = 'initial';
            windows[i].style.userSelect = 'initial';
        }
    }
}
// WINDOW SHADING
function windowShadeToggle(el) {
    let height = el.style.height;
    let heightasInt = 0;
    if (height.endsWith("%")) {
        // get the height in pixels
        heightasInt = +(height.replace("%", ""));
        heightasInt = +(window.innerHeight * (heightasInt / 100));
    }
    else {
        heightasInt = +(height.replace("px", ""));
    }
    if (el.classList.contains("shaded")) {
        el.classList.remove("shaded");
        el.style.marginTop = "0px";
    }
    else {
        el.classList.add("shaded");
        el.style.marginTop = (-(heightasInt / 2) + 9) + "px";
    }
}
// WINDOW MAXMIZING
function windowMaximizeToggle(el) {
    if (el.classList.contains("maximized")) {
        el.classList.remove("maximized");
    }
    else {
        el.classList.add("maximized");
    }
}
/**
 * @deprecated This function still exists because some old html/php pages use it, but it shouldn't be used internally.
 */
function windowCreate(name, exoptions = "", removePrevious = true) {
    let window = new FakeWindow(name, exoptions, removePrevious);
    fake_windows[name] = window;
    addFakeWindowToDOM(window);
}
/**
 * @deprecated This function still exists because some old html/php pages use it, but it shouldn't be used internally.
 */
function windowRemove(name) {
    let window = fake_windows[name];
    if (window == undefined) {
        throw new WindowAlreadyRemovedError(name);
    }
    removeFakeWindowFromDOM(window);
    fake_windows[name] = undefined;
}
// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
    let main_windows = [
        new FakeWindow("main", "", false),
        new FakeWindow("top-languages", "", false),
        new FakeWindow("github-stats", "", false),
        new FakeWindow("likes", "", false)
    ];
    main_windows.forEach(win => {
        fake_windows[win.page] = win;
        addFakeWindowToDOM(win);
    });
}
function setPageContents(elem, url) {
    return fetch(url)
        .then((t) => t.text())
        .then(t => {
        elem.innerHTML = t;
    });
}
function getPageContents(url) {
    var resp;
    var xmlHttp;
    xmlHttp = new XMLHttpRequest();
    if (xmlHttp != null) {
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        resp = xmlHttp.responseText;
        return resp;
    }
    else {
        return null;
    }
}
function getJSON(url) {
    var json = getPageContents(url);
    return JSON.parse(json);
}
async function setBackground() {
    let url = window.location.protocol + "//" + window.location.hostname + port;
    // acceptable folders to choose from
    let folders = ["checkerland", "dimension_352", "mindisafuck", "troll_98", "weecee_wallpaper_1"];
    let random = folders[Math.ceil(Math.random() * folders.length - 1)];
    // We want to get all the files within this folder and pick the one
    // that is closed to the user's screen resolution.
    let file = "";
    // we pass the size in kind of a weird way, but doing this allows us to just filter the filenames (which always have WIDTHxHEIGHT in
    // the name) to numbers only and compare, which is faster.
    let maxSize = +(screen.width + "" + screen.height);
    await fetch(url + "/resources/pages/art/" + random + "/")
        .then(r => r.text())
        .then(r => {
        let page = document.createElement("html");
        page.innerHTML = r;
        let links = page.querySelectorAll(".a p");
        for (let i in links) {
            let link = links[i];
            if (link.innerHTML === undefined) {
                continue;
            }
            if (link.innerHTML.includes("png")) {
                let numbers = +(link.innerHTML.replace(/([^0-9])/g, ''));
                if (numbers <= maxSize) {
                    file = "/resources/pages/art/" + random + "/" + link.innerHTML;
                }
            }
        }
    });
    // now we want to fetch the contents of that link and set the page's background to it
    document.body.style.backgroundImage = "url(\"" + file + "\")";
}
// XEYES
function xeyesCheck(e) {
    let xeyes = Array.from(document.querySelectorAll(".xeye"));
    xeyes.forEach(eye => {
        let top = +(eye.style.top.replace("px", ""));
        let left = +(eye.style.left.replace("px", ""));
        let parent = document.querySelector("#xeyes");
        let y = (e.clientY - top) - +(parent.style.top.replace("px", ""));
        let x = (e.clientX - left) - +(parent.style.left.replace("px", ""));
        let deg = (Math.atan2(y, x)) * 180 / Math.PI;
        let inner = eye.querySelector(".inner");
        inner.style.transform = `rotate(${deg}deg)`;
    });
}
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function main() {
    addEventListeners();
    if (navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
        onPhone = true;
    }
    else {
        onPhone = false;
    }
    let page = window.location.pathname.replace('.html', '').replace('/', '');
    if (page != "" && page != "index.php" && page != "main.php") {
        windowCreate(page);
    }
    else {
        OpenTheThree();
    }
    var classNames = [];
    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i))
        classNames.push('device-ios');
    if (navigator.userAgent.match(/android/i))
        classNames.push('device-android');
    var html = document.getElementsByTagName('html')[0];
    if (classNames.length)
        classNames.push('on-device');
    if (html.classList)
        html.classList.add.apply(html.classList, classNames);
    setBackground();
}
try {
    main();
    loaded = true;
}
catch (_ex) {
    let ex = _ex;
    let msg = ex.name + "<br>" + ex.message + "<br>" + ex.stack || "";
    document.body.innerHTML = msg.replace("\n", "<br>");
    throw ex;
}
//# sourceMappingURL=main.js.map