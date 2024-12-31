
class FancyText
{
    public segments: FancyText.TextSegment[];

    public constructor(segments: FancyText.TextSegmentData[])
    {
        this.segments = segments.map(v => new FancyText.TextSegment(v));
    }

    public draw(graphics: RenderTarget, position: Vector2, textSize: number, font: string, justify?: Vector2)
    {
        graphics.push();

        // adjust for justify
        position = position.sub(
            justify.mult(
                new Vector2(this.getWidth(textSize, font), textSize)));
        for (const segment of this.segments)
        {
            segment.draw(graphics, position, textSize, font, Vector2.zero);

            position = position.withX(position.x + segment.getWidth(textSize, font));
        }

        graphics.pop();
    }

    public getWidth(textSize: number, font: string): number
    {
        let w = 0;
        for (const segment of this.segments)
        {
            w += segment.getWidth(textSize, font);
        }

        return w;
    }
}

namespace FancyText
{
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
            if (props)
            {
                this.color = props.color ?? 0;
                this.script = props.script ?? TextProperties.Script.Normal;
                this.style = props.style ?? NORMAL;
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

        public draw(graphics: RenderTarget, position: Vector2, textSize: number, font: string, justify?: Vector2)
        {
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
