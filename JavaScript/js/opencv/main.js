

var before, after;
/**
 * Submit handler
 */
$(() => {
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
            mask = new cv.Mat();
        cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
        cv.medianBlur(src, src, 9);
        
        cv.cvtColor(src, mask, cv.COLOR_RGB2GRAY);
        cv.threshold(mask, mask, 235, 255, cv.THRESH_BINARY);
        cv.cvtColor(mask, mask, cv.COLOR_GRAY2RGB);

        cv.bitwise_or(mask, src, src);
        cv.imshow(cvs, src);

        $('#submit').text('重新提交')
            .removeClass('btn-secondary')
            .addClass('btn-primary')
            .attr('disabled', false);

        cv.cvtColor(mask, mask, cv.COLOR_RGB2GRAY);
        cv.bitwise_not(mask, mask);
        count = cv.countNonZero(mask);
        rgb = cv.mean(src).slice(1, 3);
        console.log(rgb);
        let color = new Color('srgb', rgb).to('hsv');
        coord = color.coords.map(x => Math.round(x * 100) / 100);
        console.log(color.toString());

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
                            <tr><th scope="row">污漬數量</th><td>${count}</td></tr>
                            <tr><th scope="row">資料數</th><td>${count / (img.width * img.height) * 100} %</td></tr>
                            <tr><th scope="row">污漬顏色(平均)</th><td>hsv(${coord[0]}°, ${coord[1]}%, ${coord[2]}%)</td></tr>
                            <tr><th scope="row">下載</th><td><a download=${file.name} href="${url}">下載</a></td></tr>
                        </tbody></table></div>`);
    }
}