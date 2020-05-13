export enum KizType {
    NO,
    SGTIN,
    SSCC,
    GTIN
}

export enum TokenId {
    GTIN = '01',
    SERIAL = '21',
    SSCC = '00',
    TNVD = '240',
    BATCH = '10',
    EXP_DATE = '17',
    CHECK_KEY = '91',
    CRYPT_CODE = '92'
}

export enum TokenLength {
    SSCC = 18,
    GTIN = 14,
    SERIAL = 13,
    EXP_DATE = 6,
    CHECK_KEY = 4,
    CRYPT_CODE = 44
}

export enum TokenMaxLength {
    BATCH = 20,
    TNVD = 30,
}

export interface KizInterface {
    type: KizType
    raw_data: string
}

export interface SgtinKiz extends KizInterface {
    gtin: string
    serial: string
    tnvd: string
    batch: string
    exp_date: string
    check_key: string
    crypt_code: string
}

export interface SsccKiz extends KizInterface {
    sscc: string
}

export interface NoKiz extends KizInterface {
    err_msg: string
}

export type Kiz = SgtinKiz | SsccKiz | NoKiz;
