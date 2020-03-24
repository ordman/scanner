import {Scanner} from "./scanner";
import {MdlpParser} from "./parsers/mdlp-parser";
import {SgtinKiz, SsccKiz} from "./parsers/types";

export class MdlpScanner extends Scanner<SgtinKiz | SsccKiz> {

    constructor(domNode: HTMLInputElement) {
        super(domNode, new MdlpParser());
    }
}