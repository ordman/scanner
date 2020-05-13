export enum KeyboardChar {
    GS = 29,
    CR = 13,
}

export interface ParserInterface<T> {
    handle(buffer: number[]): T;
}
