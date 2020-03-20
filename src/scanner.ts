import {ParserFactory} from "./parser-factory";
import {Keyboard, ParserInterface} from "./parsers/parser-interface";

interface Observable<T, K> {
    on(event: T, fn: K, options?: boolean | AddEventListenerOptions);
}

declare type Subscriber = (data: any) => {};

export enum ScannerEvent {
    start = 'start',
    error = 'error',
    success = 'success',
}

export enum ScannerMode {
    mdlp = 'mdlp',
}

export class Scanner implements Observable<ScannerEvent, Subscriber> {
    private dirty: boolean = false;
    private buffer: string[] = [];
    private parser: ParserInterface<any>;

    constructor(private domNode: HTMLInputElement, mode: ScannerMode) {
        this.parser = ParserFactory.get(mode);
        this.listen();
    }

    on(event: ScannerEvent | string, fn: Subscriber, options?: boolean | AddEventListenerOptions): Scanner {
        this.domNode.addEventListener(event, fn, options);

        return this;
    }

    private listen(): void {
        this.domNode.addEventListener('keypress', (event: KeyboardEvent) => {
            if (!this.dirty) {
                this.domNode.dispatchEvent(new CustomEvent<any>(ScannerEvent.start));
                this.dirty = true;
            }

            if (event.code === Keyboard.Enter) {
                let data;
                try {
                    data = this.parser.handle(this.buffer);
                } catch (error) {
                    this.domNode.dispatchEvent(new CustomEvent<any>(ScannerEvent.error, {detail: error}));
                    this.clear();
                }
                if (data) {
                    this.domNode.dispatchEvent(new CustomEvent(ScannerEvent.success, {detail: data}));
                    this.clear();
                }
            } else {
                this.buffer.push(event.key);
            }
        });
    }

    private clear(): void {
        this.dirty = false;
        this.buffer = [];
        this.domNode.value = '';
    }

}
