//================================
// HTML elements
//================================

/**
 * Create HTML div element.
 * 
 * @export
 * @param {any} id 
 * @param {any} styleDisplay 
 * @returns 
 */
function createDiv(id, styleDisplay) {
    var div = document.createElement('div');
    div.id = id;
    div.style.display = styleDisplay;

    return div;
}

/**
 * Create canvas ctx and attach it to given parent HTML div element.
 * 
 * @export
 * @param {string} id 
 * @param {number} w 
 * @param {number} h 
 * @param {string} stylePosition 
 * @param {string} styleDisplay 
 * @returns 
 */
function createCanvasCtx(id, w, h, stylePosition, styleDisplay) {
    var c = document.createElement('canvas');
    c.id = id;
    c.width = w;
    c.height = h;
    c.style.position = stylePosition;
    c.style.display = styleDisplay;
    return c;
}

function createInput(id, type) {
    var input = document.createElement('input');
    input.id = id;
    input.type = type;

    return input;
}

function createButton(id, w, h, text) {
    var btn = document.createElement('button');
    btn.id = id;
    btn.innerHTML = text;

    if(w)
        btn.style.width = w + 'px';
    if(h)
        btn.style.height = h + 'px';

    return btn;
}