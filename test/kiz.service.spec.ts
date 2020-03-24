import {KizType, SgtinKiz, SsccKiz, TokenId} from '../src/parsers/types';
import {KizService} from '../src/parsers/mdlp-parser';
import {KeyboardChar} from "../src/parsers/parser-interface";

// @ts-ignore
global.btoa = function btoa(str) {
    if (Buffer.byteLength(str) !== str.length)
        throw new Error('bad string!');
    return Buffer.from(str, 'binary').toString('base64');
};
describe('KizService', () => {
    let service: KizService;

    const INPUT_DATA = '01189011481011941721120010B900001]2403004]21B2NIYIB5VHN18';
    const INPUT_DATA_RU = '01189011481011941721120010И900001]2403004]21И2ТШНШИ5МРТ18';
    const WRONG_INPUT_DATA = '45333334301282786824628427487284783fDDDDDaklhdiuffff33333';

    const BINARY_KIZ_IN_BASE64 = 'MDExODkwMTE0ODEwMTE5NDE3MjExMjAwMTBCOTAwMDAxHTI0MDMwMDQdMjFCMk5JWUlCNVZITjE4';

    const INPUT_DATA_WITH_CHECK_CODE = '0112345678901231210000000009102910bad92YntF8eliG9/1KohpDEKWt8/Q7Zm1LkcMJaLdWml5IoOf';

    const BINARY_KIZ_WITH_CHECK_CODE_IN_BASE64 = 'MDExMjM0NTY3ODkwMTIzMTIxMDAwMDAwMDAwOTEwMjkxMGJhZDkyWW50RjhlbGlHOS8xS29ocERFS1d0OC9RN1ptMUxrY01KYUxkV21sNUlvT2Y=';

    const EXP_GTIN = '18901148101194';
    const EXP_DATE = '211200';
    const EXP_BATCH = 'B900001';
    const EXP_TNVD = '3004';
    const EXP_SERIAL = 'B2NIYIB5VHN18';
    const SSCC = '00123456789012345678';
    const EXPECTED_SSCC = '123456789012345678';
    const EXP_TOKENS_SEPARATE_GTIN: Array<string> = [
        '0118901148101194',
        '1721120010B900001',
        '2403004',
        '21B2NIYIB5VHN18'
    ];
    const EXP_TOKENS_SEPARATE_GTIN_BEFORE_EXP_DATE: Array<string> = [
        '0118901148101194',
        '17211200',
        '10B900001',
        '2403004',
        '21B2NIYIB5VHN18'
    ];

    const EXP_KIZ_SSCC: SsccKiz = {type: KizType.SSCC, sscc: EXPECTED_SSCC};

    const EXP_KIZ_GTIN: SgtinKiz = {
        type: KizType.SGTIN, gtin: EXP_GTIN, serial: EXP_SERIAL,
        tnvd: EXP_TNVD, batch: EXP_BATCH, exp_date: EXP_DATE, raw_data: BINARY_KIZ_IN_BASE64
    };

    const EXP_KIZ_GTIN_WITH_CODE: SgtinKiz = {
        type: KizType.SGTIN,
        gtin: '12345678901231',
        serial: '0000000009102',
        raw_data: BINARY_KIZ_WITH_CHECK_CODE_IN_BASE64,
        tnvd: '',
        batch: '',
        exp_date: ''
    };

    beforeEach(() => {
        service = new KizService();
    });

    it('#convertToLatin should convert ONLY RU chars to LATIN', () => {
        expect(KizService.convertToLatin(INPUT_DATA_RU)).toEqual(INPUT_DATA);
        expect(KizService.convertToLatin(INPUT_DATA)).toEqual(INPUT_DATA);
    });

    it('#separateOneTokenFromOther should find token for id 01(GTIN) and separate it from 2 id data and add it parts to tokens,' +
        'but found token must be deleted from array', () => {
        const tokens = INPUT_DATA.split(KeyboardChar.BracketRight);
        const result = service.separateOneTokenFromOther(tokens, TokenId.GTIN, 16);
        expect(result).toEqual(EXP_TOKENS_SEPARATE_GTIN);
    });

    it('#separateOneTokenFromOther should find token for id 17 and separate it from 2 id data and add it parts to tokens,' +
        'but found token must be deleted from array', () => {
        const tokens = INPUT_DATA.split(KeyboardChar.BracketRight);
        const stage1tokens = service.separateOneTokenFromOther(tokens, TokenId.GTIN, 16);
        const result = service.separateOneTokenFromOther(stage1tokens, TokenId.EXP_DATE, 8);
        expect(result).toEqual(EXP_TOKENS_SEPARATE_GTIN_BEFORE_EXP_DATE);
    });

    it('#getTokenId should return token id', () => {
        expect(KizService.getTokenId(INPUT_DATA)).toBe('01');
    });

    it('#makeSscc should retun from string with sscc Kiz for sscc type', () => {
        expect(KizService.makeSscc(SSCC)).toEqual(EXP_KIZ_SSCC);
    });

    it('#fillSgtin should return filled SgtinKiz from input tokens', () => {
        const res = service.fillSgtin(EXP_TOKENS_SEPARATE_GTIN_BEFORE_EXP_DATE);
        res.raw_data = BINARY_KIZ_IN_BASE64;
        expect(res).toEqual(EXP_KIZ_GTIN);
    });

    it('#makeSgtin should return from string with sgtin Kiz sgtin type', () => {
        expect(service.makeSgtin(INPUT_DATA)).toEqual(EXP_KIZ_GTIN);
    });

    it('#makeSgtin should return from RU string with sgtin Kiz sgtin type', () => {
        expect(service.makeSgtin(INPUT_DATA_RU)).toEqual(EXP_KIZ_GTIN);
    });

    it('#makeSgtin should return from string with sgtin and has crypt_code Kiz sgtin type', () => {
        expect(service.makeSgtin(INPUT_DATA_WITH_CHECK_CODE)).toEqual(EXP_KIZ_GTIN_WITH_CODE);
    });


    it('#getKiz with sgtin data  should return Kiz sgtin type', () => {
        expect(service.getKiz(INPUT_DATA)).toEqual(EXP_KIZ_GTIN);
    });

    it('#getKiz with sscc data should return Kiz sscc type', () => {
        expect(service.getKiz(SSCC)).toEqual(EXP_KIZ_SSCC);
    });

    it('#getKiz with wrong data should return Kiz no type', () => {
        expect(() => service.getKiz(WRONG_INPUT_DATA)).toThrow('Unknown token type for prefix "45"');
    });

    it('KizService.createBinaryInBase64 should return binary kiz in base64', () => {
        expect(KizService.createBinaryInBase64(INPUT_DATA)).toEqual(BINARY_KIZ_IN_BASE64);
    })

});
