const colorConvert = {
    rgb2hex(r, g, b) {
        return [r, g, b].map(x => x.toString(16).toUpperCase().padStart(2, '0')).join('');
    },
    rgb2cmy(r, g, b) {
        return [r, g, b].map(x => Math.round(100 - x * 20 / 51));
    },
    rgb2cmyk(r, g, b) {
        let k = Math.max(...[r, g, b]);
        return [r, g, b].map(x => Math.round((k - x) / k * 100))
                        .concat(Math.round(100 - k * 20 / 51));
    },
    rgb2hsv(r, g, b) {
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
    rgb2hsl(r, g, b) {
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
    }
}