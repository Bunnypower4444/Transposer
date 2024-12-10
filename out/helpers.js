class CanvasUtils {
    constructor() {
        throw new TypeError("Cannot make instance of CanvasUtils");
    }
    /**
     * Calculates the largest possible size of an element given an aspect ration and max dimensions.
     * @param aspectRatio The aspect ratio (width / height)
     * @param maxX The maximum allowed width (leave null if none, but then maxY is required)
     * @param maxY The maximum allowed height (leave null if none, but then maxX is required)
     */
    static aspectToSize(aspectRatio, maxX, maxY) {
        if (NumberUtils.isNullish(maxX) && NumberUtils.isNullish(maxY))
            throw new Error("maxX and maxY cannot both be null");
        if (!NumberUtils.isNullish(maxX) && !NumberUtils.isNullish(maxY)) {
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
class DrawUtils {
    constructor() {
        throw new TypeError("Cannot make instance of DrawUtils");
    }
    /**
     * Draws a line using a point and sizes, rather than two points
     * @param x X-position of line starting point
     * @param y Y-position of line starting point
     * @param w The horizontal distance of the line
     * @param h The vertical distance of the line
     */
    static line(x, y, w, h) {
        line(x, y, x + w, y + h);
    }
    static text(font, textString, x, y, size, justifyX = CENTER, justifyY = CENTER, rotation = 0) {
        if (size === undefined || size === null)
            size = textSize();
        push();
        textFont(font);
        textSize(size);
        textAlign(justifyX, justifyY);
        translate(x /*  - justifyX * DrawUtils.textWidth(textString, font, size, NORMAL) */, y /*  - justifyY * DrawUtils.textHeight(textString, font, size, NORMAL) */);
        rotate(rotation);
        text(textString, 0, 0);
        pop();
    }
    static textWidth(text, font, size, style) {
        push();
        textStyle(style);
        textSize(size);
        textFont(font);
        let lines = DrawUtils.textLines(text);
        let widths = [];
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
    static textLines(text, w) {
        let lines = text.split("\n");
        let nlines = [];
        if (w === null || w === undefined)
            return lines;
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = '';
            let words = lines[lineIndex].split(' ');
            for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
                let testLine = ''.concat(line + words[wordIndex]) + ' ';
                let testWidth = textWidth(testLine);
                if (testWidth > w && line.length > 0) {
                    nlines.push(line);
                    line = ''.concat(words[wordIndex]) + ' ';
                }
                else {
                    line = testLine;
                }
            }
            nlines.push(line);
        }
        return nlines;
    }
    static textHeight(text, font, size, style) {
        push();
        textStyle(style);
        textSize(size);
        textFont(font);
        let h = DrawUtils.textLines(text).length * textLeading();
        pop();
        return h;
    }
}
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Creates a new `Vector2` from a given angle (in radians) and magnitude.
     * @param angle Angle (radians)
     * @param magnitude
     */
    static fromAngle(angle, magnitude) {
        return new Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
    /**
     * Creates a new `Vector2` from a given angle (in degrees) and magnitude.
     * @param angle Angle (degrees)
     * @param magnitude
     */
    static fromAngleDegrees(angle, magnitude) {
        return new Vector2(magnitude * Math.cos(angle * Math.PI / 180), magnitude * Math.sin(angle * Math.PI / 180));
    }
    /**
     * Returns a vector with the mouse coordinates. If the sketch has not been set up yet, returns undefined.
     */
    static getMousePositionVector() {
        try {
            return new Vector2(mouseX, mouseY);
        }
        catch (err) {
            return undefined;
        }
    }
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    mult(value) {
        if (typeof value == "number")
            return new Vector2(this.x * value, this.y * value);
        else
            return new Vector2(this.x * value.x, this.y * value.y);
    }
    div(value) {
        if (typeof value == "number")
            return new Vector2(this.x / value, this.y / value);
        else
            return new Vector2(this.x / value.x, this.y / value.y);
    }
    mod(value) {
        if (typeof value == "number")
            return new Vector2(this.x % value, this.y % value);
        else
            return new Vector2(this.x % value.x, this.y % value.y);
    }
    dot(other) {
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
        if (this.x == 0 && this.y == 0)
            return new Vector2(0, 0);
        return new Vector2(this.x / this.magnitude, this.y / this.magnitude);
    }
    lerp(other, amt) {
        return new Vector2((other.x - this.x) * amt + this.x, (other.y - this.y) * amt + this.y);
    }
    /**
     * @param centerPoint
     * @param angle Rotation in radians
     */
    rotate(centerPoint, angle) {
        return new Vector2((this.x - centerPoint.x) * Math.cos(angle) - (this.y - centerPoint.y) * Math.sin(angle) + centerPoint.x, (this.x - centerPoint.x) * Math.sin(angle) + (this.y - centerPoint.y) * Math.cos(angle) + centerPoint.y);
    }
    /**
     * @param {Vector2} other
     * @returns {boolean}
     */
    equals(other) {
        if (this.x == other.x && this.y == other.y)
            return true;
        return false;
    }
    /**
     * Converts the vector to an array containing the x and y component.
     */
    toArray() {
        return [this.x, this.y];
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
}
class NumberUtils {
    constructor() {
        throw new TypeError("Cannot make instance of NumberUtils");
    }
    static isNullish(n) {
        return !n && n !== 0;
    }
}
