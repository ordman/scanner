export enum KizType {
    NO,
    SGTIN,
    SSCC,
    GTIN
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