let rpio = require("rpio");

let DATA_PIN = 16;
let CLOCK_PIN = 18;
let BFF_PIN = 29;
let BPP_PIN = 31;
let BRW_PIN = 33;
let BUP_PIN = 36;
let BDN_PIN = 37;
let BOF_PIN = 32;
let pixelCount = 16;
let pixelsPerChannel = 8;
let defaultBrightness = 7;
let pixels = [];
let registeredClickHandler;

let _start = function () {
	rpio.write(DATA_PIN, 0);
	for (let i = 0; i < 32; i++) {
		rpio.write(CLOCK_PIN, 1);
		rpio.write(CLOCK_PIN, 0);
	}
};

let _end = function () {
	rpio.write(DATA_PIN, 0);
	for (let i = 0; i < 36; i++) {
		rpio.write(CLOCK_PIN, 1);
		rpio.write(CLOCK_PIN, 0);
	}
};

let _writeByte = function (byte) {
	for (let x = 0; x < 8; x++) {
		rpio.write(DATA_PIN, byte & 0b10000000);
		rpio.write(CLOCK_PIN, 1);
		byte <<= 1;
		rpio.write(CLOCK_PIN, 0);
	}
};

let _closeButtons = function() {
	rpio.close(BFF_PIN);
	rpio.close(BPP_PIN);
	rpio.close(BRW_PIN);
	rpio.close(BUP_PIN);
	rpio.close(BDN_PIN);
	rpio.close(BOF_PIN);
};

let _close = function () {
	rpio.close(DATA_PIN);
	rpio.close(CLOCK_PIN);
	_closeButtons();
};

let _getBrightness = function (brightness) {
	return Number(31.0 * brightness) & 0b111111;
};

let _validateBrightness = function (brightness) {
	if (brightness > 1.0 || brightness < 0.1) {
		throw 'Brightness must be between 0.1 and 1.0, provided was ' + brightness;
	}
};

let _interimButtonClickHandler = function (pin) {
	let state = rpio.read(pin) ? 0 : 1;
	registeredClickHandler(pin, state);
};

function init_led(customBrightness) {
	let brightnessToUse = defaultBrightness;

	if (customBrightness) {
		_validateBrightness(customBrightness);
		brightnessToUse = _getBrightness(customBrightness);
	}

	for (let pixel = 0; pixel < pixelCount; pixel++) {
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

	registeredClickHandler = handlerFunction;

	rpio.poll(BFF_PIN, _interimButtonClickHandler);
	rpio.poll(BPP_PIN, _interimButtonClickHandler);
	rpio.poll(BRW_PIN, _interimButtonClickHandler);
	rpio.poll(BUP_PIN, _interimButtonClickHandler);
	rpio.poll(BDN_PIN, _interimButtonClickHandler);
	rpio.poll(BOF_PIN, _interimButtonClickHandler);
}

function changeSinglePixel(arrayIndex, red, green, blue, redraw, changeBrightness) {
	let newBrightness = null;

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
	let validChannels = [0, 1];
	let newBrightness = null;

	if (validChannels.indexOf(Number(channel)) === -1) {
		throw 'Provided channel (' + channel + ') was invalid. Please provide either 0 or 1';
	}

	if (changeBrightness) {
		_validateBrightness(changeBrightness);
		newBrightness = _getBrightness(changeBrightness);
	}

	let startingPosition = channel === 0 ? channel : pixelsPerChannel;
	let endingPosition = channel === 0 ? channel + (pixelsPerChannel - 1) : (pixelsPerChannel * 2) - 1;

	for (let i = startingPosition; i <= endingPosition; i++) {
		pixels[i].red = red;
		pixels[i].green = green;
		pixels[i].blue = blue;
		pixels[i].brightness = newBrightness || pixels[i].brightness;
	}

	if (redraw) {
		this.redraw();
	}
}

function getButtonPins(){
	let buttons = [];
	
	buttons.push({
		pin : BFF_PIN,
		name : "FAST_FORWARD"
	});

	buttons.push({
		pin : BPP_PIN,
		name : "PLAY_PAUSE"
	});

	buttons.push({
		pin : BRW_PIN,
		name : "REWIND"
	});

	buttons.push({
		pin : BUP_PIN,
		name : "VOL_UP"
	});

	buttons.push({
		pin : BDN_PIN,
		name : "VOL_DOWN"
	});

	buttons.push({
		pin : BOF_PIN,
		name : "POWER"
	});

	return buttons;
}

function changeAllPixels(red, green, blue, redraw, changeBrightness) {
	let newBrightness = null;
	if (changeBrightness) {
		_validateBrightness(changeBrightness);
		newBrightness = _getBrightness(changeBrightness);
	}

	for (let pixel = 0; pixel < pixelCount; pixel++) {
		pixels[pixel].red = red;
		pixels[pixel].green = green;
		pixels[pixel].blue = blue;
		pixels[pixel].brightness = newBrightness || pixels[pixel].brightness;
	}

	if (redraw) {
		this.redraw();
	}
}


function redraw() {
	_start();
	for (let i = 0; i < pixels.length; i++) {
		_writeByte(0b11100000 | pixels[i].brightness);
		_writeByte(Number(pixels[i].blue) & 0xff);
		_writeByte(Number(pixels[i].green) & 0xff);
		_writeByte(Number(pixels[i].red) & 0xff);
	}
	_end();
}

function turnOffAllPixels(redraw) {
	changeAllPixels(0, 0, 0);
	if (redraw) {
		this.redraw();
	}
}

function teardown(turnOff) {
	if(turnOff){
		this.turnOffAllPixels(true);
	}
	_close();
}
module.exports.init_led = init_led;
module.exports.init_buttons = init_buttons;
module.exports.changeAllPixels = changeAllPixels;
module.exports.changeSinglePixel = changeSinglePixel;
module.exports.changeAllChannelPixels = changeAllChannelPixels;
module.exports.redraw = redraw;
module.exports.turnOffAllPixels = turnOffAllPixels;
module.exports.teardown = teardown;
module.exports.getButtonPins = getButtonPins;

module.exports.VERSION = "0.0.1";
module.exports.PIXELCOUNT = pixelCount;
module.exports.CHANNEL_PIXELS = pixelsPerChannel;