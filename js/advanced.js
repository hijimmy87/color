function loadImg() {
    let img = new Image(),
        file = $('#inputImg')[0].files[0],
        src = URL.createObjectURL(file);
    img.src = src;
    $('#imgPreview').attr('src', src);
    img.onload = function() {
        console.log(new Date(), "Started");
        let cvs = document.createElement('canvas'),
            ctx = cvs.getContext('2d');
        cvs.width  = parseInt($('#inputWidth' ).val()) || img.width;
        cvs.height = parseInt($('#inputHeight').val()) || img.height * cvs.width / img.width;
        $('#w-h').text(`${cvs.width}x${cvs.height}`);
        $('#size').text(cvs.width * cvs.height);

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
                    let tmpH = 100 * (rgb[i>1 ? i-2 : i+1] - rgb[i>0 ? i-1 : i+2]) / (max - min) + 2 * i;
                    h.push(Math.round((tmpH > -0.5 ? tmpH : tmpH + 360) * 100) / 100);
                }});
            }
            s.push(Math.round(max == 0 ? 0 : 10000 - 10000 * min / max) / 100);
            v.push(Math.round(max * 2000 / 51) / 100);
        }
        console.log(new Date(), "HSV convert finished");
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
        console.log(new Date(), "All Done");
    }
}