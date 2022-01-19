/* eslint-disable prettier/prettier */
const { min, max } = Math;

export default class Tape {
    protected __pointer: number = 0;

    get pointer() {
        return this.__pointer;
    }

    protected set pointer(value) {
        this.__pointer = value;
    }

    public readonly data;

    // eslint-disable-next-line no-useless-constructor
    constructor(data: string) {
        this.data = data;
    }

    advance(steps: number = 1): string | undefined {
        this.pointer += steps;
        return this.data[this.pointer];
    }

    read(chars: number = 1): string {
        const string = this.peek(chars);
        this.advance(chars);
        return string;
    }

    readExactly(chars: number): string | undefined {
        const string = this.read(chars);
        if (string === undefined || string.length !== chars) return undefined;
        return string;
    }

    peek(chars: number = 1): string {
        const left = this.pointer + min(0, chars);
        const right = this.pointer + max(0, chars);
        return this.data.slice(left, right);
    }

    peekExactly(chars: number): string | undefined {
        const string = this.peek(chars);
        if (string === undefined || string.length !== chars) return undefined;
        return string;
    }

    get length() {
        return this.data.length;
    }

    debug() {
        console.log(
            `${this.data.slice(0, this.pointer)}[${this.peek()}]${this.data.slice(
                this.pointer + 1
            )}`
        );
    }

    warnExpected(message: string, expectedCount = 1, read = true): null {
        const { data, pointer } = this;
        const start = read ? pointer - expectedCount : pointer;
        const context = data.slice(start - 5, start);
        const missing = data
            .slice(start, start + expectedCount)
            .padEnd(expectedCount, "_");
        console.warn(`${message}: ${context}[${missing}]`);
        return null;
    }

    outOfBounds() {
        return this.pointer >= this.data.length - 1;
    }
}
