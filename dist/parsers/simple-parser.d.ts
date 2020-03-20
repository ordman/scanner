import { ParserInterface } from "./parser-interface";
export declare class SimpleParser implements ParserInterface<{}> {
    handle(buffer: string[]): string;
}
