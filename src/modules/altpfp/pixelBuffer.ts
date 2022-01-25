/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */

class PixelBuffer {
    protected _pointer: number = 0;

    protected _nextPixel: number = 0;

    protected get nextPixel() {
        return this._nextPixel;
    }

    protected set nextPixel(nextPixel) {
        if (nextPixel < 0) throw new Error("nextPixel can't be negative");
        if (nextPixel > this.pointer) throw new RangeError("nextPixel can't be greater than pointer");
        if (nextPixel > this.length) throw new RangeError("nextPixel can't be out of bounds");
        this._nextPixel = nextPixel;
    }

    protected get pointer() {
        return this._pointer;
    }

    protected set pointer(pointer) {
        if (pointer < 0) throw new RangeError("pointer can't be negative");
        if (pointer > this.length) throw new RangeError("pointer can't be out of bounds");
        if (pointer < this.nextPixel) throw new RangeError("pointer can't be less than nextPixel")
        this._pointer = pointer;
    }

    protected pixels: RGB[];

    constructor(readonly length: number, defaultColour: RGB = [255, 255, 255]) {
        this.pixels = Array.from<RGB>({ length }).fill(defaultColour);
    }

    protected _place(pixel: RGB) {
        this.pixels[this.pointer] = pixel;
        this.pointer += 1;
        this.nextPixel = this.pointer;
    }

    protected _peek(pixels: number): RGB[] {
        return this.pixels.slice(this.pointer, this.pointer + pixels);
    }

    protected inBounds(pointer: number) {
        return pointer > 0 && pointer <= this.length;
    }

    protected canMoveBy(move: number) {
        return this.inBounds(this.pointer + move);
    }

    finish() {
        this.pointer = this.length;
    }

    done() {
        return this.pointer >= this.length;
    }

    seek(position: number): boolean {
        const inBounds = this.inBounds(position)
        if (inBounds) {
            this.nextPixel = position;
            this.pointer = position;
        }
        return inBounds;
    }

    get offset() {
        const offset = this.pointer - this.nextPixel;
        if (offset < 0) {
            console.log(this.nextPixel, this.pointer);
            throw new Error("Offset can't be negative");
        }
        return offset;
    }

    toImage() {
        return Array.from(this.pixels);
    }
}

export class PixelPlacer extends PixelBuffer {
    skip(pixels: number): boolean {
        if (!this.canMoveBy(pixels)) return false;
        this.pointer += pixels;
        return true;
    }

    placeOne(pixel: RGB): boolean {
        if (!this.canMoveBy(1)) return false;
        this._place(pixel);
        return true;
    }

    place(pixels: RGB[]): boolean {
        if (!this.canMoveBy(pixels.length)) return false;
        pixels.forEach((pixel) => this._place(pixel));
        return true;
    }
}

export class PixelReader extends PixelBuffer {
    static fromImage(imageData: RGB[]): PixelReader {
        const buffer = new PixelReader(imageData.length);
        buffer.pixels = Array.from(imageData);
        return buffer;
    }

    protected lastPreviewed: RGB[] | null = null;

    /**
     * Previews a number of pixels; to close the preview,
one of `.backtrack()`, `.consume()`, or `.skip()` must be called.
     */
    preview(pixels: number): RGB[] | null {
        if (this.lastPreviewed !== null)
            throw new Error("Last preview wasn't closed")
        if (!this.canMoveBy(pixels)) return null;
        const data = this._peek(pixels);
        this.lastPreviewed = data;
        return Array.from(data);
    }

    peekOne(): RGB | null {
        return this.preview(1)?.[0] ?? null;
    }

    /**
     * Signals that the preview wasn't used;
the next preview will contain data at the same position.
     */
    backtrack(): void {
        this.assertLastPreview();
        this.lastPreviewed = null;
    }

    /**
     * Signals that the preview wasn't used, but instead discarded;
data after the last preview will be read next, but the offset will increase.
     */
    skip(): void {
        this.assertLastPreview();
        this.pointer += this.lastPreviewed!.length;
        this.lastPreviewed = null;
    }

    /**
     * Signals that the preview was used;
data following it will be read next.
     */
    consume(): void {
        this.assertLastPreview();
        this.pointer += this.lastPreviewed!.length;
        this.nextPixel = this.pointer;
        this.lastPreviewed = null;
    }

    /**
     * Skips the previerw if condition is true, otherwise backtracks.
     * @see `.skip()`
     * @see `.backtrack()`
     */
    skipIf(condition: boolean): void {
        if (condition) this.skip();
        else this.backtrack();
    }

    /**
     * Consumes the preview if condition is true, otherwise backtracks.
     * @see `.consume()`
     * @see `.backtrack()`
     */
    consumeIf(condition: boolean): void {
        if (condition) this.consume()
        else this.backtrack();
    }

    lastPreview(): RGB[] {
        this.assertLastPreview();
        return Array.from(this.lastPreviewed!);
    }

    findNext(predicate: (colour: RGB) => boolean): number | null {
        for (let i = this.pointer; i < this.length; i += 1)
            if (predicate(this.pixels[i]))
                return i - this.pointer;
        return null;
    }

    protected assertLastPreview() {
        if (!this.lastPreviewed) throw new Error("No last preview to reference");
    }
}