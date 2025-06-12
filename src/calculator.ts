
/*
Animations:
 * new class for it
 * create extension of TextSegment related things
 * Have ID property: code moves things with same ID
 */

const MiddleC = 60;
const KeyConcertC = 0;

/**
 * An animation for transposing notes.
 */
class Transposer
{
    public static midiNumToFancyText(pitch: number, color: ColorLike = 0): FancyText.TextSegmentData[]
    {
        let name: string;
        switch (pitch % 12)
        {
            case 0: name = "B♯/C"; break;
            case 1: name = "C♯/D♭"; break;
            case 2: name = "D"; break;
            case 3: name = "D♯/E♭"; break;
            case 4: name = "E/F♭"; break;
            case 5: name = "E♯/F"; break;
            case 6: name = "F♯/G♭"; break;
            case 7: name = "G"; break;
            case 8: name = "G♯/A♭"; break;
            case 9: name = "A"; break;
            case 10: name = "A♯/B♭"; break;
            case 11: name = "B/C♭"; break;
            default: name = "?"; break;
        }

        let number = Math.floor(pitch / 12) - 1;

        return [
            { text: name, properties: { color: color } },
            { text: number.toString(), properties:
                { script: FancyText.TextProperties.Script.Subscript, color: color }
            }
        ];
    }

    public static transpose(pitch: number, startInst: number, startKey: number, endInst: number, endKey: number): number
    {
        /*
        instrument keys: key of _ -> concert _ = instrument C
            concert C - key = instrument C
            instrument C + key = concert C
        key signatures: key of _ -> concert _ = key C (do) in instrument key
            do in key C + key = do in key _

        key = -instrument key + inst keysig
        transposedpitch = transposed C + offset
        concertpitch = C + offset

        transposed C = C + key
        transposed C + offset = C + offset + key
        transposedpitch = concertpitch + key
        concertpitch = transposedpitch - key

        to go from one transposition to another:
        startpitch and endpitch are in transposed keys (aka not concert)

        startpitch - startkey = concertpitch
        concertpitch + endkey = endpitch

        startpitch - startkey = endpitch - endkey

        startpitch - (-startinst + startkey) = endpitch - (-endinst + endkey)
        endpitch = startpitch - (-startinst + startkey) + (-endinst + endkey)
        */
        return pitch - (-startInst + startKey) + (-endInst + endKey);
    }

    public lines: FancyText[];
    
    public setParameters(pitch: number, startInst: number, startKey: number, endInst: number, endKey: number): void
    {
        const Script = FancyText.TextProperties.Script;

        this.lines = [];

        // line 1: formula
        // P₀ - (-I₀ + K₀) = Pf - (-If + Kf)
        this.lines.push(FancyText.Animations.create([
            { text: "P", properties: { color: "green", style: ITALIC, animID: "P0" } },
            { text: "0", properties: { color: "green", script: Script.Subscript, animID: "P0" } },
            { text: " - (-", properties: { animID: "op0" } },
            { text: "I", properties: { color: "blue", style: ITALIC, animID: "I0" } },
            { text: "0", properties: { color: "blue", script: Script.Subscript, animID: "I0" } },
            { text: " + ", properties: { animID: "op1" } },
            { text: "K", properties: { color: "red", style: ITALIC, animID: "K0" } },
            { text: "0", properties: { color: "red", script: Script.Subscript, animID: "K0" } },
            { text: ") = ", properties: { animID: "op2" } },

            { text: "P", properties: { color: "purple", style: ITALIC, animID: "Pf" } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC, animID: "Pf" } },
            { text: " - (-", properties: { animID: "op3" } },
            { text: "I", properties: { color: "blue", style: ITALIC, animID: "If" } },
            { text: "f", properties: { color: "blue", script: Script.Subscript, style: ITALIC, animID: "If" } },
            { text: " + ", properties: { animID: "op4" } },
            { text: "K", properties: { color: "red", style: ITALIC, animID: "Kf" } },
            { text: "f", properties: { color: "red", script: Script.Subscript, style: ITALIC, animID: "Kf" } },
            { text: ")", properties: { animID: "op5" } }
        ]));

        // line 2: substitution
        this.lines.push(FancyText.Animations.create([
            { text: pitch.toString(), properties: { color: "green", animID: "P0" } },
            { text: " - (-" + ((startInst < 0) ? "(" : ""), properties: { animID: "op0" } },
            { text: startInst.toString(), properties: { color: "blue", animID: "I0" } },
            { text: ((startInst < 0) ? ")" : "") + " + ", properties: { animID: "op1" } },
            { text: startKey.toString(), properties: { color: "red", animID: "K0" } },
            { text: ")", properties: { animID: ["op2", "op7"] } },
            { text: " = ", properties: { animID: ["op2", "op6"] } },

            { text: "P", properties: { color: "purple", style: ITALIC, animID: "Pf" } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC, animID: "Pf" } },
            { text: " - (-" + ((endInst < 0) ? "(" : ""), properties: { animID: "op3" } },
            { text: endInst.toString(), properties: { color: "blue", animID: "If" } },
            { text: ((endInst < 0) ? ")" : "") + " + ", properties: { animID: "op4" } },
            { text: endKey.toString(), properties: { color: "red", animID: "Kf" } },
            { text: ")", properties: { animID: "op5" } }
        ]));

        // line 3: flip sides
        this.lines.push(FancyText.Animations.create([
            { text: "P", properties: { color: "purple", style: ITALIC, animID: "Pf" } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC, animID: "Pf" } },
            { text: " - (-" + ((endInst < 0) ? "(" : ""), properties: { animID: "op3" } },
            { text: endInst.toString(), properties: { color: "blue", animID: "If" } },
            { text: ((endInst < 0) ? ")" : "") + " + ", properties: { animID: "op4" } },
            { text: endKey.toString(), properties: { color: "red", animID: "Kf" } },
            { text: ")", properties: { animID: "op5" } },
            { text: " = ", properties: { animID: "op6" } },

            { text: pitch.toString(), properties: { color: "green", animID: "P0" } },
            { text: " - (-" + ((startInst < 0) ? "(" : ""), properties: { animID: "op0" } },
            { text: startInst.toString(), properties: { color: "blue", animID: "I0" } },
            { text: ((startInst < 0) ? ")" : "") + " + ", properties: { animID: "op1" } },
            { text: startKey.toString(), properties: { color: "red", animID: "K0" } },
            { text: ")", properties: { animID: "op7" } },
        ]));

        // line 4: rearrange (move - (-If + Kf) to the other side)
        // Pf = P₀ - (-I₀ + K₀) + (-If + Kf)
        this.lines.push(FancyText.Animations.create([
            { text: "P", properties: { color: "purple", style: ITALIC, animID: "Pf" } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC, animID: "Pf" } },
            { text: " = ", properties: { animID: "op6" } },

            { text: pitch.toString(), properties: { color: "green", animID: "P0" } },
            { text: " - ", properties: { animID: ["op0", "op8"] } },
            { text: "(", properties: { animID: "op0" } },
            { text: "-" + ((startInst < 0) ? "(" : ""), properties: { animID: ["op0", "I0+K0_0"] } },
            { text: startInst.toString(), properties: { color: "blue", animID: ["I0", "I0+K0_0"] } },
            { text: ((startInst < 0) ? ")" : ""), properties: { animID: ["op1", "I0+K0_0"] } },
            { text: " + ", properties: { animID: "op1" } },
            { text: startKey.toString(), properties: { color: "red", animID: ["K0", "I0+K0_1"] } },
            { text: ")", properties: { animID: "op7" } },
            { text: " + ", properties: { animID: ["op3", "op9"] } },
            { text: "(", properties: { animID: "op3" } },
            { text: "-" + ((endInst < 0) ? "(" : ""), properties: { animID: ["op3", "If+Kf_0"] } },
            { text: endInst.toString(), properties: { color: "blue", animID: ["If", "If+Kf_0"] } },
            { text: ((endInst < 0) ? ")" : ""), properties: { animID: ["op4", "If+Kf_0"] } },
            { text: " + ", properties: { animID: "op4" } },
            { text: endKey.toString(), properties: { color: "red", animID: ["Kf", "If+Kf_1"] } },
            { text: ")", properties: { animID: "op5" } }
        ]));

        // line 5: evaluate parenthesis
        this.lines.push(FancyText.Animations.create([
            { text: "P", properties: { color: "purple", style: ITALIC, animID: "Pf" } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC, animID: "Pf" } },
            { text: " = ", properties: { animID: "op6" } },

            { text: pitch.toString(), properties: { color: "green", animID: ["P0", "ans0"] } },
            { text: " - ", properties: { animID: "op8" } },
            { text: ((-startInst + startKey < 0) ? "(" : "")
                    + (-startInst + startKey).toString()
                    + ((-startInst + startKey < 0) ? ")" : ""),
                properties: { animID: ["I0+K0_0", "I0+K0_1", "ans1"] } },
            { text: " + ", properties: { animID: "op9" } },
            { text: (-endInst + endKey).toString(), properties: { animID: ["If+Kf_0", "If+Kf_1", "ans2"] } }
        ]));

        // line 6: answer
        let answer = Transposer.transpose(
            pitch,
            startInst, startKey,
            endInst, endKey);
        this.lines.push(FancyText.Animations.create([
            { text: "P", properties: { color: "purple", style: ITALIC, animID: "Pf" } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC, animID: "Pf" } },
            { text: " = ", properties: { animID: "op6" } },
            { text: answer.toString(), properties: { color: "purple", animID: ["ans0", "ans1", "ans2"] } },
            { text: " = " },

            ...Transposer.midiNumToFancyText(answer, "purple")
        ]));
    }

    public draw(graphics: RenderTarget, sizeBounds: Vector2, position: Vector2, time: number, animTime: number): void
    {
        if (!this.lines)
            return;

        graphics.push();

        const Padding = 20;

        /* for (let i = 0; i < this.lines.length; i++)
        {
            const line = this.lines[i];
            
            let size = 24;
            let width = FancyText.getWidth(line, size, MainFont);
            
            // scale text to fit inside bounds
            if (width > sizeBounds.x - 2 * Padding)
                size = size * (sizeBounds.x - 2 * Padding) / width;
            
            // for the textLeading
            graphics.textFont(MainFont);
            graphics.textSize(size);
            const leading = graphics.textLeading();
            
            FancyText.draw(graphics, line, position.add(
                new Vector2(sizeBounds.x / 2, position.y + leading * (i + 0.5))),
                size, MainFont, new Vector2(0.5, 0.5));
        } */

        FancyText.Animations.draw(graphics, this.lines, position.add(new Vector2(sizeBounds.x / 2, Padding)),
            24, MainFont, this.lines.length * time / animTime, new Vector2(0.5, 0.5));

        graphics.pop();
    }
}