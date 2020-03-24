import {KeyboardChar, ParserInterface} from "./parser-interface";
import {Kiz, KizType, SgtinKiz, SsccKiz, TokenId} from "./types";

export class MdlpParser implements ParserInterface<Kiz> {
    private kiz: KizService;

    constructor() {
        this.kiz = new KizService();
    }

    handle(buffer: string[]): SgtinKiz | SsccKiz {
        return this.kiz.getKiz(buffer.join(''));
    }
}

export class KizService {

    static getTokenId(token: string): string {
        return token.charAt(0) + token.charAt(1);
    }

    // parse sscc and return sscc clean string
    static makeSscc(data: string): SsccKiz {
        const sscc = data.substring(2);
        return {type: KizType.SSCC, sscc: sscc};
    }

    static createBinaryInBase64(kiz: string): string {
        const binaryCode = kiz.split(KeyboardChar.BracketRight).join(String.fromCharCode(29));
        return btoa(binaryCode);
    }

    static readonly map = {
        from: 'ёйцукенгшщзхъфывапролджэячсмитьбю.ЁЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.',
        to: '`qwertyuiop[]asdfghjkl;\'zxcvbnm,./`QWERTYUIOP[]ASDFGHJKL;\'ZXCVBNM,./'
    };

    static convertToLatin(data: string) {
        let $ = KizService;
        return data.split('').map(s => !~$.map.from.indexOf(s) ? s : $.map.to[$.map.from.indexOf(s)]).join('');
    }

    /**
     * String with endoding from scanner and GS replaced as ']'
     * @param data
     */
    makeSgtin(data: string): SgtinKiz {
        data = KizService.convertToLatin(data);
        const tokens1stage = data.split(KeyboardChar.BracketRight);
        const tokens2stage = this.separateOneTokenFromOther(tokens1stage, TokenId.GTIN, 16);
        const tokens3stage = this.separateOneTokenFromOther(tokens2stage, TokenId.SERIAL, 15);
        const tokens4stage = this.separateOneTokenFromOther(tokens3stage, TokenId.EXP_DATE, 8);
        const tokens5stage = this.separateOneTokenFromOther(tokens4stage, TokenId.CHECK_KEY, 6);
        const tokens = this.separateOneTokenFromOther(tokens5stage, TokenId.CRYPT_CODE, 46);
        const kiz = this.fillSgtin(tokens);
        kiz.raw_data = KizService.createBinaryInBase64(data);
        return kiz;
    }

    fillSgtin(tokens: Array<string>): SgtinKiz {
        let kiz: SgtinKiz = {
            type: KizType.SGTIN,
            gtin: '',
            serial: '',
            tnvd: '',
            batch: '',
            exp_date: '',
            raw_data: ''
        };
        tokens.forEach((token) => {
            const prefix = KizService.getTokenId(token);
            switch (prefix) {
                case TokenId.BATCH:
                    kiz.batch = token.substring(2);
                    break;
                case TokenId.EXP_DATE:
                    kiz.exp_date = token.substring(2);
                    break;
                case TokenId.TNVED_PART1:
                    if (token.charAt(2) === TokenId.TNVED_PART2) {
                        kiz.tnvd = token.substring(3);
                    }
                    break;
                case TokenId.SERIAL:
                    kiz.serial = token.substring(2);
                    break;
                case TokenId.GTIN:
                    kiz.gtin = token.substring(2);
                    break;
            }
        });
        return kiz;
    }

    // separate one token from others GTIN or EXP_DATE
    separateOneTokenFromOther(tokens: Array<string>, tokenId: TokenId.EXP_DATE | TokenId.GTIN | TokenId.CRYPT_CODE |
        TokenId.CHECK_KEY | TokenId.SERIAL, length: number): Array<string> {
        let ret: string[] = [];
        tokens.forEach(token => {
            if (KizService.getTokenId(token) === tokenId && token.length > length) {
                ret.push(token.substring(0, length));
                ret.push(token.substring(length));
            } else {
                ret.push(token);
            }
        });
        return ret;
    }

    // detect string and return Kiz
    getKiz(str: string): SgtinKiz | SsccKiz {
        const data = str.trim();
        const prefix = KizService.getTokenId(data);
        switch (prefix) {
            case TokenId.GTIN:
                return this.makeSgtin(data);
            case TokenId.SSCC:
                return KizService.makeSscc(data);
            default:
                throw new Error(`Unknown token type for prefix "${prefix}"`);
        }
    }

}
