function loadImg(file) {
    let img = new Image(),
        src = URL.createObjectURL(file.files[0]);
    img.src = src;
    $('#imgPreview').attr('src', src);
    img.onload = function() {
        let cvs = document.createElement('canvas'),
            ctx = cvs.getContext('2d');
        console.log(img);
        $('#w-h').text(`${img.width}x${img.height}`);
        $('#size').text(img.width * img.height);
        cvs.width  = img.width;
        cvs.height = img.height;
        ctx.drawImage(this, 0, 0, cvs.width, cvs.height);
        let data = ctx.getImageData(0, 0, cvs.width, cvs.height),
            pixels = data.data;
        let h = [], s = [], v = [];
        for (let i = 0; i < pixels.length; i += 4) {
            let rgb = [pixels[i],pixels[i+1],pixels[i+2]],
                max = Math.max(...rgb),
                min = Math.min(...rgb);
            if (max == min) h.push(0);
            else {
                [0,1,2].forEach(i => {if (max == rgb[i]) {
                    let tmpH = (rgb[i>1 ? i-2 : i+1] - rgb[i>0 ? i-1 : i+2]) / (max - min) + 2 * i;
                    h.push(Math.round((tmpH > 0 ? tmpH : tmpH + 6) * 6000) / 100);
                }});
            }
            s.push(Math.round(max == 0 ? 0 : 10000 - 10000 * min / max) / 100);
            v.push(Math.round(max * 2000 / 51) / 100);
        }
        for (let i = 0; i < 5; i++) {
            $('#h-q'+i).text(d3.quantile(h, 0.25 * i));
            $('#s-q'+i).text(d3.quantile(s, 0.25 * i));  
            $('#v-q'+i).text(d3.quantile(v, 0.25 * i));  
        }
        $('#h-mode').text(d3.mode(h));
        $('#h-mean').text(Math.round(d3.mean(h) * 100) / 100);
        $('#h-dev').text(Math.round(d3.deviation(h) * 100) / 100);
        $('#s-mode').text(d3.mode(s));
        $('#s-mean').text(Math.round(d3.mean(s) * 100) / 100);
        $('#s-dev').text(Math.round(d3.deviation(s) * 100) / 100);
        $('#v-mode').text(d3.mode(v));
        $('#v-mean').text(Math.round(d3.mean(v) * 100) / 100);
        $('#v-dev').text(Math.round(d3.deviation(v) * 100) / 100);
    }
}