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
                    this[key] = props[key];
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
        constructor(textOrData, properties) {
            if (typeof textOrData == "string") {
                this.text = textOrData;
                if (!properties)
                    properties = {};
                this.properties = !(properties instanceof TextProperties) ?
                    new TextProperties(properties) : properties;
            }
            else {
                this.text = textOrData.text;
                if (!textOrData.properties)
                    textOrData.properties = {};
                this.properties = !(textOrData.properties instanceof TextProperties) ?
                    new TextProperties(textOrData.properties) : textOrData.properties;
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
        constructor(props) {
            super(props);
            if (!props)
                return;
            if (typeof props.animID == "string")
                props.animID = [props.animID];
            this.animID = props.animID;
        }
    }
    FancyTextAnimations.AnimTextProperties = AnimTextProperties;
    class AnimTextSegment extends FancyText.TextSegment {
        constructor(textOrData, properties) {
            if (typeof textOrData == "string") {
                if (properties instanceof AnimTextProperties)
                    super(textOrData, properties);
                else
                    super(textOrData, new AnimTextProperties(properties));
            }
            else {
                if (textOrData.properties && !(textOrData.properties instanceof AnimTextProperties))
                    textOrData.properties = new AnimTextProperties(textOrData.properties);
                super(textOrData);
            }
        }
    }
    FancyTextAnimations.AnimTextSegment = AnimTextSegment;
    function create(segments) {
        return segments.map(v => new AnimTextSegment(v));
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
        // this will be determined when that line is drawn
        let animationStartPos = {};
        let animationEndPos = {};
        if (t >= 1 && t < lines.length) {
            let movingIndex = Math.floor(t);
            // adjust for justify
            let pos = position.sub(justify.mult(new Vector2(FancyText.getWidth(lines[movingIndex], textSize, font), textSize)));
            pos.y += movingIndex * leading;
            /**
             * [First segment, left x-coord of first segment, right x-coord of last segment]
             */
            let positions = {};
            for (const segment of lines[movingIndex]) {
                let ids = segment.properties.animID;
                let width = segment.getWidth(textSize, font);
                if (ids)
                    for (const id of ids)
                        (positions[id] ??= [segment, pos.x, 0])[2] = pos.x + width;
                pos = pos.withX(pos.x + width);
            }
            for (const id in positions) {
                if (Object.prototype.hasOwnProperty.call(positions, id)) {
                    const animGroup = positions[id];
                    // Find the center of the segments: avg of left and rightmost points
                    animationEndPos[id] = [animGroup[0], new Vector2((animGroup[1] + animGroup[2]) / 2, pos.y)];
                }
            }
        }
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // If this line is already fully animated
            if (t >= i + 1) {
                // adjust for justify
                let pos = position.sub(justify.mult(new Vector2(FancyText.getWidth(line, textSize, font), textSize)));
                for (const segment of line) {
                    segment.draw(graphics, pos, textSize, font, Vector2.zero);
                    let ids = segment.properties.animID;
                    let width = segment.getWidth(textSize, font);
                    // Only add to animationStartPos if this is the last fully animated line
                    if (ids && t < i + 2)
                        for (const id of ids) {
                            (animationStartPos[id] ??= { segments: [], centerX: 0 }).segments.push([segment, pos]);
                            // For now, store rightmost point in centerX
                            animationStartPos[id].centerX = pos.x + width;
                        }
                    pos = pos.withX(pos.x + width);
                }
                // Determine the center for all animation groups
                if (t < i + 2) {
                    for (const id in animationStartPos) {
                        if (Object.prototype.hasOwnProperty.call(animationStartPos, id)) {
                            const group = animationStartPos[id];
                            // Find the center of the segments: avg of left and rightmost points
                            group.centerX = (group.segments[0][1].x + group.centerX) / 2;
                        }
                    }
                }
            }
            else if (t >= i) {
                // adjust for justify
                let pos = position.sub(justify.mult(new Vector2(FancyText.getWidth(line, textSize, font), textSize)));
                for (const segment of line) {
                    let ids = segment.properties.animID;
                    // There will be nothing to animate from if this is the first line
                    if (ids && i > 0) {
                        for (const id of ids)
                            if (animationStartPos[id]) {
                                const endPos = animationEndPos[id][1];
                                const midX = animationStartPos[id].centerX;
                                let midPos = new Vector2(midX, pos.y - leading);
                                let easedPos = midPos.lerp(endPos, Easings.sin.inout(t - i));
                                // Only draw previous ones once
                                if (animationEndPos[id][0] == segment) {
                                    for (const prev of animationStartPos[id].segments) {
                                        let offset = prev[1].sub(midPos);
                                        prev[0].draw(graphics, easedPos.add(offset), textSize, font, Vector2.zero, 255 * (1 - Easings.quint.inout(t - i)));
                                    }
                                }
                                /* let easedPos = animationStartPos[id][0][1].lerp(pos, Easings.sin.inout(t - i));
    
                                animationStartPos[id][0].draw(
                                    graphics, easedPos, textSize, font, Vector2.zero, 255 * (1 - Easings.quint.inout(t - i))); */
                                let offset = pos.sub(endPos);
                                segment.draw(graphics, easedPos.add(offset), textSize, font, Vector2.zero, 255 * Easings.quint.inout(t - i));
                            }
                    }
                    else {
                        segment.draw(graphics, pos, textSize, font, Vector2.zero, 255 * Easings.quint.inout(t - i));
                    }
                    pos = pos.withX(pos.x + segment.getWidth(textSize, font));
                }
            }
            position = position.withY(position.y + leading);
        }
    }
    FancyTextAnimations.draw = draw;
})(FancyTextAnimations || (FancyTextAnimations = {}));
