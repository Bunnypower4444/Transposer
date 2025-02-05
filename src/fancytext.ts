
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
                    this[key] = props[key];
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
        
        public constructor(text: string, properties?: TextProperties | TextPropertiesData);
        public constructor(data: TextSegmentData)
        public constructor(
            textOrData: string | TextSegmentData,
            properties?: TextProperties | TextPropertiesData)
        {
            if (typeof textOrData == "string")
            {
                this.text = textOrData;
                if (!properties)
                    properties = {};
                this.properties = !(properties instanceof TextProperties) ?
                    new TextProperties(properties) : properties;
            }
            else
            {
                this.text = textOrData.text;
                if (!textOrData.properties)
                    textOrData.properties = {};
                this.properties = !(textOrData.properties instanceof TextProperties) ?
                    new TextProperties(textOrData.properties) : textOrData.properties;
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
    export type AnimTextPropertiesData = FancyText.TextPropertiesData & { animID?: string | string[] };

    export type AnimTextSegmentData = 
        { [x in Exclude<keyof FancyText.TextSegmentData, "properties">]: FancyText.TextSegmentData[x]; }
        & { properties?: AnimTextProperties | AnimTextPropertiesData };

    export class AnimTextProperties extends FancyText.TextProperties
    {
        public animID?: string[];

        public constructor(props?: AnimTextPropertiesData)
        {
            super(props);

            if (!props)
                return;

            if (typeof props.animID == "string")
                props.animID = [props.animID];
            
            this.animID = props.animID;
        }
    }

    export class AnimTextSegment extends FancyText.TextSegment
    {
        public constructor(data: AnimTextSegmentData);
        public constructor(text: string, properties?: AnimTextProperties)
        public constructor(
            textOrData: string | AnimTextSegmentData,
            properties?: AnimTextProperties | AnimTextPropertiesData)
        {
            if (typeof textOrData == "string")
            {
                if (properties instanceof AnimTextProperties)
                    super(textOrData, properties);
                else
                    super(textOrData, new AnimTextProperties(properties));
            }
            else
            {
                if (textOrData.properties && !(textOrData.properties instanceof AnimTextProperties))
                    textOrData.properties = new AnimTextProperties(textOrData. properties);

                super(textOrData);
            }
        }
    }

    export function create(segments: AnimTextSegmentData[]): FancyText
    {
        return segments.map(v => new AnimTextSegment(v));
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
        let animationStartPos: { [x: string]: { segments: [FancyText.TextSegment, Vector2][], centerX: number } } = {};

        let animationEndPos: { [x: string]: [FancyText.TextSegment, Vector2] } = {};
        if (t >= 1 && t < lines.length)
        {
            let movingIndex = Math.floor(t);                

            // adjust for justify
            let pos = position.sub(
                justify.mult(
                    new Vector2(FancyText.getWidth(lines[movingIndex], textSize, font), textSize)));

            pos.y += movingIndex * leading;
            
            /**
             * [First segment, left x-coord of first segment, right x-coord of last segment]
             */
            let positions: { [x: string]: [FancyText.TextSegment, number, number] } = {};
            
            for (const segment of lines[movingIndex])
            {
                let ids = (segment.properties as AnimTextProperties).animID;
                let width = segment.getWidth(textSize, font);

                if (ids) for (const id of ids)
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
                    
                    let ids = (segment.properties as AnimTextProperties).animID;
                    let width = segment.getWidth(textSize, font);
                    // Only add to animationStartPos if this is the last fully animated line
                    if (ids && t < i + 2)
                        for (const id of ids)
                    {
                        (animationStartPos[id] ??= { segments: [], centerX: 0 }).segments.push([segment, pos]);
                        // For now, store rightmost point in centerX
                        animationStartPos[id].centerX = pos.x + width;
                    }

                    pos = pos.withX(pos.x + width);
                }

                // Determine the center for all animation groups
                if (t < i + 2)
                {
                    for (const id in animationStartPos) {
                        if (Object.prototype.hasOwnProperty.call(animationStartPos, id)) {
                            const group = animationStartPos[id];

                            // Find the center of the segments: avg of left and rightmost points
                            group.centerX = (group.segments[0][1].x + group.centerX) / 2;
                        }
                    }
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
                    let ids = (segment.properties as AnimTextProperties).animID;
                    
                    if (ids) for (const id of ids)
                    if (animationStartPos[id])
                    {
                        const endPos = animationEndPos[id][1];

                        const midX = animationStartPos[id].centerX;

                        let midPos = new Vector2(midX, pos.y - leading);
                        let easedPos = midPos.lerp(endPos, Easings.sin.inout(t - i));

                        // Only draw previous ones once
                        if (animationEndPos[id][0] == segment)
                        {
                            for (const prev of animationStartPos[id].segments)
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
    }
}
