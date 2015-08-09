window.throttle = function(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
    deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
};

window.roundTo = function(n, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(n*factor)/factor;
};

window.fixAngle = function(rads) {
    return -rads + Math.PI/2; //but why? :(
};

window.toDegrees = function(angle) {
    return angle / Math.PI * 180;
};

window.toCartesian = function(radius, angle) {
    return new Point(radius*Math.cos(angle), radius*Math.sin(angle));
};


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
    var result;
    if (/^#?[a-f\d]{3}$/i.exec(hex)) {
        result = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
        for (var i=1; i<=3; i++) {
            result[i] += result[i];
        }
    } else {
        result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
    }
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

