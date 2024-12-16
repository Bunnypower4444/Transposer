
class FancyText
{
    public segments: FancyText.TextSegment[];
    public textSize: number;


    public constructor(segments: FancyText.TextSegment[])
    {
        this.segments = segments;
    }
}

namespace FancyText
{
    export const ScriptScale = 0.5;

    export class TextProperties
    {
        public color: ColorLike = 0;
        public script: TextProperties.Script = TextProperties.Script.Normal;
        public style: TextStyle = NORMAL;
    }

    export namespace TextProperties
    {
        export enum Script { Normal, Subscript, Superscript }
    }

    export class TextSegment
    {
        public constructor(
            public text: string,
            public properties: TextProperties) {}

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

            

            graphics.pop();
        }
    }
}
