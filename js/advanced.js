function loadImg() {
    let start = new Date(), end;
    let img = new Image(),
        file = $('#inputImg')[0].files[0],
        src = URL.createObjectURL(file);
    img.src = src;
    img.classList.add('w-100');
    img.onload = function() {
        console.log(new Date().toTimeString() + "Started");
        let cvs = $('<canvas></canvas>')[0],
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
                    tmpH = Math.round(tmpH * 100) / 100;
                    if (tmpH < 0) tmpH += 360;
                    if (tmpH >= 360) tmpH -= 360;
                    h.push(tmpH);
                }});
            }
            s.push(Math.round(max == 0 ? 0 : 10000 - 10000 * min / max) / 100);
            v.push(Math.round(max * 2000 / 51) / 100);
        }
        append('#h', '色相(Hue)(°)', h);
        append('#s', '飽和度(Saturation)(%)', s);
        append('#v', '明度(Value)(%)', v);
        end = new Date();
        let delta = new Date(end - start);
        delta = `${delta.getUTCHours()} 時 ${delta.getUTCMinutes()} 分 ${delta.getUTCSeconds()}.${delta.getUTCMilliseconds()} 秒`;
        let $info = $('#info');
        $info.empty();
        $info.append($('<div class="col col-12 col-md-4"><h3>預覽圖</h3></div>').append(img));
        $info.append(  `<div class="col col-12 col-md-8"><table class="table table-hover">\
                        <thead><tr><th scope="col">基本資訊</th><th scope="col">數值</th></tr></thead>\
                        <tbody>\
                            <tr><th scope="row">原始寬高(像素)</th><td>${cvs.width}x${cvs.height}</td></tr>\
                            <tr><th scope="row">資料數</th><td>${cvs.width * cvs.height}</td></tr>\
                            <tr><th scope="row">總耗時</th><td>${delta}</td></tr>\
                        </tbody>`);
    }
}
function append(element, title, data) {
    const $element = $(element);
    $element.empty();
    let count = {};
    data.sort();
    data.forEach(x => {
        if (count[x]) count[x].y++;
        else count[x] = {x:x,y:1};
    });
    //////////////////////////////////////////////////
    let $table = $('<table class="table table-hover"></table>'),
        $thead = $(`<thead><tr><th scope="col">${title}</th><th scope="col">數值</th></tr></thead>`),
        $tbody = $('<tbody></tbody>');
    $table.append($thead);
    $table.append($tbody);
    let titles = ['最小值', '第一四分位數', '中位數', '第三四分位數', '最大值'];
    for (let i = 0; i < 5; i++) {
        let value = d3.quantile(data, 0.25 * i);
        $tbody.append(`<tr><th scope="row">${titles[i]}</th><td>${value}</td></tr>`);
    }
    let mode = d3.mode(data),
        mean = Math.round(d3.mean(data) * 100) / 100,
        dev  = Math.round(d3.deviation(data) * 100) / 100;
    $tbody.append(`<tr><th scope="row">眾數</th><td>${mode}</td></tr>\
                   <tr><th scope="row">平均值</th><td>${mean}</td></tr>\
                   <tr><th scope="row">標準差</th><td>${dev}</td></tr>`);
    $element.append($('<div class="col col-12 col-sm-6 col-md-4"></div>').html($table));
    //////////////////////////////////////////////////
    const $chart = $('<div class="col col-12 col-sm-6 col-md-8"></div>'),
          cvs = $('<canvas></canvas>')[0];
    cvs.width  = $chart.width();
    cvs.height = $chart.height();
    $chart.html(cvs);
    $element.append($chart);
    new Chart(cvs,{
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
}