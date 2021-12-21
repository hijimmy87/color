onOpenCvReady = () => {
    $('#loadingOpenCV').remove();
};

/**
 * submit handler
 */
$(() => {
    $('form').submit(() => { 
        try {
            $('#submit').text('處理中...')
                        .removeClass('btn-primary')
                        .addClass('btn-secondary')
                        .attr('disabled', true);
            setTimeout(process, 100);
        } catch (error) {
            alert(`Some Error happened. Please try again.\n\n ${error}`);
        }
    });
});
/**
 * Processes the image.
 */
function process() {
    let img = $('<img class="w-100">')[0],
        file = $('#img')[0].files[0];
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        // timer
        let start = new Date(), end;
        console.log(start);
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
        // RGB to GrayScale
        let src = cv.imread(img);
        if ($('#GrayScale').prop('checked')) {
            cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
        }
        cv.imshow(cvs, src);
        src.delete();
        // Pixels Info
        let data = cvs.getContext('2d').getImageData(0, 0, cvs.width, cvs.height).data;
        let imgSpace = $('#imgSpace').val();
            space = $('#space').val();
        let coords = [];
        for (let i = 0; i < data.length; i += 4) {
            let rgb = Array.from(data.slice(i, i + 3))
            let color = new Color(imgSpace, rgb.map(x => Math.round(x / 51 * 20) / 100)),
                coord = color.to(space).coords.map(x => Math.round(x * 100) / 100);
            for (let j = 0; j < coord.length; j++) {
                coord[j] ||= 0;
                if (!i) coords.push([coord[j]]);
                else    coords[j].push(coord[j]);
            }
        }
        //
        let outlierPercent = $('#outlier').val();
        let titles = Object.keys(Color.space(space).coords);
        let email = $('#email').val();
        $('main').empty();
        let $main = $('main'),
            $info = $('<div class="row mb-3">');
        $main.html('<h3>預覽</h3>');
        $main.append($info);
        $main.append('<button class="btn btn-primary mb-5" type="button" onclick="location.reload()">重新提交</button>');
        $main.append('<h3>詳細數據</h3>');
        for (let i = 0; i < titles.length; i++)
            $main.append(detail(titles[i], coords[i], outlierPercent));
        // timer
        end = new Date();
        console.log(end);
        let delta = new Date(end - start);
        delta = `${delta.getUTCHours()} 時 ${delta.getUTCMinutes()} 分 ${delta.getUTCSeconds()}.${delta.getUTCMilliseconds()} 秒`;
        $info.append($('<div class="col col-12 col-md-4"></div>').append(cvs));
        $info.append(  `<div class="col col-12 col-md-8"><table class="table table-hover">
                        <thead><tr><th scope="col">基本資訊</th><th scope="col">數值</th></tr></thead>
                        <tbody>
                        <tr><th scope="row">圖片名稱</th><td>${file.name}</td></tr>
                            <tr><th scope="row">解析度</th><td>${cvs.width}x${cvs.height}</td></tr>
                            <tr><th scope="row">資料數</th><td>${cvs.width * cvs.height}</td></tr>
                            <tr><th scope="row">圖片色域</th><td>${Color.space(imgSpace).name}</td></tr>
                            <tr><th scope="row">分析使用</th><td>${Color.space(space).name}</td></tr>
                            <tr><th scope="row">耗時</th><td>${delta}</td></tr>
                        </tbody></table></div>`);
        if (email)
            alert(`你剛剛輸入了電子郵件信箱\n${email}\n\n\n\n貼心提醒\n請不要在來路不明的網站中輸入個人資訊，如電子郵件\nHiJimmy 關心您`);
    }
}
/**
 * Quantile 
 */
function quantile(array, p) {
    let len = array.length;
    if (len == 0) return array[0];
    let n;
    if (p == 0) return array[0];
    if (p == 4) return array[len - 1];
    if ((n = len * 0.25 * p) % 1 == 0) {
        return ((array[n - 1] + array[n]) / 2);
    }
    return array[Math.floor(n)];
}

/**
 * Creates the table and the chart
 */
function detail(title, data, percent = 0) {
    const $element = $('<div class="row mb-3">');
    let count = {},
        maxCount = 0,
        modes = [];
    data.sort((a,b) => a - b);
    data = data.slice(data.length * percent / 200, data.length * (1 - percent / 200));
    // Finds Modes
    for (let value of data) {
        if (count[value]) count[value].y++;
        else count[value] = {x: value, y: 1};
        if (count[value].y > maxCount) {
            maxCount = count[value].y;
            modes = [value];
        }
        else if (count[value].y == maxCount) {
            modes.push(value);
        }
    }
    // Table
    let $table = $(`<table class="table table-hover">
                    <thead><tr><th scope="col">${title}</th><th scope="col">數值</th></tr></thead>
                    <tbody></tbody>
                    </table>`),
        $tbody = $table.find('tbody');
    let titles = ['最小值', '第一四分位數', '中位數', '第三四分位數', '最大值'];
    let len = data.length;
    for (let i = 0; i < 5; i++) {
        let value = quantile(data, i);
        $tbody.append(`<tr><th scope="row">${titles[i]}</th><td>${value}</td></tr>`);
    }
    modes.forEach(mode => $tbody.append(`<tr><th scope="row">眾數</th><td>${mode}</td></tr>`));
    let mean = Math.round(data.reduce((acc, cur) => acc += cur) / len * 100) / 100,
        sd   = Math.round(Math.sqrt(data.reduce((acc, cur) => acc += Math.pow(cur - mean, 2)) / len * 100)) / 100;
    $tbody.append( `<tr><th scope="row">平均值</th><td>${mean}</td></tr>
                    <tr><th scope="row">標準差</th><td>${sd}</td></tr>`);
    $element.append($('<div class="col col-12 col-sm-6 col-md-4"></div>').html($table));
    // Chart
    const $chart = $('<div class="col col-12 col-sm-6 col-md-8"><canvas></canvas></div>'),
          cvs = $chart.children()[0];
    $element.append($chart);
    cvs.width  = $chart.width();
    cvs.height = $chart.height();
    new Chart(cvs, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '樣本',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: Object.values(count)
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: title
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '數量'
                    }
                }
            }
        }
    });
    return $element;
}