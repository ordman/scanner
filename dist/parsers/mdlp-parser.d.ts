import { ParserInterface } from "./parser-interface";
export declare class MdlpParser implements ParserInterface<any> {
    private kiz;
    constructor();
    handle(buffer: string[]): Kiz;
}
export declare enum KizType {
    NO = 0,
    SGTIN = 1,
    SSCC = 2
}
export declare enum TokenId {
    GTIN = "01",
    SERIAL = "21",
    SSCC = "00",
    TNVED_PART1 = "24",
    TNVED_PART2 = "0",
    BATCH = "10",
    EXP_DATE = "17",
    CHECK_KEY = "91",
    CRYPT_CODE = "92"
}
export interface SgtinKiz {
    type: KizType.SGTIN;
    gtin: string;
    serial: string;
    tnvd: string;
    batch: string;
    exp_date: string;
    raw_data: string;
}
export interface SsccKiz {
    type: KizType.SSCC;
    sscc: string;
}
export interface NoKiz {
    type: KizType.NO;
    err_msg: string;
}
export declare type Kiz = SgtinKiz | SsccKiz | NoKiz;
export declare class KizService {
    static readonly SEPARATOR = "]";
    static getTokenId(token: string): string;
    static makeSscc(data: string): Kiz;
    static createBinaryInBase64(kiz: string): string;
    makeSgtin(data: string): Kiz;
    fillSgtin(tokens: Array<string>): SgtinKiz;
    seperateOneTokenFromOther(tokens: Array<string>, tokenId: TokenId.EXP_DATE | TokenId.GTIN | TokenId.CRYPT_CODE | TokenId.CHECK_KEY | TokenId.SERIAL, length: number): Array<string>;
    getKiz(str: string): Kiz;
}
