function loadImg(file) {
    let img = new Image();
    img.src = URL.createObjectURL(file.files[0]);
    img.onload = function() {
        let cvs = document.getElementById('imgCanvas'),
            ctx = cvs.getContext('2d'),
            width = cvs.parentElement.offsetWidth;
            console.log(`${img.width}x${img.height}`);
        cvs.width  = width;
        cvs.height = width * img.height / img.width;
        console.log(`${cvs.width}x${cvs.height}`);
        ctx.drawImage(this, 0, 0, cvs.width, cvs.height);
        let data = ctx.getImageData(0, 0, cvs.width, cvs.height),
            pixels = data.data;
        console.log(`${cvs.width}x${cvs.height}`);
        let rgb = [0, 0, 0];
        for (let i = 0; i < pixels.length; i += 4) {
            rgb[0] += pixels[i];
            rgb[1] += pixels[i+1];
            rgb[2] += pixels[i+2];
        }
        rgb = rgb.map(x => Math.round(x / (pixels.length / 4)));
        console.log(`avg: rgb(${rgb.join(', ')})`);
        let hex = rgb2hex(...rgb),
            cmy = rgb2cmy(...rgb),
            cmyk = rgb2cmyk(...rgb),
            hsv = rgb2hsv(...rgb),
            hsl = rgb2hsl(...rgb);
        $('#hex' ).text('#' + hex);
        $('#rgb' ).text(`(${rgb.join(', ')})`);
        $('#cmy' ).text(`(${cmy.join('%, ')}%)`);
        $('#cmyk').text(`(${cmyk.join('%, ')}%)`);
        $('#hsv' ).text(`(${hsv[0]}°, ${hsv[1]}%, ${hsv[2]}%)`);
        $('#hsl' ).text(`(${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%)`);
        $('#color').css('background-color', '#' + hex);
    }
}

const   rgb2hex = (r, g, b) => [r, g, b].map(x => x.toString(16).toUpperCase().padStart(2, '0')).join(''),
        rgb2cmy = (r, g, b) => [r, g, b].map(x => Math.round(100 - x * 20 / 51)),
        rgb2cmyk = (r, g, b) => {
            let rgb = [r, g, b].map(x => x * 20 / 51);
                k = Math.round(100 - Math.max(...rgb));
            return rgb.map(x => Math.round((1 - x - k) / (1 - k))).concat(k);
        },
        rgb2hsv = (r, g, b) => {
            let rgb = [r,g,b], hsv = [0,0,0],
                max = Math.max(...rgb),
                min = Math.min(...rgb);
            if (max == min) hsv[0] = 0;
            else {
                [0,1,2].forEach(i => {if (max == rgb[i]) {
                    let h = (rgb[i>1 ? i-2 : i+1] - rgb[i>0 ? i-1 : i+2]) / (max - min) + 2 * i;
                    hsv[0] = (h > 0 ? h : h + 6) * 60;
                }});
            }
            hsv[1] = max == 0 ? 0 : 100 - 100 * min / max;
            hsv[2] = max * 20 / 51;
            return hsv.map(x => Math.round(x))
        },
        rgb2hsl = (r, g, b) => {
            let rgb = [r,g,b].map(x => x * 20 / 51),
                hsl = [0,0,0],
                max = Math.max(...rgb),
                min = Math.min(...rgb);
            if (max == min) hsl[0] = 0;
            else {
                [0,1,2].forEach(i => {if (max == rgb[i]) {
                    let h = (rgb[i>1 ? i-2 : i+1] - rgb[i>0 ? i-1 : i+2]) / (max - min) + 2 * i;
                    hsl[0] = (h > 0 ? h : h + 6) * 60;
                }});
            }
            hsl[2] = (max + min) / 2;
            if (hsl[2] == 0 || max == 0) hsl[1] = 0;
            else hsl[1] = (max - min) * 50 / (hsl[2] >= 50 ? 100 - hsl[2] : hsl[2]);
            return hsl.map(x => Math.round(x));
        };