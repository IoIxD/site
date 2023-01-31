function setPageContents(element, page) {
    $.get(page, function(text) {
        $(element).html(text);
    })
}