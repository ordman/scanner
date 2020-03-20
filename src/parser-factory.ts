import {MdlpParser} from "./parsers/mdlp-parser";
import {ScannerMode} from "./scanner";
import {SimpleParser} from "./parsers/simple-parser";

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