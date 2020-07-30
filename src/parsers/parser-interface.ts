export enum KeyboardChar {
    GS = 29,
    CR = 13,
    LF = 10,
}

export interface ParserInterface<T> {
    handle(buffer: number[]): T;
}
