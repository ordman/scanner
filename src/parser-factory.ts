import {MdlpParser} from "./parsers/mdlp-parser";

import {SimpleParser} from "./parsers/simple-parser";
import {ScannerMode} from "./types";

export class ParserFactory {
    static get(parser: ScannerMode) {
        switch (parser) {
            case ScannerMode.mdlp:
                return new MdlpParser();
            default:
                return new SimpleParser();
        }
    }
}