import {ParserInterface} from "./parser-interface";

export class MdlpParser implements ParserInterface<any> {
    private kiz: KizService;

    constructor() {
        this.kiz = new KizService();
    }

    handle(buffer: string[]) {
        return this.kiz.getKiz(buffer.join(''));
    }
}

export enum KizType {
    NO,
    SGTIN,
    SSCC,
}

export enum TokenId {
    GTIN = '01', // 14
    SERIAL = '21', // 13
    SSCC = '00',
    TNVED_PART1 = '24',
    TNVED_PART2 = '0',
    BATCH = '10',
    EXP_DATE = '17',
    CHECK_KEY = '91', // 4
    CRYPT_CODE = '92' // 44
}

export interface SgtinKiz {
    type: KizType.SGTIN
    gtin: string
    serial: string
    tnvd: string
    batch: string
    exp_date: string
    raw_data: string
}

export interface SsccKiz {
    type: KizType.SSCC
    sscc: string
}

export interface NoKiz {
    type: KizType.NO
    err_msg: string
}

export type Kiz = SgtinKiz | SsccKiz | NoKiz;

export class KizService {

    static readonly SEPARATOR = ']';

    static getTokenId(token: string): string {
        return token.charAt(0) + token.charAt(1);
    }

    // parse sscc and return sscc clean string
    static makeSscc(data: string): Kiz {
        const sscc = data.substring(2);
        return {type: KizType.SSCC, sscc: sscc};
    }

    static createBinaryInBase64(kiz: string): string {
        const binaryCode = kiz.split(KizService.SEPARATOR).join(String.fromCharCode(29));
        return btoa(binaryCode);
    }

    /**
     * String with endoding from scanner and GS replaced as ']'
     * @param data
     */
    makeSgtin(data: string): Kiz {
        const tokens1stage = data.split(KizService.SEPARATOR);
        const tokens2stage = this.seperateOneTokenFromOther(tokens1stage, TokenId.GTIN, 16);
        const tokens3stage = this.seperateOneTokenFromOther(tokens2stage, TokenId.SERIAL, 15);
        const tokens4stage = this.seperateOneTokenFromOther(tokens3stage, TokenId.EXP_DATE, 8);
        const tokens5stage = this.seperateOneTokenFromOther(tokens4stage, TokenId.CHECK_KEY, 6);
        const tokens = this.seperateOneTokenFromOther(tokens5stage, TokenId.CRYPT_CODE, 46);
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

    // seperate one token from others GTIN or EXP_DATE
    seperateOneTokenFromOther(tokens: Array<string>, tokenId: TokenId.EXP_DATE | TokenId.GTIN | TokenId.CRYPT_CODE |
        TokenId.CHECK_KEY | TokenId.SERIAL, length: number): Array<string> {
        tokens.forEach((token, index) => {
            if (KizService.getTokenId(token) === tokenId && token.length > length) {
                tokens.splice(index, 1);
                tokens.push(token.substring(0, length));
                tokens.push(token.substring(length));
            }
        });
        return tokens;
    }

    // detect string and return Kiz
    getKiz(str: string): Kiz {
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
