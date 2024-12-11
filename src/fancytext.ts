
class FancyText
{
    public segments: FancyText.TextSegment[];
}

namespace FancyText
{
    export class TextProperties
    {
        public color: ColorLike = 0;
        public subSuperScript: TextProperties.SubSuperScript = TextProperties.SubSuperScript.Normal;
    }

    export namespace TextProperties
    {
        export enum SubSuperScript { Normal, Subscript, Superscript }
    }

    export class TextSegment
    {
        public constructor(
            public text: string,
            public properties: TextProperties) {}
    }
}
