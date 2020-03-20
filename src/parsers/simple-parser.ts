import {ParserInterface} from "./parser-interface";

export class SimpleParser implements ParserInterface<{}> {
    handle(buffer: string[]) {
        return buffer.join('');
    }

}