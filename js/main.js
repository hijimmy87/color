function loadImg(file) {
    let img = new Image();
    img.src = URL.createObjectURL(file.files[0]);
    img.onload = function() {
        let cvs = $('#imgCanvas')[0],
            ctx = cvs.getContext('2d'),
            width = cvs.parentElement.offsetWidth;
        cvs.width  = width;
        cvs.height = width * img.height / img.width;
        ctx.drawImage(this, 0, 0, cvs.width, cvs.height);
        let data = ctx.getImageData(0, 0, cvs.width, cvs.height),
            pixels = data.data;
        let rgb = [0, 0, 0];
        for (let i = 0; i < pixels.length; i += 4) {
            rgb[0] += pixels[i];
            rgb[1] += pixels[i+1];
            rgb[2] += pixels[i+2];
        }
        let color = new Color('sRGB', rgb.map(x => x / (pixels.length / 4) / 255.0));
        let $table = $('#colorTable tbody');
        $table.append(`<tr><th scope="row">HEX</th><td>${color.hex.toUpperCase()}</td></tr>`);
        for (let space of Object.keys(Color.spaces)) {
            $table.append(`<tr><th scope="row">${space}</th><td>${color.to(space)}</td></tr>`);
        }
        $('#color').css('background-color', color.hex);
    }
}