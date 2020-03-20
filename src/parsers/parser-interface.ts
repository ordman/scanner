export enum KeyboardChar {
    BracketRight = ']',
}

export enum Keyboard {
    Enter = 'Enter',
    BracketRight = 'BracketRight',
}

export interface ParserInterface<T> {
    handle(buffer: string[]): T;
}