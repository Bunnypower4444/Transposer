
const MiddleC = 60;
const KeyConcertC = 0;

/**
 * An animation for transposing notes.
 */
class Transposer
{
    public static transpose(pitch: number, startInst: number, startKey: number, endInst: number, endKey: number): number
    {
        /*
        instrument keys: key of _ -> concert _ = instrument C
        key signatures: key of _ -> concert _ = key C (do) in instrument key
        key = -instrument key + (keysig)
        transposedpitch = transposed C + offset
        concertpitch = C + offset

        transposed C = C + key
        transposed C + offset = C + offset + key
        transposedpitch = concertpitch + key
        concertpitch = transposedpitch - key

        startpitch and endpitch are in transposed keys (aka not concert)
        startpitch - (-startinst + startkey) = endpitch - (-endinst + endkey)
        endpitch = startpitch - (-startinst + startkey) + (-endinst + endkey)
        */
        return pitch - startInst - startKey + endInst + endKey;
    }

    public lines: FancyText[];
    
    public setParameters(pitch: number, startInst: number, startKey: number, endInst: number, endKey: number): void
    {
        const Script = FancyText.TextProperties.Script;

        this.lines = [];

        // line 1: formula
        this.lines.push(new FancyText([
            { text: "P", properties: { color: "green", style: ITALIC } },
            { text: "0", properties: { color: "green", script: Script.Subscript } },
            { text: " - (" },
            { text: "I", properties: { color: "blue", style: ITALIC } },
            { text: "0", properties: { color: "blue", script: Script.Subscript } },
            { text: " + " },
            { text: "K", properties: { color: "red", style: ITALIC } },
            { text: "0", properties: { color: "red", script: Script.Subscript } },
            { text: ") = " },

            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " - (" },
            { text: "I", properties: { color: "blue", style: ITALIC } },
            { text: "f", properties: { color: "blue", script: Script.Subscript, style: ITALIC } },
            { text: " + " },
            { text: "K", properties: { color: "red", style: ITALIC } },
            { text: "f", properties: { color: "red", script: Script.Subscript, style: ITALIC } },
            { text: ")" }
        ]));

        // line 2: substitution
        this.lines.push(new FancyText([
            { text: pitch.toString(), properties: { color: "green" } },
            { text: " - (" },
            { text: startInst.toString(), properties: { color: "blue" } },
            { text: " + " },
            { text: startKey.toString(), properties: { color: "red" } },
            { text: ") = " },

            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " - (" },
            { text: endInst.toString(), properties: { color: "blue" } },
            { text: " + " },
            { text: endKey.toString(), properties: { color: "red" } },
            { text: ")" }
        ]));

        // line 3: rearrage

        // line 4: evaluate
    }

    public draw(graphics: RenderTarget, sizeBounds: Vector2, position: Vector2, time: number): void
    {
        if (!this.lines)
            return;

        graphics.push();

        const AnimationTime = 2;
        const Padding = 8;

        for (let i = 0; i < this.lines.length; i++)
        {
            const line = this.lines[i];
            
            let size = 24;
            let width = this.lines[0].getWidth(size, MainFont);
            
            // scale text to fit inside bounds
            if (width > sizeBounds.x - 2 * Padding)
                size = size * (sizeBounds.x - 2 * Padding) / width;
            
            // for the textLeading
            graphics.textFont(MainFont);
            graphics.textSize(size);
            const leading = textLeading();
            
            line.draw(graphics, position.add(
                new Vector2(sizeBounds.x / 2, position.y + leading * (i + 0.5))),
                size, MainFont, new Vector2(0.5, 0.5));
        }

        graphics.pop();
    }
}