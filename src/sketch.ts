
//#region Imports

import Vector2 = p5Utils.Vector2;
import FancyText = p5Utils.Ext.FancyText;

//#endregion

//#region Globals

// MIDI key number
let startingPitch = MiddleC;
// key is represented by half steps away from Concert C
let startingInstrumentKey = KeyConcertC;
let startingKey           = KeyConcertC;
let endingInstrumentKey   = KeyConcertC;
let endingKey             = KeyConcertC;

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
const StorageAnimTime = "animTime";

function setup()
{
    // Setup the canvas
    let canvasSize = p5Utils.CanvasUtils.aspectToSize(WindowAspect, WindowWidth, null);

    createCanvas(canvasSize.x, canvasSize.y, document.getElementById("defaultCanvas0") as HTMLCanvasElement);
    frameRate(FrameRate);

    // load anim time settings
    let savedAnimTime = getItem(StorageAnimTime);
    if (typeof savedAnimTime == "number" && !p5Utils.NumberUtils.isNullish(savedAnimTime))
    {
        (document.getElementById("totalAnimTime") as HTMLSelectElement).value = savedAnimTime.toString();
    }
}

function draw()
{
    background(BackgroundColor);
    
    if (!paused || advanceFrame)
        animTime += deltaTime / 1000;
    advanceFrame = false;
    
    transposer.draw(globalThis, new Vector2(width, height), Vector2.zero, animTime, totalAnimationTime);
    
    // pausing 
    push();

    noStroke();
    fill("darkblue");
    textFont(MainFont);
    textAlign(CENTER, BOTTOM);
    textSize(24);
    
    text("SHIFT + ENTER = Pause/Play\tSHIFT + SPACE = Frame Advance", width / 2, height);
    if (paused)
    {
        textStyle("bold");
        text("Paused", width / 2, height - 1.5 * textLeading());
    }

    pop();
}

//#endregion

//#region Input

function calculate()
{
    let octaveInput = document.getElementById("noteOctaveInput") as HTMLInputElement;
    let octave = octaveInput.valueAsNumber;
    if (Number.isNaN(octave))
        return octaveInput.classList.add("invalid");
    else
        octaveInput.classList.remove("invalid");

    startingPitch = Number((document.getElementById("noteInput") as HTMLSelectElement).value) +
        octaveInput.valueAsNumber * 12 + 12;
    startingInstrumentKey = Number((document.getElementById("instrumentKeyInput") as HTMLSelectElement).value);
    startingKey           = Number((document.getElementById("keyInput") as HTMLSelectElement).value);
    endingInstrumentKey   = Number((document.getElementById("outInstrumentKeyInput") as HTMLSelectElement).value);
    endingKey             = Number((document.getElementById("outKeyInput") as HTMLSelectElement).value);

    transposer.setParameters(startingPitch,
        startingInstrumentKey, startingKey,
        endingInstrumentKey, endingKey);

    animTime = 0;

    totalAnimationTime = Number((document.getElementById("totalAnimTime") as HTMLSelectElement).value);
}

let paused = false;
let advanceFrame = false;
// Pause/Unpause
function keyPressed()
{
    if (!keyIsDown(SHIFT))
        return;

    if (keyCode == ENTER)
        paused = !paused;
    else if (keyCode == 32)
        advanceFrame = true;
}

function saveSpeedSettings(animTime: number)
{
    storeItem(StorageAnimTime, Number(animTime));
}

//#endregion