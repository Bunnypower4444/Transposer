//#region Globals
// MIDI key number
let startingPitch = MiddleC;
// key is represented by half steps away from Concert C
let startingInstrumentKey = KeyConcertC;
let startingKey = KeyConcertC;
let endingInstrumentKey = KeyConcertC;
let endingKey = KeyConcertC;
let transposer = new Transposer();
//#endregion
//#region Canvas
const WindowAspect = 2;
const WindowWidth = 1000;
const MainFont = "Times New Roman";
const BackgroundColor = "antiquewhite";
function setup() {
    // Setup the canvas
    let canvasSize = CanvasUtils.aspectToSize(WindowAspect, WindowWidth, null);
    createCanvas(canvasSize.x, canvasSize.y, document.getElementById("defaultCanvas0"));
}
function draw() {
    background(BackgroundColor);
    transposer.draw(globalThis, new Vector2(width, height), Vector2.zero, 0);
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
    transposer.setParameters(startingPitch, startingInstrumentKey, startingKey, endingInstrumentKey, endingKey);
}
//#endregion
