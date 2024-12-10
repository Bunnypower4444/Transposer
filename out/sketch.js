//#region Globals
// MIDI key number
let startingPitch = MiddleC;
// key is represented by half steps away from Concert C
let startingInstrumentKey = KeyConcertC;
let startingKey = KeyConcertC;
let endingInstrumentKey = KeyConcertC;
let endingKey = KeyConcertC;
//#endregion
//#region Canvas
const WindowAspect = 2;
const MainFont = "Trebuchet MS";
const BackgroundColor = "antiquewhite";
function setup() {
    // Setup the canvas
    let canvasSize = CanvasUtils.aspectToSize(WindowAspect, 1000, null);
    //@ts-expect-error
    // Bruh this p5.js extension isn't that good...
    createCanvas(canvasSize.x, canvasSize.y, document.getElementById("defaultCanvas0"));
}
function draw() {
    background(BackgroundColor);
}
//#endregion
//#region Input
function calculate() {
    let octaveInput = document.getElementById("noteOctaveInput");
    let octave = octaveInput.valueAsNumber;
    if (Number.isNaN(octave))
        return octaveInput.classList.add("invalid");
    else
        octaveInput.classList.remove("invalid");
    startingPitch = Number(document.getElementById("noteInput").value) +
        octaveInput.valueAsNumber * 12 + 12;
    startingInstrumentKey = Number(document.getElementById("instrumentKeyInput").value);
    startingKey = Number(document.getElementById("keyInput").value);
    endingInstrumentKey = Number(document.getElementById("outInstrumentKeyInput").value);
    endingKey = Number(document.getElementById("outKeyInput").value);
}
//#endregion
