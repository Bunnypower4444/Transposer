
type Renderer = typeof globalThis;
type Graphics = typeof globalThis;
type RenderTarget = Graphics | Renderer;

declare function createCanvas(w: number, h: number, canvas: HTMLCanvasElement): Renderer;
declare function fill(color: ColorLike): void;

class CanvasUtils
{
    private constructor()
    {
        throw new TypeError("Cannot make instance of CanvasUtils");
    }

    /**
     * Calculates the largest possible size of an element given an aspect ration and max dimensions.
     * @param aspectRatio The aspect ratio (width / height)
     * @param maxX The maximum allowed width (leave null if none, but then maxY is required)
     * @param maxY The maximum allowed height (leave null if none, but then maxX is required)
     */
    public static aspectToSize(aspectRatio: number, maxX?: number, maxY?: number): Vector2
    {
        if (NumberUtils.isNullish(maxX) && NumberUtils.isNullish(maxY))
            throw new Error("maxX and maxY cannot both be null");

        if (!NumberUtils.isNullish(maxX) && !NumberUtils.isNullish(maxY))
        {
            let h = maxY;
            if (h * aspectRatio > maxX)
                h = maxX / aspectRatio;

            return new Vector2(h * aspectRatio, h);
        }
        
        else if (!NumberUtils.isNullish(maxX))
            return new Vector2(maxX, maxX / aspectRatio);

        else
            return new Vector2(maxY * aspectRatio, maxY);
    }
}

class DrawUtils
{
    private constructor()
    {
        throw new TypeError("Cannot make instance of DrawUtils");
    }

    /**
     * Draws a line using a point and sizes, rather than two points
     * @param x X-position of line starting point
     * @param y Y-position of line starting point
     * @param w The horizontal distance of the line
     * @param h The vertical distance of the line
     */
    public static line(x: number, y: number, w: number, h: number, graphics: RenderTarget = window)
    {
        graphics.line(x, y, x + w, y + h);
    }

    public static text(font: string, textString: string, x: number, y: number, size?: number,
        justifyX: TextAlignHoriz = CENTER, justifyY: TextAlignVert = CENTER, rotation: number = 0, graphics: RenderTarget = window)
    {
        if (size === undefined || size === null)
            size = graphics.textSize();

        graphics.push();
        graphics.textFont(font);
        graphics.textSize(size);
        graphics.textAlign(justifyX, justifyY);
        graphics.translate(x/*  - justifyX * DrawUtils.textWidth(textString, font, size, NORMAL) */, y/*  - justifyY * DrawUtils.textHeight(textString, font, size, NORMAL) */);
        graphics.rotate(rotation);
        graphics.text(textString, 0,
            0);
        graphics.pop();
    }

    public static textWidth(text: string, font: string, size: number, style: TextStyle) {
        push();
        textStyle(style);
        textSize(size);
        textFont(font);
        let lines = DrawUtils.textLines(text);
        let widths: number[] = [];
        for (let line of lines) {
            widths.push(textWidth(line));
        }
        pop();
        return Math.max(...widths);
    }

    /**
     * Gets each individual line of the text, width text wrapping taken into account.
     * @returns An array containing each line of text
     */
    public static textLines(text: string, w?: number): string[] {
        let lines = text.split("\n");
        let nlines: string[] = [];
        if (w === null || w === undefined) return lines;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = '';
            let words = lines[lineIndex].split(' ');
            for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            let testLine = ''.concat(line + words[wordIndex]) + ' ';
            let testWidth = textWidth(testLine);
            if (testWidth > w && line.length > 0) {
                nlines.push(line);
                line = ''.concat(words[wordIndex]) + ' ';
            } else {
                line = testLine;
            }
            }
            nlines.push(line);
        }
        return nlines;
    }

    public static textHeight(text: string, font: string, size: number, style: TextStyle) {
        push();
        textStyle(style);
        textSize(size);
        textFont(font);
        let h = DrawUtils.textLines(text).length * textLeading();
        pop();
        return h;
    }
}

type TextStyle = typeof NORMAL | typeof BOLD | typeof ITALIC | typeof BOLDITALIC;
type TextAlignHoriz = typeof LEFT | typeof CENTER | typeof RIGHT;
type TextAlignVert = typeof TOP | typeof CENTER | typeof BOTTOM | typeof BASELINE;

type ColorLike = number | string | number[];

class Vector2 {
    constructor(public x: number, public y: number) {}

    public clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public copy(destination: Vector2) {
        destination.x = this.x;
        destination.y = this.y;
    }

    /**
     * Creates a new `Vector2` from a given angle (in radians) and magnitude.
     * @param angle Angle (radians)
     * @param magnitude 
     */
    static fromAngle(angle: number, magnitude: number): Vector2 {
        return new Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }

    /**
     * Creates a new `Vector2` from a given angle (in degrees) and magnitude.
     * @param angle Angle (degrees)
     * @param magnitude 
     */
    static fromAngleDegrees(angle: number, magnitude: number): Vector2 {
        return new Vector2(magnitude * Math.cos(angle * Math.PI/180), magnitude * Math.sin(angle * Math.PI/180));
    }

    /**
     * Creates a new `Vector2` with the value <0, 0>
     */
    static get zero(): Vector2
    {
        return new Vector2(0, 0);
    }
    
    /**
     * Returns a vector with the mouse coordinates. If the sketch has not been set up yet, returns undefined.
     */
    static getMousePositionVector(): Vector2 | undefined {
        try {
            return new Vector2(mouseX, mouseY);
        } catch (err) {
            return undefined;
        }
    }

    withX(x: number): Vector2
    {
        return new Vector2(x, this.y);
    }

    withY(y: number): Vector2
    {
        return new Vector2(this.x, y);
    }

    add(other: Vector2) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other: Vector2) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    mult(scalar: number): Vector2;
    mult(other: Vector2): Vector2;
    mult(value: number | Vector2): Vector2 {
        if (typeof value == "number") return new Vector2(this.x * value, this.y * value);
        else return new Vector2(this.x * value.x, this.y * value.y);
    }

    div(scalar: number): Vector2;
    div(other: Vector2): Vector2;
    div(value: number | Vector2): Vector2 {
        if (typeof value == "number") return new Vector2(this.x / value, this.y / value);
        else return new Vector2(this.x / value.x, this.y / value.y);
    }

    mod(scalar: number): Vector2;
    mod(other: Vector2): Vector2;
    mod(value: number | Vector2) {
        if (typeof value == "number") return new Vector2(this.x % value, this.y % value);
        else return new Vector2(this.x % value.x, this.y % value.y);
    }

    dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    get magnitude() {
        return Math.sqrt(this.magSq);
    }
    set magnitude(value) {
        let newVector = Vector2.fromAngle(this.angle, value);
        this.x = newVector.x;
        this.y = newVector.y;
    }
    get magSq() {
        return this.x ** 2 + this.y ** 2;
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }
    set angle(value) {
        let newVector = Vector2.fromAngle(value, this.magnitude);
        this.x = newVector.x;
        this.y = newVector.y;
    }

    normalize() {
        if (this.x == 0 && this.y == 0) return new Vector2(0, 0);
        return new Vector2(this.x / this.magnitude, this.y / this.magnitude);
    }

    lerp(other: Vector2, amt: number): Vector2 {
        return new Vector2((other.x - this.x) * amt + this.x, (other.y - this.y) * amt + this.y);
    }

    /**
     * @param centerPoint 
     * @param angle Rotation in radians
     */
    rotate(centerPoint: Vector2, angle: number) {
        return new Vector2((this.x - centerPoint.x) * Math.cos(angle) - (this.y - centerPoint.y) * Math.sin(angle) + centerPoint.x,
            (this.x - centerPoint.x) * Math.sin(angle) + (this.y - centerPoint.y) * Math.cos(angle) + centerPoint.y);
    }

    /**
     * @param {Vector2} other 
     * @returns {boolean}
     */
    equals(other: Vector2): boolean {
        if (this.x == other.x && this.y == other.y) return true;
        return false;
    }

    /**
     * Converts the vector to an array containing the x and y component.
     */
    toArray(): number[] {
        return [this.x, this.y];
    }

    toString() {
        return `<${this.x}, ${this.y}>`
    }
}

class NumberUtils
{
    private constructor()
    {
        throw new TypeError("Cannot make instance of NumberUtils");
    }

    public static isNullish(n: number): boolean
    {
        return !n && n !== 0;
    }
}

/**
 * Excludes the properties of T where U[T] is of type V
 */
type ExcludePropertyType<T extends string, U extends { [x: string]: any }, V>
    = U[T] extends V ? never : T;