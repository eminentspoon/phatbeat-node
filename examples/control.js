var app = require('express')();
var phat = require("../phatbeat");
var path = require("path");

phat.init(0.8);
var isOn = false;

app.post('/led/', function (req, res) {
    console.log(req.headers);
    var responseObject = {
        newState : req.headers.state === "0" ? 1 : 0,
        red : Math.floor(Math.random() * 256),
        green : Math.floor(Math.random() * 256),
        blue : Math.floor(Math.random() * 256)
    };

    if (req.headers.state === "0") {
        phat.changeSinglePixel(Number(req.headers.pin), responseObject.red, responseObject.green, responseObject.blue, true);

    } else {
        phat.changeSinglePixel(Number(req.headers.pin), 0, 0, 0, true);
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseObject));
    res.end();
});

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/control_form.html"));
});

app.listen(3000, function () {
    console.log("server started on port 3000");
});