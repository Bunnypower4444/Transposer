const MiddleC = 60;
const KeyConcertC = 0;
class Transposer {
    constructor() {
        throw new TypeError("Cannot make instance of Transposer");
    }
    static transpose(pitch, startInst, startKey, endInst, endKey) {
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
}
