import { MdlpParser } from "./parsers/mdlp-parser";
import { ScannerMode } from "./scanner";
import { SimpleParser } from "./parsers/simple-parser";
export declare class ParserFactory {
    static get(parser: ScannerMode): MdlpParser | SimpleParser;
}
