
const MiddleC = 60;
const KeyConcertC = 0;

class Transposer
{
    private constructor()
    {
        throw new TypeError("Cannot make instance of Transposer");
    }

    public static transpose(pitch: number, startInst: number, startKey: number, endInst: number, endKey: number): number
    {
        /*
        instrument keys: key of _ -> concert _ = instrument C
        key signatures: key of _ -> concert _ = key C (do)
        key = instkey + keysig
        transposedpitch = transposed C + offset
        concertpitch = C + offset

        transposed C = C + key
        transposed C + offset = C + offset + key
        transposedpitch = concertpitch + key
        concertpitch = transposedpitch - key

        startpitch and endpitch are in transposed keys (aka not concert)
        startpitch - (startinst + startkey) = endpitch - (endinst + endkey)
        endpitch = startpitch - (startinst + startkey) + (endinst + endkey)
        */
        return pitch - startInst - startKey + endInst + endKey;
    }

    public static draw(graphics: RenderTarget, bounds: Vector2, position: Vector2, justify: Vector2, time: number): void
    {
        graphics.push();
        graphics.textFont(MainFont);

        const AnimationTime = 2;
        const Padding = 8;

        let size1 = 16;
        let width1 =
            DrawUtils.textWidth("P - (I + K) = P - (I + K)", MainFont, 16, NORMAL) +
            DrawUtils.textWidth("000fff", MainFont, 8, NORMAL) / 2;

        // scale text to fit inside bounds
        if (width1 > bounds.x - 2 * Padding)
            size1 = size1 * (bounds.x - 2 * Padding) / width1;

        graphics.pop();
    }
}