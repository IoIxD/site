"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var InvalidPageError = /** @class */ (function () {
    function InvalidPageError(page) {
        this.name = "InvalidPageError";
        this.message = "Invalid page '".concat(page, "' given");
    }
    return InvalidPageError;
}());
var WindowAlreadyRemovedError = /** @class */ (function () {
    function WindowAlreadyRemovedError(page) {
        this.name = "WindowAlreadyRemovedError";
        this.message = "Tried to remove window '".concat(page, "' but it was already removed.");
    }
    return WindowAlreadyRemovedError;
}());
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
document.addEventListener("mousedown", function (e) {
    if (e.which != 1) {
        return;
    }
    mouseDown = 1;
    if (hoveredWin) {
        mx_o = e.pageX;
        my_o = e.pageY;
        var ex = hoveredWin.style.left;
        var ey = hoveredWin.style.top;
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
});
document.addEventListener("mouseup", function () {
    mouseDown = 0;
    if (movingWindow) {
        var el = hoveredWin;
        if (el == null) {
            return;
        }
        movingWindowReset();
        movingWindowDetect(el);
    }
});
var properties = getJSON(window.location.protocol + "//" + window.location.host + "/resources/pages/properties.json");
var fake_windows = {};
var FakeWindow = /** @class */ (function () {
    function FakeWindow(page, exoptions, removePrevious) {
        if (exoptions === void 0) { exoptions = ""; }
        if (removePrevious === void 0) { removePrevious = true; }
        this.options = [];
        if (properties[page] === undefined) {
            var url = window.location.pathname.replace('.html', '');
            page = url.replace('/', '');
            var pageRoot = url.split("/")[0] ? 0 : url.split("/")[1];
            var pageToMatch = pageRoot;
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
            this.width = properties["".concat(pageToMatch)].width;
            this.height = properties["".concat(pageToMatch)].height;
            this.left = properties["".concat(pageToMatch)].left;
            this.top = properties["".concat(pageToMatch)].top;
            this.options = properties["".concat(pageToMatch)].options.split(" ");
            this.title = properties["".concat(pageToMatch)].name;
        }
        else {
            this.width = properties["".concat(page)].width;
            this.height = properties["".concat(page)].height;
            this.left = properties["".concat(page)].left;
            this.top = properties["".concat(page)].top;
            this.options = properties["".concat(page)].options.split(" ");
            this.title = properties["".concat(page)].name;
        }
        this.page = page;
        this.exoptions = exoptions;
        this.removePrevious = removePrevious;
        this.linked_element = null;
        if (document.getElementById(page) || page == null) {
            throw new InvalidPageError(page);
        }
    }
    return FakeWindow;
}());
function addFakeWindowToDOM(win) {
    var _a, _b, _c;
    for (var key in fake_windows) {
        var value = fake_windows[key];
        if (value == undefined) {
            continue;
        }
        if (!(value === null || value === void 0 ? void 0 : value.options.includes("noanim"))) {
            (_a = value.linked_element) === null || _a === void 0 ? void 0 : _a.classList.add('noanim');
        }
        if (win.removePrevious && onPhone) {
            removeFakeWindowFromDOM(value);
        }
    }
    if (onPhone) {
        win.options.push("noanim");
    }
    if (!win.options.includes("noanim")) {
        document.documentElement.style.setProperty('--iw', win.width);
        document.documentElement.style.setProperty('--ih', win.height);
        document.documentElement.style.setProperty('--ix', win.left);
        document.documentElement.style.setProperty('--iy', win.top);
        document.documentElement.style.setProperty('--mpx', mx + "px");
        document.documentElement.style.setProperty('--mpy', my + "px");
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
    var pageUrl;
    if (win.options.includes("dirlist")) {
        pageUrl = "/resources/pages/dirlist.php?dir=pages/".concat(win.page, "/");
    }
    else {
        pageUrl = "/resources/pages/".concat(win.page, ".php");
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
            var option = win.options[i].replace(/\s/g, "");
            if (option != "") {
                div.classList.add(option);
            }
        }
    }
    // skip ahead a bit 
    div.innerHTML += "\n  <span class=\"titlebar\">\n      <span class='tl_lines'></span>\n      <span onclick=\"windowRemove('".concat(win.page, "');\"class='tl_button close'></span>\n      <span class=\"title\">") + win.title + "</span>\n      <span onclick=\"windowMaximizeToggle(this.parentElement.parentElement);\" class='tl_button maxmin'></span>\n      <span onclick=\"windowShadeToggle(this.parentElement.parentElement);\" class='tl_button shade'></span>\n    </span>\n    ";
    div.innerHTML += titlebar_additions;
    // create the contents div and properly add it to the div.
    var contents = document.createElement("span");
    contents.classList.add("content");
    if (win.options.length != 0) {
        for (var i in win.options) {
            var option = win.options[i].replace(/\s/g, "");
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
    (_b = div.querySelector(".titlebar")) === null || _b === void 0 ? void 0 : _b.addEventListener("mouseenter", function (e) {
        var target = e.target;
        if (target == null) {
            return;
        }
        var parentElement = target.parentElement;
        if (parentElement == null) {
            return;
        }
        movingWindowDetect(parentElement);
    });
    (_c = div.querySelector(".titlebar")) === null || _c === void 0 ? void 0 : _c.addEventListener("mouseleave", function (e) {
        if (!movingWindow) {
            movingWindowReset();
        }
    });
}
function removeFakeWindowFromDOM(win) {
    var _a;
    movingWindowReset();
    (_a = document.getElementById(win.page)) === null || _a === void 0 ? void 0 : _a.remove();
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
        var windows = getWindows();
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
    var height = el.style.height;
    var heightasInt = 0;
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
        var newTop = (+(e.pageY - my_o) + +wy_o);
        var newLeft = (+(e.pageX - mx_o) + +wx_o);
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
});
/**
 * @deprecated This function still exists because some old html/php pages use it, but it shouldn't be used internally.
 */
function windowCreate(name, exoptions, removePrevious) {
    if (exoptions === void 0) { exoptions = ""; }
    if (removePrevious === void 0) { removePrevious = true; }
    var window = new FakeWindow(name, exoptions, removePrevious);
    fake_windows[name] = window;
    addFakeWindowToDOM(window);
}
/**
 * @deprecated This function still exists because some old html/php pages use it, but it shouldn't be used internally.
 */
function windowRemove(name) {
    var window = fake_windows[name];
    if (window == undefined) {
        throw new WindowAlreadyRemovedError(name);
    }
    removeFakeWindowFromDOM(window);
    fake_windows[name] = undefined;
}
// quick and dirty function to open the three windows from the first icon, one after the other.
function OpenTheThree() {
    var main_windows = [
        new FakeWindow("main", "", false),
        new FakeWindow("top-languages", "", false),
        new FakeWindow("github-stats", "", false),
        new FakeWindow("likes", "", false)
    ];
    main_windows.forEach(function (win) {
        fake_windows[win.page] = win;
        addFakeWindowToDOM(win);
    });
}
function setPageContents(elem, url) {
    return fetch(url)
        .then(function (t) { return t.text(); })
        .then(function (t) {
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
function setBackground() {
    return __awaiter(this, void 0, void 0, function () {
        var url, folders, random, file, maxSize;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = window.location.protocol + "//" + window.location.hostname + port;
                    folders = ["checkerland", "dimension_352", "mindisafuck", "troll_98", "weecee_wallpaper_1"];
                    random = folders[Math.ceil(Math.random() * folders.length - 1)];
                    file = "";
                    maxSize = +(screen.width + "" + screen.height);
                    return [4 /*yield*/, fetch(url + "/resources/pages/art/" + random + "/")
                            .then(function (r) { return r.text(); })
                            .then(function (r) {
                            console.log(url + "/resources/pages/art/" + random + "/");
                            var page = document.createElement("html");
                            page.innerHTML = r;
                            var links = page.querySelectorAll(".a p");
                            for (var i in links) {
                                var link = links[i];
                                if (link.innerHTML === undefined) {
                                    continue;
                                }
                                console.log(link);
                                if (link.innerHTML.includes("png")) {
                                    var numbers = +(link.innerHTML.replace(/([^0-9])/g, ''));
                                    if (numbers <= maxSize) {
                                        file = "/resources/pages/art/" + random + "/" + link.innerHTML;
                                    }
                                }
                            }
                        })];
                case 1:
                    _a.sent();
                    console.log(file);
                    // now we want to fetch the contents of that link and set the page's background to it
                    document.body.style.backgroundImage = "url(\"" + file + "\")";
                    return [2 /*return*/];
            }
        });
    });
}
// XEYES
function xeyesCheck(e) {
    var xeyes = Array.from(document.querySelectorAll(".xeye"));
    xeyes.forEach(function (eye) {
        var top = +(eye.style.top.replace("px", ""));
        var left = +(eye.style.left.replace("px", ""));
        var parent = document.querySelector("#xeyes");
        var y = (e.clientY - top) - +(parent.style.top.replace("px", ""));
        var x = (e.clientX - left) - +(parent.style.left.replace("px", ""));
        console.log(parent.style.top.replace("px", ""));
        var deg = (Math.atan2(y, x)) * 180 / Math.PI;
        var inner = eye.querySelector(".inner");
        inner.style.transform = "rotate(".concat(deg, "deg)");
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
    if (navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i)) {
        onPhone = true;
    }
    else {
        onPhone = false;
    }
    var page = window.location.pathname.replace('.html', '').replace('/', '');
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
main();
//# sourceMappingURL=main.js.map