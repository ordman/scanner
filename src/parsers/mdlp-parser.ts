import {KeyboardChar, ParserInterface} from "./parser-interface";
import {Kiz, KizInterface, KizType, SgtinKiz, SsccKiz, TokenId, TokenLength, TokenMaxLength} from "./types";

enum ParseStage {
    SearchToken,
    ParseValue
}

export class MdlpParser implements ParserInterface<Kiz> {

    static readonly map = {
        from: 'ёйцукенгшщзхъфывапролджэячсмитьбю.ЁЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.',
        to: '`qwertyuiop[asdfghjkl;\'zxcvbnm,./`QWERTYUIOP[ASDFGHJKL;\'ZXCVBNM,./'
    };

    static getTokenId(buffer: number[]): string {
        return buffer.slice(0, 2).map(i => String.fromCharCode(i)).join('');
    }

    static createBinaryInBase64(kiz: string): string {
        return btoa(kiz);
    }

    static convertToLatin(charCodes: number[]) {
        let $ = MdlpParser;
        return charCodes.map(
            s => !~$.map.from.indexOf(String.fromCharCode(s)) ?
                s : $.map.to[$.map.from.indexOf(String.fromCharCode(s))].charCodeAt(0)
        );
    }

    handle(buffer: number[]): SgtinKiz | SsccKiz {
        const token = MdlpParser.getTokenId(buffer);
        let kiz: Kiz;
        switch (token) {
            case TokenId.GTIN:
                kiz = {
                    type: KizType.SGTIN,
                    gtin: '',
                    serial: '',
                    tnvd: '',
                    batch: '',
                    exp_date: '',
                    raw_data: '',
                    check_key: '',
                    crypt_code: ''
                };
                return this.parseBuffer<SgtinKiz>(buffer, kiz);
            case TokenId.SSCC:
                kiz = {type: KizType.SSCC, sscc: '', raw_data: ''}
                return this.parseBuffer<SsccKiz>(buffer, kiz);
            default:
                throw new Error(`Unknown token type for prefix "${token}"`);
        }
    }

    private parseBuffer<T>(buffer: number[], kiz: KizInterface): T {
        buffer = MdlpParser.convertToLatin(buffer);
        if (!buffer) {
            throw Error('Can\'t convert buffer to latin');
        }
        const tokens: string[] = Object.values(TokenId);
        const tokenNames: string[] = Object.keys(TokenId);
        let tmp = '';
        let charCode: number, tokenName: string = '', raw: string = '', stage: ParseStage = ParseStage.SearchToken;
        while (buffer.length > 0) {
            charCode = buffer.shift() as number;
            raw += String.fromCharCode(charCode);
            if (charCode !== KeyboardChar.GS) {
                tmp += String.fromCharCode(charCode);
            }
            let index = stage === ParseStage.SearchToken ? tokens.indexOf(tmp) : -1;
            if ((charCode === KeyboardChar.GS || buffer.length === 0) && !!tokenName) {
                kiz[tokenName.toLowerCase()] = tmp;
                tmp = '';
                stage = ParseStage.SearchToken;
                continue;
            }
            if (
                index >= 0 &&
                (typeof TokenLength[tokenNames[index]] !== 'undefined' || typeof TokenMaxLength[tokenNames[index]] !== 'undefined')
            ) {
                stage = ParseStage.ParseValue;
                tokens.splice(index, 1).join('');
                tokenName = tokenNames.splice(index, 1).join('');
                tmp = '';
            }

            if (index >= 0 && tokenName && typeof TokenLength[tokenName] !== 'undefined') {
                const bufferPart = buffer.splice(0, TokenLength[tokenName]);
                kiz[tokenName.toLowerCase()] = bufferPart.map(i => String.fromCharCode(i)).join('');
                raw += kiz[tokenName.toLowerCase()];
                stage = ParseStage.SearchToken;
            }

        }

        kiz.raw_data = MdlpParser.createBinaryInBase64(raw);
        return kiz as unknown as T;
    }
}
