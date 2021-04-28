const fetch = require("node-fetch");
const jsSHA = require('jssha');

function checkContentType(contentType) {

    if(contentType.indexOf("application/pdf") !== -1){
        return true;
    }

    if(contentType.indexOf("application/xhtml+xml") !== -1){
        return true;
    }

    if(contentType.indexOf("application/xml") !== -1){
        return true;
    }

    if(contentType.indexOf("application/json") !== -1){
        return true;
    }

    if(contentType.indexOf("image/jpeg") !== -1){
        return true;
    }

    if(contentType.indexOf("image/jpeg") !== -1){
        return true;
    }

    if(contentType.indexOf("image/jpg") !== -1){
        return true;
    }

    if(contentType.indexOf("image/png") !== -1){
        return true;
    }

    if(contentType.indexOf("image/tiff") !== -1){
        return true;
    }

    if(contentType.indexOf("image/svg+xml") !== -1){
        return true;
    }

    if(contentType.indexOf("image/svg") !== -1){
        return true;
    }

    if(contentType.indexOf("text/xml") !== -1){
        return true;
    }

    if(contentType.indexOf("text/plain") !== -1){
        return true;
    }

    if(contentType.indexOf("text/csv") !== -1){
        return true;
    }

    return false;
}

exports.hashDocument = async (url) => {
    try {
        const shaObj = new jsSHA('SHA3-512', 'ARRAYBUFFER', { encoding: 'UTF8' });
        const response = await fetch(url, { responseType: 'blob' });
        const contentType = response.headers.get("content-type");
        if (contentType != '' && checkContentType(contentType) == true) {
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();
            shaObj.update(buffer);
            return shaObj.getHash('HEX');
        } else {
            throw Error(`URL contains Document of unsupported content-type <strong>(${contentType})</strong>. Supported content-types are <b>PDF, XML, JPEG, PNG, SVG, CSV, TXT and TIFF</b>.`);
        }
    }
    catch (err) {
        throw err;
    }
}


exports.hashPassword = async (password) => {
    try{
        const shaObj = new jsSHA('SHA3-512', 'TEXT');
        shaObj.update(password);
        return shaObj.getHash('HEX');
    }
    catch (err) {
        throw Error(err+'. Could not hash given password');
    }
}