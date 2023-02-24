"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XUtils;
(function (XUtils) {
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    XUtils.random = random;
    function getBase64Image(img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
    XUtils.getBase64Image = getBase64Image;
})(XUtils = exports.XUtils || (exports.XUtils = {}));
