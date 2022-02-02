/**
 * Submit handler
 */
$(() => {
    $('#openCV').on('load',() => {
        $('#loadingOpenCV').remove();
    });
    $('form').submit(() => { 
        try {
            $('#submit').text('處理中...')
                        .removeClass('btn-primary')
                        .addClass('btn-secondary')
                        .attr('disabled', true);
            setTimeout(() => {
                process('#before', '清洗前', ratio);
                process('#after', '清洗後', ratio);
                $('#submit').text('重新提交')
                        .removeClass('btn-secondary')
                        .addClass('btn-primary')
                        .attr('disabled', false);
            }, 100);
        } catch (error) {
            alert(`Some Error happened. Please try again.\n\n ${error}`);
        }
    });
});
/**
 * Processes the image.
 */
function process(imgSelector, title) {
    let img = $('<img>')[0],
        file = $(imgSelector)[0].files[0];
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        let cvs = $('<canvas class="w-100">')[0];

        // image ratio
        if ($('#ratio').prop('checked')) {
            if (width = parseInt($('#width').val())) {
                let ratio = width / img.width;
                img.width = width;
                img.height *= ratio;
            }
            else {
                let ratio = (parseInt($('#height').val()) || img.height) / img.height;
                img.width  *= ratio;
                img.height *= ratio;
            }
        }
        else {
            img.width  ||= parseInt($('#width' ).val());
            img.height ||= parseInt($('#height').val()) || img.height;
        }

        let src  = cv.imread(img),
            dst  = new cv.Mat();
        cv.medianBlur(src, src, 9);
        cv.threshold(src, dst, 200, 255, cv.THRESH_TRUNC);

        cv.imshow(cvs, dst);
        src.delete();

        $('#submit').text('重新提交')
            .removeClass('btn-secondary')
            .addClass('btn-primary')
            .attr('disabled', false);

        let data = cvs.getContext('2d').getImageData(0, 0, cvs.width, cvs.height).data;
        let R = 0, G = 0, B = 0;
        let counter = 0;
        for (let i = 0; i < data.length; i += 4) {
            let rgb = Array.from(data.slice(i, i + 3))
            if (rgb[0]==200&&rgb[1]==200&&rgb[2]==200) continue
            counter++;
            R += rgb[0];
            G += rgb[1];
            B += rgb[2];
        }
        let avg = [R, G, B].map(x => x / counter),
            color = new Color('hsv', avg).to('HSV');

        let url = cvs.toDataURL('image/jpg');

        let $main = $('main'),
            $info = $('<div class="row mb-3">');
        $main.append($info);
        $info.append(`<h3>${title}</h3>`);
        $info.append($('<div class="col col-12 col-md-4"></div>').append(cvs));
        $info.append(  `<div class="col col-12 col-md-8"><table class="table table-hover">
                        <thead><tr><th scope="col">基本資訊</th><th scope="col">數值</th></tr></thead>
                        <tbody>
                            <tr><th scope="row">檔案名稱</th><td>${file.name}</td></tr>
                            <tr><th scope="row">解析度</th><td>${img.width}x${img.height}</td></tr>
                            <tr><th scope="row">樣本數</th><td>${img.width * img.height}</td></tr>
                            <tr><th scope="row">污漬數量</th><td>${counter}</td></tr>
                            <tr><th scope="row">資料數</th><td>${counter / (img.width * img.height) * 100} %</td></tr>
                            <tr><th scope="row">污漬顏色(平均)</th><td>${color.toString()}</td></tr>
                            <tr><th scope="row">下載</th><td><a download=${file.name} href="${url}">下載</a></td></tr>
                        </tbody></table></div>`);
    }
}