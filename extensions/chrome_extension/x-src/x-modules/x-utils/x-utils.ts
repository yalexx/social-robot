export namespace XUtils {

    export function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    export function getBase64Image(img) {
        // Create an empty canvas element
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // will re-encode the image.
        let dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

}