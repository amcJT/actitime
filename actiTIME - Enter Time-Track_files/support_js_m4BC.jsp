

/**
 * Creates iframe with properties specified as parameters
 *
 * @param frameId   frame id
 * @param frameSrc  frame source
 * @param callBack  "onload" handler
 */
function createWorkFrame(frameId, frameSrc, onloadHandler){

    var iframe = document.getElementById(frameId);

    // If frame already exists remove it
    if(iframe){
        document.body.removeChild(iframe);
    }

    iframe = document.createElement("IFRAME");  // Create iframe
    iframe.id = frameId;    // Set frame id
    iframe.src = frameSrc;  // Set frame source
    iframe.style.visibility = 'hidden'; // Not visible
    iframe.frameBorder = 0; // No border and margins, takes no space
    iframe.height = 0;
    iframe.width = 0;
    iframe.marginHeight = 0;
    iframe.marginWidth = 0;
    document.body.appendChild(iframe);  // Add iframe to document body

    addOnloadHandler(iframe, onloadHandler)// Add onload event listener
    return iframe;
}

/**
 * Adds onload evenet handler to element
 * @param element element to add handler to
 * @param onloadHandler handler method
 */
function addOnloadHandler(element, onloadHandler){

    // If no handler specified simply exit
    if(onloadHandler == null){

        return;
    }

    // If FireFox
    if(element.addEventListener){

        element.addEventListener("load", onloadHandler, false);
    }
    else{
        // Otherwise IE assumed
        element.attachEvent("onload", onloadHandler);
    }
}