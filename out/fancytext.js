var FancyText;
(function (FancyText) {
    function create(segments) {
        return segments.map(v => new FancyText.TextSegment(v));
    }
    FancyText.create = create;
    function draw(segments, graphics, position, textSize, font, justify) {
        graphics.push();
        // adjust for justify
        position = position.sub(justify.mult(new Vector2(getWidth(segments, textSize, font), textSize)));
        for (const segment of segments) {
            segment.draw(graphics, position, textSize, font, Vector2.zero);
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
            if (props) {
                this.color = props.color ?? 0;
                this.script = props.script ?? TextProperties.Script.Normal;
                this.style = props.style ?? NORMAL;
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
        draw(graphics, position, textSize, font, justify) {
            if (!justify)
                justify = Vector2.zero;
            graphics.push();
            graphics.textSize(textSize);
            graphics.textAlign(LEFT, TOP);
            graphics.textFont(font);
            graphics.textStyle(this.properties.style);
            graphics.fill(this.properties.color);
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
