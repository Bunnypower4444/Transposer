
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

function setup()
{
    // Setup the canvas
    let canvasSize = CanvasUtils.aspectToSize(WindowAspect, WindowWidth, null);

    createCanvas(canvasSize.x, canvasSize.y, document.getElementById("defaultCanvas0") as HTMLCanvasElement);
}

function draw()
{
    background(BackgroundColor);

    animTime += deltaTime / 1000;
    transposer.draw(globalThis, new Vector2(width, height), Vector2.zero, animTime, totalAnimationTime);
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

//#endregion