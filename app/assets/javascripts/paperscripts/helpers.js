window.int = function(n) {
    return Math.floor(n);
};

window.random = function(low, high) {
    if (high === undefined) {
        high = low;
        low = 0;
    }
    return Math.random() * (high - low) + low;
}

window.hexToRGB = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

window.componentToHex = function(c) {
    var hex = int(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

window.rgbToHex = function(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

window.lerp = function(a, b, n) {
    return Math.abs((b - a) * n + a);
};

window.lerpColor = function(beginning, end, percent) {
    var c1 = hexToRGB(beginning);
    var c2 = hexToRGB(end);
    return rgbToHex(
        lerp(c1.r, c2.r, percent),
        lerp(c1.g, c2.g, percent),
        lerp(c1.b, c2.b, percent)
    );
};

window.map = function(v, a1, b1, a2, b2) {
    return (((v-a1) / (b1 - a1)) * (b2 - a2) + a2);
};

