var rpio = require("rpio");

module.exports.VERSION = "0.0.1";
var DATA_PIN = 16;
var CLOCK_PIN = 18;
var pixelCount = 16;
var pixelsPerChannel = 8;
var defaultBrightness = 7;
var pixels = [];

var _start = function () {
	rpio.write(DATA_PIN, 0);
	for (var i = 0; i < 32; i++) {
		rpio.write(CLOCK_PIN, 1);
		rpio.write(CLOCK_PIN, 0);
	}
};

var _end = function () {
	rpio.write(DATA_PIN, 0);
	for (var i = 0; i < 36; i++) {
		rpio.write(CLOCK_PIN, 1);
		rpio.write(CLOCK_PIN, 0);
	}
};

var _writeByte = function (byte) {
	for (var x = 0; x < 8; x++) {
		rpio.write(DATA_PIN, byte & 0b10000000);
		rpio.write(CLOCK_PIN, 1);
		byte <<= 1;
		rpio.write(CLOCK_PIN, 0);
	}
};


function init() {

	for (var pixel = 0; pixel < pixelCount; pixel++) {
		pixels.push({
			red: 0,
			green: 0,
			blue: 0,
			brightness: defaultBrightness
		});
	}

	rpio.open(DATA_PIN, rpio.OUTPUT);
	rpio.open(CLOCK_PIN, rpio.OUTPUT);
}

function changeAllPixelColours(red, green, blue, brightness) {
	for (var pixel = 0; pixel < pixelCount; pixel++) {
		pixels[pixel].red = red;
		pixels[pixel].green = green;
		pixels[pixel].blue = blue;
		pixels[pixel].brightness = brightness || pixels[pixel].brightness;
	}
}

function changeSinglePixel(arrayIndex, red, green, blue, brightness) {
	pixels[arrayIndex].red = red;
	pixels[arrayIndex].green = green;
	pixels[arrayIndex].blue = blue;
	pixels[arrayIndex].brightness = brightness || pixels[arrayIndex].brightness;
}

function redraw() {
	_start();
	for (var i = 0; i < pixels.length; i++) {
		_writeByte(0b11100000 | pixels[i].brightness);
		_writeByte(Number(pixels[i].blue) & 0xff);
		_writeByte(Number(pixels[i].green) & 0xff);
		_writeByte(Number(pixels[i].red) & 0xff);
	}
	_end();
}

function destroy() {
	_close();
}

function currentPixels() {
	console.log(pixels);
}

function turnAllOffInstantly(){
	changeAllPixelColours(0, 0, 0);
	redraw();
}

module.exports.init = init;
module.exports.changeAllPixelColours = changeAllPixelColours;
module.exports.changeSinglePixel = changeSinglePixel;
module.exports.redraw = redraw;
module.exports.currentPixels = currentPixels;
module.exports.turnAllOffInstantly = turnAllOffInstantly;