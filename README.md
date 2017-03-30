# phatbeat-node
#### Support for the Pimoroni pHATBEAT Device via Node.js

This package gives basic control over the LEDs and buttons included on the pHATBEAT device. This will allow you to integrate their support into your own node projects.

#### Installing

TODO: installing

#### Usage

There are two main areas of functionality available to use, LED control and button monitoring.

###### Button Monitoring

Buttons are made monitorable by utilising a readable stream within node. The buttons are initialised using the GPIO pin number (the rpio library uses the physical numbering system rather than the BCM). To make this easier, an array containing Pin Number vs button type.

```javascript
let phatbeat = require('phatbeat');
let buttons = phatbeat.getButtonPins();
console.log(buttons);
/*
[ { pin: 29, name: 'FAST_FORWARD' },
  { pin: 31, name: 'PLAY_PAUSE' },
  { pin: 33, name: 'REWIND' },
  { pin: 36, name: 'VOL_UP' },
  { pin: 37, name: 'VOL_DOWN' },
  { pin: 32, name: 'POWER' } ]
*/
```

To initialise and attach to a button stream:

```javascript
let phatbeat = require('phatbeat');
//this attaches the monitoring to the underlying GPIO pin
let fastForwardStream = phatbeat.ButtonStream(29);
```
You are able to either consume the underlying stream directly or attach to events specifically.

**Stream Based**

```javascript
//This will instantly pipe out the results of the stream to the terminal window. The format will be pin number, state (29,1). The state will either be 1 (pressed) or 0 (released)
fastForwardStream.pipe(process.stdout)
```

**Event Based**

```javascript
//Three events are exposed and are emitted whenever an underlying state change is detected
fastForwardSteam.on("pinChange", function(pin, pinState){
    //pin is the pin number that has triggered
    //pin state is either 1 (pressed) or 0 (released)
});

fastForwardSteam.on("monitoring", function(pin){
    //pin is the pin number that has been attached for monitoring
});

fastForwardSteam.on("end", function(pin){
    //pin is the pin number that has been attached for monitoring
});
```

As the readable streams are ... only readable, in order to 'detach' the events and release the pin from monitoring (as well as trigging the 'end' event), the initialised button can be held for over 5 seconds and then released. This may well be changed to something more accessible and obvious in future!

###### LED Control

TODO: LED Control usage

#### Dependencies

- rpio

This is the core package used to communicate directly with the pHATBEAT over the GPIO pins. In testing, this was the fastest performing of the npm packages which I tried out. This was essential for being able to quickly toggle the LEDs etc. Other packages had responses around 1000ms to issue a command via the GPIO pins whereas this package has 

#### Dev Dependencies

- express
- fs
- path
- babel-cli
- babel-present-env
- jest

Half are used purely in the examples to show the possible functionality.

#### Examples

- **button_events**

An example showing the event based control of the hardware buttons.

- **button_stream**

An example showing the direct readable consumption of the button stream.

- **button-web**

An example showing writing events from the button stream out to a webpage for monitoring, control etc.

- **led_control**

A form to show that the LEDs can be controlled via a web portal.

- **scroll**

A simple test to show the speed at which LED states can be altered, it seems to be able to consistantly issue a LED on / LED off toggle within a 100ms window. Due to the way that the LEDs are changed via the pHATBEAT (all LED statuses are written via the data pin for every operation), this is fundamentally the same as being able to change the status of every LED to a different colour and off again (or to a different colour) within this 100ms period.

#### Tests

As almost all of the functionality of the code is based on hardware dependencies, the only things that can really be tested are the underlying configuration of what is available on the pHATBEAT. The number of LEDs and buttons are confirmed as matching the current hardware specification (16 LEDs (8 per channel) and 6 hardware buttons).

#### License

TODO: license