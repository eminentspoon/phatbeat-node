var rpio = require("rpio");

var DATA_PIN = 16;
var CLOCK_PIN = 18;
var BFF_PIN = 29;
var BPP_PIN = 31;
var BRW_PIN = 33;
var BUP_PIN = 36;
var BDN_PIN = 37;
var BOF_PIN = 32;
var pixelCount = 16;
var pixelsPerChannel = 8;
var defaultBrightness = 7;
var pixels = [];
var registeredHandlerEvent;

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

var _close = function () {
	rpio.close(DATA_PIN);
	rpio.close(CLOCK_PIN);
};

var _getBrightness = function (brightness) {
	return Number(31.0 * brightness) & 0b111111;
};

var _validateBrightness = function (brightness) {
	if (brightness > 1.0 || brightness < 0.1) {
		throw 'Brightness must be between 0.1 and 1.0, provided was ' + brightness;
	}
};

var _interimButtonHandler = function(pin){
		hasSkippedInitialPoll = true;
		var state = rpio.read(pin) ? 'unclicked' : 'clicked';
		registeredHandlerEvent(pin, state);
};

function init_led(customBrightness) {
	var brightnessToUse = defaultBrightness;

	if (customBrightness) {
		_validateBrightness(customBrightness);
		brightnessToUse = _getBrightness(customBrightness);
	}

	for (var pixel = 0; pixel < pixelCount; pixel++) {
		pixels.push({
			red: 0,
			green: 0,
			blue: 0,
			brightness: brightnessToUse
		});
	}

	rpio.open(DATA_PIN, rpio.OUTPUT);
	rpio.open(CLOCK_PIN, rpio.OUTPUT);
}

function init_buttons(handlerFunction) {
	if (handlerFunction === null) {
		throw "No handler function provided, buttons not mapped";
	}

	rpio.open(BFF_PIN, rpio.INPUT, rpio.PULL_UP);
	rpio.open(BPP_PIN, rpio.INPUT, rpio.PULL_UP);
	rpio.open(BRW_PIN, rpio.INPUT, rpio.PULL_UP);
	rpio.open(BUP_PIN, rpio.INPUT, rpio.PULL_UP);
	rpio.open(BDN_PIN, rpio.INPUT, rpio.PULL_UP);
	rpio.open(BOF_PIN, rpio.INPUT, rpio.PULL_UP);

	registeredHandlerEvent = handlerFunction;

	rpio.poll(BFF_PIN, _interimButtonHandler);
	rpio.poll(BPP_PIN, _interimButtonHandler);
	rpio.poll(BRW_PIN, _interimButtonHandler);
	rpio.poll(BUP_PIN, _interimButtonHandler);
	rpio.poll(BDN_PIN, _interimButtonHandler);
	rpio.poll(BOF_PIN, _interimButtonHandler);
}

function changeAllPixels(red, green, blue, redraw, changeBrightness) {
	var newBrightness = null;
	if (changeBrightness) {
		_validateBrightness(changeBrightness);
		newBrightness = _getBrightness(changeBrightness);
	}

	for (var pixel = 0; pixel < pixelCount; pixel++) {
		pixels[pixel].red = red;
		pixels[pixel].green = green;
		pixels[pixel].blue = blue;
		pixels[pixel].brightness = newBrightness || pixels[pixel].brightness;
	}

	if (redraw) {
		this.redraw();
	}
}

function changeSinglePixel(arrayIndex, red, green, blue, redraw, changeBrightness) {
	var newBrightness = null;

	if (arrayIndex > pixelCount - 1 || arrayIndex < 0) {
		throw arrayIndex + " is not valid within the array";
	}

	if (changeBrightness) {
		_validateBrightness(changeBrightness);
		newBrightness = _getBrightness(changeBrightness);
	}

	pixels[arrayIndex].red = red;
	pixels[arrayIndex].green = green;
	pixels[arrayIndex].blue = blue;
	pixels[arrayIndex].brightness = newBrightness || pixels[arrayIndex].brightness;

	if (redraw) {
		this.redraw();
	}
}

function changeAllChannelPixels(red, green, blue, channel, redraw, changeBrightness) {
	var validChannels = [0, 1];
	var newBrightness = null;

	if (validChannels.indexOf(Number(channel)) === -1) {
		throw 'Provided channel (' + channel + ') was invalid. Please provide either 0 or 1';
	}

	if (changeBrightness) {
		_validateBrightness(changeBrightness);
		newBrightness = _getBrightness(changeBrightness);
	}

	var startingPosition = channel === 0 ? channel : pixelsPerChannel;
	var endingPosition = channel === 0 ? channel + (pixelsPerChannel - 1) : (pixelsPerChannel * 2) - 1;

	for (var i = startingPosition; i <= endingPosition; i++) {
		pixels[i].red = red;
		pixels[i].green = green;
		pixels[i].blue = blue;
		pixels[i].brightness = newBrightness || pixels[i].brightness;
	}

	if (redraw) {
		this.redraw();
	}
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

function teardown() {
	_close();
}

function turnOffAllPixels(redraw) {
	changeAllPixels(0, 0, 0);
	if (redraw) {
		this.redraw();
	}
}

module.exports.init_led = init_led;
module.exports.init_buttons = init_buttons;
module.exports.changeAllPixels = changeAllPixels;
module.exports.changeSinglePixel = changeSinglePixel;
module.exports.changeAllChannelPixels = changeAllChannelPixels;
module.exports.redraw = redraw;
module.exports.turnOffAllPixels = turnOffAllPixels;
module.exports.teardown = teardown;

module.exports.VERSION = "0.0.1";
module.exports.PIXELCOUNT = pixelCount;
module.exports.CHANNEL_PIXELS = pixelsPerChannel;