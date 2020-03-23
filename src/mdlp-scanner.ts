import {Scanner} from "./scanner";
import {ScannerMode} from "./types";

export class MdlpScanner extends Scanner {
    constructor(selector) {
        super(selector, ScannerMode.mdlp);
    }
}