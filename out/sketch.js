//#region Globals
// MIDI key number
let startingPitch = MiddleC;
// key is represented by half steps away from Concert C
let startingInstrumentKey = KeyConcertC;
let startingKey = KeyConcertC;
let endingInstrumentKey = KeyConcertC;
let endingKey = KeyConcertC;
let animTime = 0;
let totalAnimationTime = 3;
let transposer = new Transposer();
//#endregion
//#region Canvas
const WindowAspect = 2;
const WindowWidth = 1000;
const MainFont = "Times New Roman";
const BackgroundColor = "antiquewhite";
const FrameRate = 60;
function setup() {
    // Setup the canvas
    let canvasSize = CanvasUtils.aspectToSize(WindowAspect, WindowWidth, null);
    createCanvas(canvasSize.x, canvasSize.y, document.getElementById("defaultCanvas0"));
    frameRate(FrameRate);
}
function draw() {
    background(BackgroundColor);
    animTime += 1 / FrameRate;
    transposer.draw(globalThis, new Vector2(width, height), Vector2.zero, animTime, totalAnimationTime);
    // pausing 
    push();
    noStroke();
    fill("darkblue");
    textFont(MainFont);
    textAlign(CENTER, BOTTOM);
    textSize(24);
    text("SHIFT + ENTER = Pause/Play\tSHIFT + SPACE = Frame Advance", width / 2, height);
    if (paused) {
        textStyle("bold");
        text("Paused", width / 2, height - 1.5 * textLeading());
    }
    pop();
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
    animTime = 0;
    totalAnimationTime = Number(document.getElementById("totalAnimTime").value);
}
let paused = false;
// Pause/Unpause
function keyPressed() {
    if (!keyIsDown(SHIFT))
        return;
    if (keyCode == ENTER) {
        paused = !paused;
        if (paused)
            noLoop();
        else
            loop();
    }
    else if (keyCode == 32) {
        redraw();
    }
}
//#endregion
