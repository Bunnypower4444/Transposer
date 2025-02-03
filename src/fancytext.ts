
type FancyText = FancyText.TextSegment[];

namespace FancyText
{
    export function create(segments: FancyText.TextSegmentData[]): FancyText
    {
        return segments.map(v => new FancyText.TextSegment(v));
    }

    export function draw(graphics: RenderTarget, segments: FancyText, position: Vector2, textSize: number, font: string, justify?: Vector2, alpha: number = 255)
    {
        graphics.push();

        // adjust for justify
        position = position.sub(
            justify.mult(
                new Vector2(getWidth(segments, textSize, font), textSize)));
        for (const segment of segments)
        {
            segment.draw(graphics, position, textSize, font, Vector2.zero, alpha);

            position = position.withX(position.x + segment.getWidth(textSize, font));
        }

        graphics.pop();
    }

    export function getWidth(segments: FancyText, textSize: number, font: string): number
    {
        let w = 0;
        for (const segment of segments)
        {
            w += segment.getWidth(textSize, font);
        }

        return w;
    }

    export const ScriptScale = 0.5;

    export type TextPropertiesData
        = { [x in keyof FancyText.TextProperties as
                ExcludePropertyType<x, FancyText.TextProperties, Function>]?:
            FancyText.TextProperties[x] };

    export class TextProperties
    {
        public color: ColorLike = 0;
        public script: TextProperties.Script = TextProperties.Script.Normal;
        public style: TextStyle = NORMAL;

        public constructor(props?: TextPropertiesData)
        {
            for (const key in props) {
                if (Object.prototype.hasOwnProperty.call(props, key)) {
                    const element = props[key];
                    this[key] = element;
                }
            }
        }
    }

    export namespace TextProperties
    {
        export enum Script { Normal, Subscript, Superscript }
    }

    export type TextSegmentData
        = { text: string; properties?: TextProperties | TextPropertiesData };

    export class TextSegment
    {
        public text: string;
        public properties: TextProperties;
        
        public constructor(data: TextSegmentData);
        public constructor(text: string, properties: TextProperties)
        public constructor(
            var1: string | TextSegmentData,
            properties?: TextProperties | TextPropertiesData)
        {
            if (typeof var1 == "string")
            {
                this.text = var1;
                if (!properties)
                    properties = {};
                this.properties = !(properties instanceof TextProperties) ?
                    new TextProperties(properties) : properties;
            }
            else
            {
                this.text = var1.text;
                if (!var1.properties)
                    var1.properties = {};
                this.properties = !(var1.properties instanceof TextProperties) ?
                    new TextProperties(var1.properties) : var1.properties;
            }
        }

        public getWidth(textSize: number, font: string): number
        {
            let sizeFactor =
                this.properties.script != TextProperties.Script.Normal
                ? ScriptScale : 1;
            
            return DrawUtils.textWidth(this.text, font,
                textSize * sizeFactor, this.properties.style);
        }

        public draw(graphics: RenderTarget, position: Vector2, textSize: number, font: string, justify?: Vector2, alpha: number = 255)
        {
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
                ? ScriptScale : 1;
            let yOffset = 0;
            if (this.properties.script == TextProperties.Script.Subscript)
                yOffset = 0.6 * textSize;
            else if (this.properties.script == TextProperties.Script.Superscript)
                yOffset = -0.1 * textSize;
            graphics.translate(
                position.x - justify.x * this.getWidth(textSize, font),
                position.y - justify.y * textSize + yOffset);
            
            graphics.scale(scale);

            graphics.text(this.text, 0, 0);

            graphics.pop();
        }
    }
}

namespace FancyTextAnimations
{
    export type AnimTextPropertiesData = FancyText.TextPropertiesData & { animID?: string };

    export type AnimTextSegmentData
        = { text: string; properties?: AnimTextProperties | AnimTextPropertiesData };

    export class AnimTextProperties extends FancyText.TextProperties
    {
        public animID?: string;
    }

    export function create(segments: AnimTextSegmentData[]): FancyText
    {
        return segments.map(v => new FancyText.TextSegment(v));
    }

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
    export function draw(graphics: RenderTarget, lines: FancyText[], position: Vector2, textSize: number, font: string, t: number, justify?: Vector2)
    {
        // for the textLeading
        graphics.push();
        graphics.textFont(font);
        graphics.textSize(textSize);
        const leading = graphics.textLeading();
        graphics.pop();

        // this will be determined when that line is drawn
        let animationStartPos: { [x: string]: [FancyText.TextSegment, Vector2][] } = {};

        let animationEndPos: { [x: string]: [FancyText.TextSegment, Vector2] } = {};
        if (t >= 1 && t < lines.length)
        {
            let movingIndex = Math.floor(t);                

            // adjust for justify
            let pos = position.sub(
                justify.mult(
                    new Vector2(FancyText.getWidth(lines[movingIndex], textSize, font), textSize)));

            pos.y += movingIndex * leading;
            
            let positions: { [x: string]: [FancyText.TextSegment, number[]] } = {};
            
            for (const segment of lines[movingIndex])
            {
                let id = (segment.properties as AnimTextProperties).animID;
                if (id)
                    (positions[id] ??= [segment, []])[1].push(pos.x);

                pos = pos.withX(pos.x + segment.getWidth(textSize, font));
            }

            for (const id in positions) {
                if (Object.prototype.hasOwnProperty.call(positions, id)) {
                    const list = positions[id];

                    if (list[1].length == 1)
                    {
                        animationEndPos[id] = [list[0], new Vector2(list[1][0], pos.y)];
                        continue;
                    }

                    animationEndPos[id] = [list[0], new Vector2((list[1][0] + list[1].at(-1)) / 2, pos.y)];
                }
            }
        }

        for (let i = 0; i < lines.length; i++)
        {
            const line = lines[i];

            // If this line is already fully animated
            if (t >= i + 1)
            {
                // adjust for justify
                let pos = position.sub(
                    justify.mult(
                        new Vector2(FancyText.getWidth(line, textSize, font), textSize)));
                
                for (const segment of line)
                {
                    segment.draw(graphics, pos, textSize, font, Vector2.zero);
                    
                    let id = (segment.properties as AnimTextProperties).animID;
                    // Only add to animationStartPos if this is the last fully animated line
                    if (id && t < i + 2)
                        (animationStartPos[id] ??= []).push([segment, pos]);

                    pos = pos.withX(pos.x + segment.getWidth(textSize, font));
                }
            }
            
            else if (t >= i)
            {
                // adjust for justify
                let pos = position.sub(
                    justify.mult(
                        new Vector2(FancyText.getWidth(line, textSize, font), textSize)));
                
                for (const segment of line)
                {
                    let id = (segment.properties as AnimTextProperties).animID;
                    
                    if (id && animationStartPos[id])
                    {
                        const starts = animationStartPos[id];
                        const endPos = animationEndPos[id][1];

                        let midX = starts.length > 0 ?
                            (starts[0][1].x + starts.at(-1)[1].x) / 2
                            : starts[0][1].x;

                        let midPos = new Vector2(midX, pos.y - leading);
                        let easedPos = midPos.lerp(endPos, Easings.sin.inout(t - i));

                        // Only draw previous ones once
                        if (animationEndPos[id][0] == segment)
                        {
                            for (const prev of animationStartPos[id])
                            {
                                let offset = prev[1].sub(midPos);
                                prev[0].draw(
                                    graphics, easedPos.add(offset), textSize, font, Vector2.zero, 255 * (1 - Easings.quint.inout(t - i)));
                            }
                        }

                        /* let easedPos = animationStartPos[id][0][1].lerp(pos, Easings.sin.inout(t - i));

                        animationStartPos[id][0].draw(
                            graphics, easedPos, textSize, font, Vector2.zero, 255 * (1 - Easings.quint.inout(t - i))); */
                        
                        let offset = pos.sub(endPos);
                        segment.draw(
                            graphics, easedPos.add(offset), textSize, font, Vector2.zero, 255 * Easings.quint.inout(t - i));
                    }

                    else
                    {
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
}
