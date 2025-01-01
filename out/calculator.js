const MiddleC = 60;
const KeyConcertC = 0;
/**
 * An animation for transposing notes.
 */
class Transposer {
    static midiNumToFancyText(pitch, color = 0) {
        let name;
        switch (pitch % 12) {
            case 0:
                name = "B♯/C";
                break;
            case 1:
                name = "C♯/D♭";
                break;
            case 2:
                name = "D";
                break;
            case 3:
                name = "D♯/E♭";
                break;
            case 4:
                name = "E/F♭";
                break;
            case 5:
                name = "E♯/F";
                break;
            case 6:
                name = "F♯/G♭";
                break;
            case 7:
                name = "G";
                break;
            case 8:
                name = "G♯/A♭";
                break;
            case 9:
                name = "A";
                break;
            case 10:
                name = "A♯/B♭";
                break;
            case 11:
                name = "B/C♭";
                break;
            default:
                name = "?";
                break;
        }
        let number = Math.floor(pitch / 12) - 1;
        return [
            { text: name, properties: { color: color } },
            { text: number.toString(), properties: { script: FancyText.TextProperties.Script.Subscript, color: color }
            }
        ];
    }
    static transpose(pitch, startInst, startKey, endInst, endKey) {
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
    lines;
    setParameters(pitch, startInst, startKey, endInst, endKey) {
        const Script = FancyText.TextProperties.Script;
        this.lines = [];
        // line 1: formula
        // P₀ - (-I₀ + K₀) = Pf - (-If + Kf)
        this.lines.push(new FancyText([
            { text: "P", properties: { color: "green", style: ITALIC } },
            { text: "0", properties: { color: "green", script: Script.Subscript } },
            { text: " - (-" },
            { text: "I", properties: { color: "blue", style: ITALIC } },
            { text: "0", properties: { color: "blue", script: Script.Subscript } },
            { text: " + " },
            { text: "K", properties: { color: "red", style: ITALIC } },
            { text: "0", properties: { color: "red", script: Script.Subscript } },
            { text: ") = " },
            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " - (-" },
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
            { text: " - (-" + ((startInst < 0) ? "(" : "") },
            { text: startInst.toString(), properties: { color: "blue" } },
            { text: ((startInst < 0) ? ")" : "") + " + " },
            { text: startKey.toString(), properties: { color: "red" } },
            { text: ") = " },
            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " - (-" + ((endInst < 0) ? "(" : "") },
            { text: endInst.toString(), properties: { color: "blue" } },
            { text: ((endInst < 0) ? ")" : "") + " + " },
            { text: endKey.toString(), properties: { color: "red" } },
            { text: ")" }
        ]));
        // line 3: rearrange
        // Pf = P₀ - (-I₀ + K₀) + (-If + Kf)
        this.lines.push(new FancyText([
            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " = " },
            { text: pitch.toString(), properties: { color: "green" } },
            { text: " - (-" + ((startInst < 0) ? "(" : "") },
            { text: startInst.toString(), properties: { color: "blue" } },
            { text: ((startInst < 0) ? ")" : "") + " + " },
            { text: startKey.toString(), properties: { color: "red" } },
            { text: ") + (-" + ((endInst < 0) ? "(" : "") },
            { text: endInst.toString(), properties: { color: "blue" } },
            { text: ((endInst < 0) ? ")" : "") + " + " },
            { text: endKey.toString(), properties: { color: "red" } },
            { text: ")" }
        ]));
        // line 4: evaluate parenthesis
        this.lines.push(new FancyText([
            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " = " },
            { text: pitch.toString(), properties: { color: "green" } },
            { text: " - " + ((-startInst + startKey < 0) ? "(" : "") },
            { text: (-startInst + startKey).toString() },
            { text: ((-startInst + startKey < 0) ? ")" : "") + " + " },
            { text: (-endInst + endKey).toString() }
        ]));
        // line 5: answer
        let answer = Transposer.transpose(pitch, startInst, startKey, endInst, endKey);
        this.lines.push(new FancyText([
            { text: "P", properties: { color: "purple", style: ITALIC } },
            { text: "f", properties: { color: "purple", script: Script.Subscript, style: ITALIC } },
            { text: " = " },
            ...Transposer.midiNumToFancyText(answer)
        ]));
    }
    draw(graphics, sizeBounds, position, time) {
        if (!this.lines)
            return;
        graphics.push();
        const AnimationTime = 2;
        const Padding = 8;
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            let size = 24;
            let width = this.lines[0].getWidth(size, MainFont);
            // scale text to fit inside bounds
            if (width > sizeBounds.x - 2 * Padding)
                size = size * (sizeBounds.x - 2 * Padding) / width;
            // for the textLeading
            graphics.textFont(MainFont);
            graphics.textSize(size);
            const leading = graphics.textLeading();
            line.draw(graphics, position.add(new Vector2(sizeBounds.x / 2, position.y + leading * (i + 0.5))), size, MainFont, new Vector2(0.5, 0.5));
        }
        graphics.pop();
    }
}
