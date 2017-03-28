let phat = require("../phatbeat");
let buttons = phat.getButtonPins();

for(let i = 0; i < buttons.length; i++){
    let stream = phat.buttonStream(buttons[i].pin);
    stream.pipe(process.stdout);
}