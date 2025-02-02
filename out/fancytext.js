var FancyText;
(function (FancyText) {
    function create(segments) {
        return segments.map(v => new FancyText.TextSegment(v));
    }
    FancyText.create = create;
    function draw(graphics, segments, position, textSize, font, justify, alpha = 255) {
        graphics.push();
        // adjust for justify
        position = position.sub(justify.mult(new Vector2(getWidth(segments, textSize, font), textSize)));
        for (const segment of segments) {
            segment.draw(graphics, position, textSize, font, Vector2.zero, alpha);
            position = position.withX(position.x + segment.getWidth(textSize, font));
        }
        graphics.pop();
    }
    FancyText.draw = draw;
    function getWidth(segments, textSize, font) {
        let w = 0;
        for (const segment of segments) {
            w += segment.getWidth(textSize, font);
        }
        return w;
    }
    FancyText.getWidth = getWidth;
    FancyText.ScriptScale = 0.5;
    class TextProperties {
        color = 0;
        script = TextProperties.Script.Normal;
        style = NORMAL;
        constructor(props) {
            for (const key in props) {
                if (Object.prototype.hasOwnProperty.call(props, key)) {
                    const element = props[key];
                    this[key] = element;
                }
            }
        }
    }
    FancyText.TextProperties = TextProperties;
    (function (TextProperties) {
        let Script;
        (function (Script) {
            Script[Script["Normal"] = 0] = "Normal";
            Script[Script["Subscript"] = 1] = "Subscript";
            Script[Script["Superscript"] = 2] = "Superscript";
        })(Script = TextProperties.Script || (TextProperties.Script = {}));
    })(TextProperties = FancyText.TextProperties || (FancyText.TextProperties = {}));
    class TextSegment {
        text;
        properties;
        constructor(var1, properties) {
            if (typeof var1 == "string") {
                this.text = var1;
                if (!properties)
                    properties = {};
                this.properties = !(properties instanceof TextProperties) ?
                    new TextProperties(properties) : properties;
            }
            else {
                this.text = var1.text;
                if (!var1.properties)
                    var1.properties = {};
                this.properties = !(var1.properties instanceof TextProperties) ?
                    new TextProperties(var1.properties) : var1.properties;
            }
        }
        getWidth(textSize, font) {
            let sizeFactor = this.properties.script != TextProperties.Script.Normal
                ? FancyText.ScriptScale : 1;
            return DrawUtils.textWidth(this.text, font, textSize * sizeFactor, this.properties.style);
        }
        draw(graphics, position, textSize, font, justify, alpha = 255) {
            if (!justify)
                justify = Vector2.zero;
            graphics.push();
            graphics.textSize(textSize);
            graphics.textAlign(LEFT, TOP);
            graphics.textFont(font);
            graphics.textStyle(this.properties.style);
            //@ts-expect-error
            let col = color(this.properties.color).levels;
            if (alpha < 255)
                col[3] = alpha;
            graphics.fill(col);
            graphics.strokeWeight(0);
            let scale = this.properties.script != TextProperties.Script.Normal
                ? FancyText.ScriptScale : 1;
            let yOffset = 0;
            if (this.properties.script == TextProperties.Script.Subscript)
                yOffset = 0.6 * textSize;
            else if (this.properties.script == TextProperties.Script.Superscript)
                yOffset = -0.1 * textSize;
            graphics.translate(position.x - justify.x * this.getWidth(textSize, font), position.y - justify.y * textSize + yOffset);
            graphics.scale(scale);
            graphics.text(this.text, 0, 0);
            graphics.pop();
        }
    }
    FancyText.TextSegment = TextSegment;
})(FancyText || (FancyText = {}));
var FancyTextAnimations;
(function (FancyTextAnimations) {
    class AnimTextProperties extends FancyText.TextProperties {
        animID;
    }
    FancyTextAnimations.AnimTextProperties = AnimTextProperties;
    function create(segments) {
        return segments.map(v => new FancyText.TextSegment(v));
    }
    FancyTextAnimations.create = create;
    /**
     *
     * @param graphics
     * @param lines
     * @param position
     * @param textSize
     * @param font
     * @param t The animation progress. Each 1.00 represents one line finished.
     * @param justify
     */
    function draw(graphics, lines, position, textSize, font, t, justify) {
        // for the textLeading
        graphics.push();
        graphics.textFont(font);
        graphics.textSize(textSize);
        const leading = graphics.textLeading();
        graphics.pop();
        let animationStartPos = {};
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (t > i + 1) {
                // adjust for justify
                let pos = position.sub(justify.mult(new Vector2(FancyText.getWidth(line, textSize, font), textSize)));
                for (const segment of line) {
                    segment.draw(graphics, pos, textSize, font, Vector2.zero);
                    let id = segment.properties.animID;
                    if (id && t < i + 2)
                        (animationStartPos[id] ??= []).push([segment, pos]);
                    pos = pos.withX(pos.x + segment.getWidth(textSize, font));
                }
            }
            else if (t > i) {
                // adjust for justify
                let pos = position.sub(justify.mult(new Vector2(FancyText.getWidth(line, textSize, font), textSize)));
                for (const segment of line) {
                    let id = segment.properties.animID;
                    if (id && animationStartPos[id]) {
                        let midX = 0;
                        for (const prev of animationStartPos[id]) {
                            midX += prev[1].x;
                        }
                        midX /= animationStartPos[id].length;
                        let midPos = new Vector2(midX, pos.y - leading);
                        let easedPos = midPos.lerp(pos, Easings.sin.inout(t - i));
                        for (const prev of animationStartPos[id]) {
                            let offset = prev[1].sub(midPos);
                            prev[0].draw(graphics, easedPos.add(offset), textSize, font, Vector2.zero, 255 * (1 - Easings.quint.inout(t - i)));
                        }
                        /* let easedPos = animationStartPos[id][0][1].lerp(pos, Easings.sin.inout(t - i));

                        animationStartPos[id][0].draw(
                            graphics, easedPos, textSize, font, Vector2.zero, 255 * (1 - Easings.quint.inout(t - i))); */
                        segment.draw(graphics, easedPos, textSize, font, Vector2.zero, 255 * Easings.quint.inout(t - i));
                    }
                    else {
                        segment.draw(graphics, pos, textSize, font, Vector2.zero, 255 * Easings.quint.inout(t - i));
                    }
                    pos = pos.withX(pos.x + segment.getWidth(textSize, font));
                }
            }
            position = position.withY(position.y + leading);
        }
        // adjust for justify
        /* position = position.sub(
            justify.mult(
                new Vector2(getWidth(segments, textSize, font), textSize)));
        for (const segment of segments)
        {
            segment.draw(graphics, position, textSize, font, Vector2.zero);

            position = position.withX(position.x + segment.getWidth(textSize, font));
        } */
    }
    FancyTextAnimations.draw = draw;
})(FancyTextAnimations || (FancyTextAnimations = {}));
