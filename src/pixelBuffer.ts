/* eslint-disable max-classes-per-file */

import { representColour } from "~src/utils";
import { log } from "~userscripter";

class PixelBuffer {
  protected _pointer: number = 0;

  protected _nextPixel: number = 0;

  /**
   * Last pixel consumed or placed, plus one.
   */
  get nextPixel() {
    return this._nextPixel;
  }

  protected set nextPixel(nextPixel) {
    if (nextPixel < 0) throw new Error("nextPixel can't be negative");
    if (nextPixel > this.pointer)
      throw new RangeError("nextPixel can't be greater than pointer");
    if (nextPixel > this.length)
      throw new RangeError("nextPixel can't be out of bounds");
    this._nextPixel = nextPixel;
  }

  /**
   * Last pixel consumed, placed, or skipped, plus one.
   */
  get pointer() {
    return this._pointer;
  }

  protected set pointer(pointer) {
    if (pointer < 0) throw new RangeError("pointer can't be negative");
    if (pointer > this.length)
      throw new RangeError("pointer can't be out of bounds");
    if (pointer < this.nextPixel)
      throw new RangeError("pointer can't be less than nextPixel");
    this._pointer = pointer;
  }

  protected pixels: RGB[];

  constructor(
    readonly length: number,
    public backgroundColour: RGB = [255, 255, 255]
  ) {
    this.pixels = Array.from<RGB>({ length }).fill(backgroundColour);
  }

  protected _place(pixel: RGB) {
    this.pixels[this.pointer] = Array.from(pixel) as RGB;
    this.pointer += 1;
    this.nextPixel = this.pointer;
  }

  protected _peek(pixels: number): RGB[] {
    return this.pixels.slice(this.pointer, this.pointer + pixels);
  }

  protected inBounds(pointer: number) {
    return pointer >= 0 && pointer <= this.length;
  }

  protected canMoveBy(move: number) {
    return this.inBounds(this.pointer + move);
  }

  remaining() {
    return this.length - this.pointer;
  }

  done() {
    return this.pointer >= this.length;
  }

  finish() {
    this.pointer = this.length;
  }

  seek(amount: number): boolean {
    const nextPosition = this.pointer + amount;
    const inBounds = this.inBounds(nextPosition);
    if (inBounds) {
      this._nextPixel = nextPosition;
      this._pointer = nextPosition;
    }
    return inBounds;
  }

  get offset() {
    const offset = this.pointer - this.nextPixel;
    if (offset < 0) {
      throw new Error("Offset can't be negative");
    }
    return offset;
  }

  get skipped() {
    return this.pixels.slice(this.nextPixel, this.pointer);
  }

  toImage() {
    return Array.from(this.pixels);
  }

  getNext(): RGB | null {
    return this._peek(1)?.[0];
  }

  protected pixelLogAt(pointer: number) {
    return `${this.pixels
      .slice(pointer - 10, pointer)
      .map(representColour)
      .join(" ")} [${pointer}: ${representColour(this.pixels[pointer])}]`;
  }

  debug() {
    console.log("backgroundColour", representColour(this.backgroundColour));
    console.log("nextPixel:", this.pixelLogAt(this.nextPixel));
    console.log("pointer:", this.pixelLogAt(this.pointer));
  }
}

export class PixelPlacer extends PixelBuffer {
  skip(pixels: number): boolean {
    if (!this.canMoveBy(pixels)) return false;
    this.pixels.fill(
      this.backgroundColour,
      this.pointer,
      this.pointer + pixels
    );
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

  finish() {
    this.pixels.fill(this.backgroundColour, this.nextPixel);
    this.pointer = this.length;
    this.nextPixel = this.length;
  }
}

export class PixelReader extends PixelBuffer {
  static fromImage(imageData: RGB[]): PixelReader {
    const buffer = new PixelReader(imageData.length);
    buffer.pixels = Array.from(imageData);
    return buffer;
  }

  protected lastPreviewed: RGB[] | null = null;

  protected lastPreviewTrace: string = "";

  /**
     * Previews a number of pixels starting at the pointer; to close the preview,
one of `.backtrack()`, `.consume()`, or `.skip()` must be called.
     */
  preview(pixels: number): RGB[] | null {
    this.assertNoLastPreview();
    this.lastPreviewTrace = new Error().stack ?? "";
    if (!this.canMoveBy(pixels)) return null;
    const data = this._peek(pixels);
    this.lastPreviewed = data;
    return Array.from(data);
  }

  previewAtMost(pixels: number): RGB[] | null {
    if (this.done()) return null;
    const previewLength = Math.min(pixels, this.remaining());
    return this.preview(previewLength);
  }

  peekOne(savePreview = true): RGB | null {
    const preview = this.preview(1)?.[0] ?? null;
    if (!savePreview) this.backtrack();
    return preview;
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

  skipCount(pixels: number): void {
    if (!this.canMoveBy(pixels))
      throw new Error("Cannot skip by given amount of pixels.");
    this.pointer += pixels;
  }

  /**
   * Consumes the preview if condition is true, otherwise backtracks.
   * @see `.consume()`
   * @see `.backtrack()`
   */
  consumeIf(condition: boolean): void {
    if (condition) this.consume();
    else this.backtrack();
  }

  consumeCount(pixels: number) {
    if (!this.canMoveBy(pixels))
      throw new Error("Cannot consume given amount of pixels.");
    this.pointer += pixels;
    this.nextPixel = this.pointer;
  }

  consumeSkipped(pixels: number) {
    if (this.offset < pixels)
      throw new Error("Cannot consume given amount of skipped pixels.");
    this.nextPixel += pixels;
  }

  lastPreview(): RGB[] {
    this.assertLastPreview();
    return Array.from(this.lastPreviewed!);
  }

  /**
   * @deprecated O(n) time
   */
  findNext(predicate: (colour: RGB) => boolean, max = Infinity): number | null {
    const end = this.pointer + max;
    for (let i = this.pointer; i < this.length && i < end; i += 1)
      if (predicate(this.pixels[i])) return i - this.pointer;
    return null;
  }

  protected assertLastPreview() {
    if (!this.lastPreviewed) throw new Error("No last preview to reference");
  }

  protected assertNoLastPreview() {
    if (this.lastPreviewed === null) return;
    log.error(`Last preview happened here: \n${this.lastPreviewTrace}`);
    throw new Error("Last preview wasn't closed");
  }
}
