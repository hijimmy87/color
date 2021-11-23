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
        rgb = rgb.map(x => Math.round(x / (pixels.length / 4)));
        let hex  = colorConvert.rgb2hex(...rgb),
            cmy  = colorConvert.rgb2cmy(...rgb),
            cmyk = colorConvert.rgb2cmyk(...rgb),
            hsv  = colorConvert.rgb2hsv(...rgb),
            hsl  = colorConvert.rgb2hsl(...rgb);
        $('#hex' ).text('#' + hex);
        $('#rgb' ).text(`(${rgb.join(', ')})`);
        $('#cmy' ).text(`(${cmy.join('%, ')}%)`);
        $('#cmyk').text(`(${cmyk.join('%, ')}%)`);
        $('#hsv' ).text(`(${hsv[0]}°, ${hsv[1]}%, ${hsv[2]}%)`);
        $('#hsl' ).text(`(${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%)`);
        $('#color').css('background-color', '#' + hex);
    }
}