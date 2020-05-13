import {KizType, SgtinKiz, SsccKiz} from '../src';
import {MdlpParser} from '../src/parsers/mdlp-parser';

// @ts-ignore
global.btoa = function btoa(str) {
    if (Buffer.byteLength(str) !== str.length)
        throw new Error('bad string!');
    return Buffer.from(str, 'binary').toString('base64');
};
describe('MdlpParser', () => {
    let parser: MdlpParser = new MdlpParser();

    const INPUT = '01189011481011941721120010B900001240300421B2NIYIB5VHN18';
    const INPUT_RU = '01189011481011941721120010И900001240300421И2ТШНШИ5МРТ18';
    const INPUT_DATA = INPUT.split('').map(i => i.charCodeAt(0));
    const INPUT_DATA_RU = INPUT_RU.split('').map(i => i.charCodeAt(0));
    const WRONG_INPUT_DATA = '45333334301282786824628427487284783fDDDDDaklhdiuffff33333'.split('').map(i => i.charCodeAt(0));

    const BINARY_KIZ_IN_BASE64 = 'MDExODkwMTE0ODEwMTE5NDE3MjExMjAwMTBCOTAwMDAxHTI0MDMwMDQdMjFCMk5JWUlCNVZITjE4';

    const INPUT_DATA_WITH_CHECK_CODE = '0112345678901231210000000009102910bad92YntF8eliG9/1KohpDEKWt8/Q7Zm1LkcMJaLdWml5IoOf'.split('').map(i => i.charCodeAt(0));

    const BINARY_KIZ_WITH_CHECK_CODE_IN_BASE64 = 'MDExMjM0NTY3ODkwMTIzMTIxMDAwMDAwMDAwOTEwMjkxMGJhZDkyWW50RjhlbGlHOS8xS29ocERFS1d0OC9RN1ptMUxrY01KYUxkV21sNUlvT2Y=';

    const EXP_GTIN = '18901148101194';
    const EXP_DATE = '211200';
    const EXP_BATCH = 'B900001';
    const EXP_TNVD = '3004';
    const EXP_SERIAL = 'B2NIYIB5VHN18';
    const SSCC = '00123456789012345678';
    const SSCC_DATA = SSCC.split('').map(i => i.charCodeAt(0));
    const EXPECTED_SSCC = '123456789012345678';

    const EXP_KIZ_SSCC: SsccKiz = {type: KizType.SSCC, sscc: EXPECTED_SSCC, raw_data: 'MDAxMjM0NTY3ODkwMTIzNDU2Nzg='};

    const EXP_KIZ_GTIN: SgtinKiz = {
        type: KizType.SGTIN,
        gtin: EXP_GTIN,
        serial: EXP_SERIAL,
        tnvd: EXP_TNVD,
        batch: EXP_BATCH,
        exp_date: EXP_DATE,
        raw_data: BINARY_KIZ_IN_BASE64,
        check_key: '',
        crypt_code: ''
    };

    const EXP_KIZ_GTIN_WITH_CODE: SgtinKiz = {
        type: KizType.SGTIN,
        gtin: '12345678901231',
        serial: '0000000009102',
        raw_data: BINARY_KIZ_WITH_CHECK_CODE_IN_BASE64,
        tnvd: '',
        batch: '',
        check_key: '0bad',
        crypt_code: 'YntF8eliG9/1KohpDEKWt8/Q7Zm1LkcMJaLdWml5IoOf',
        exp_date: ''
    };

    it('#convertToLatin should convert ONLY RU chars to LATIN', () => {
        expect(MdlpParser.convertToLatin(INPUT_DATA_RU)).toEqual(INPUT_DATA);
        expect(MdlpParser.convertToLatin(INPUT_DATA)).toEqual(INPUT_DATA);
    });

    it('#handle SGTIN (en) input', () => {
        const result = parser.handle(INPUT_DATA);
        expect(result).toEqual(EXP_KIZ_GTIN);
    });

    it('#handle SGTIN (ru) input', () => {
        const result = parser.handle(INPUT_DATA_RU);
        expect(result).toEqual(EXP_KIZ_GTIN);
    });

    it('#getTokenId should return token id', () => {
        expect(MdlpParser.getTokenId(INPUT_DATA)).toBe('01');
    });

    it('#handle SSCC input', () => {
        expect(parser.handle(SSCC_DATA)).toEqual(EXP_KIZ_SSCC);
    });


    it('#handle SGTIN (en) input with crypt_code', () => {
        expect(parser.handle(INPUT_DATA_WITH_CHECK_CODE)).toEqual(EXP_KIZ_GTIN_WITH_CODE);
    });


    it('#getKiz with wrong data should return Kiz no type', () => {
        expect(() => parser.handle(WRONG_INPUT_DATA)).toThrow('Unknown token type for prefix "45"');
    });

    it('MdlpParser.createBinaryInBase64 should return binary kiz in base64', () => {
        expect(MdlpParser.createBinaryInBase64(INPUT)).toEqual(BINARY_KIZ_IN_BASE64);
    })

});
