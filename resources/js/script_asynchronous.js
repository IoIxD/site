// the second part of the windowCreate function, asynchronously
async function windowCreatePart2Asynchronous(page,width,height,left,top,options,title,titlebar_additions) {
  pageContents = await fetch(pageUrl).then(r => r.text())
  windowCreatePart3(page,pageContents,width,height,left,top,options,title,titlebar_additions);
}

// asynchronous getJSON code
async function getJSON(url) {
  return await fetch(url)
  .then(r => r.json())
}

// file for filling the site with content, asynchronously, if javascript is enabled.
async function fillSite(url) {
  fetch(url).then(r => r.text()).then(r => {
    document.open();
    document.write(r);
    document.close();
  })
}