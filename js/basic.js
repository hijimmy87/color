function loadImg(file) {
    let img = new Image();
    img.src = URL.createObjectURL(file.files[0]);
    img.onload = function() {
        let cvs = $('#imgCanvas')[0],
            ctx = cvs.getContext('2d');
        cvs.width  = cvs.parentElement.offsetWidth;
        cvs.height = cvs.width * img.height / img.width;
        ctx.drawImage(this, 0, 0, cvs.width, cvs.height);
        let data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
        let rgb = [0, 0, 0];
        for (let i = 0; i < data.length; i += 4) {
            rgb[0] += data[i];
            rgb[1] += data[i+1];
            rgb[2] += data[i+2];
        }
        let color = new Color('sRGB', rgb.map(x => x / (data.length / 4) / 255.0));
        let $table = $('#colorTable tbody');
        $table.append(`<tr><th scope="row">HEX</th><td>${color.hex.toUpperCase()}</td></tr>`);
        for (let space of Object.keys(Color.spaces)) {
            $table.append(`<tr><th scope="row">${space}</th><td>${color.to(space)}</td></tr>`);
        }
        $('#color').css('background-color', color.hex);
    }
}