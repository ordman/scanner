import {Scanner, ScannerMode} from "./scanner";

export class MdlpScanner extends Scanner {
    constructor(selector) {
        super(selector, ScannerMode.mdlp);
    }
}