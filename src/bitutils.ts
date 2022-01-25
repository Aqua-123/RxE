import { allOf, b64Set, clamp, tagSet } from "./utils";

const { max, ceil, log2 } = Math;

export function bitSplit(
  bits: number,
  splits: number,
  relevantBits = max(0, ceil(log2(bits)))
) {
  if (bits < 0) throw new RangeError("bits can't be negative");
  const splitSize = ~~(relevantBits / splits);
  const baseMask = 2 ** splitSize - 1;
  if (relevantBits % splits !== 0)
    // eslint-disable-next-line no-console
    console.warn(
      `bitsplit: splits (${splits}) does not divide evenly into relevantBits (${relevantBits}).`
    );
  return Array.from({ length: splits }, (_, splitNo) => {
    const shift = splitNo * splitSize;
    const mask = baseMask << shift;
    return (bits & mask) >> shift;
  }).reverse();
}

export function bitJoin(numbers: number[] | Uint8Array, relevantBits: number) {
  return Array.from(numbers)
    .reverse()
    .map((num, index) => num << (index * relevantBits))
    .reduce((a, b) => a + b, 0);
}

export function u8toB64(u8: number) {
  if (u8 < 0 || u8 > 63) throw new RangeError("u8 has to be from 0 to 63");
  return b64Set[u8];
}

export function u8toB64i(u8: number) {
  if (u8 < 0 || u8 > 63) throw new RangeError("u8 has to be from 0 to 63");
  return tagSet[u8];
}

export function numToB64(num: number, digits?: number) {
  if (num < 0) throw new RangeError("num can't be negative; did it overflow?");
  // eslint-disable-next-line no-param-reassign
  if (digits === undefined) digits = ceil(max(0, ceil(log2(num))) / 6);
  if (digits === 0) return u8toB64(0);
  const u8s = bitSplit(num, digits, digits * 6);
  return u8s.map(u8toB64).join("");
}

export class GroupedBits {
  protected _lastBits: number;

  protected _numbers: number[];

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(protected numberBits: number, numbers: number[] = []) {
    this._numbers = Array.from(numbers);
    this._lastBits = numberBits;
  }

  get length() {
    return this._numbers.length;
  }

  protected get lastBits() {
    return this._lastBits;
  }

  protected set lastBits(bits) {
    if (bits > 0 && bits <= this.numberBits) this._lastBits = bits;
    else
      throw new RangeError(
        `lastBits must be between 1 and ${this.numberBits} (was set to ${bits})`
      );
  }

  protected set last(value) {
    this._numbers[this.length - 1] = value;
  }

  protected get last() {
    return this._numbers[this.length - 1];
  }

  push(bit: number): void {
    if (bit > 1) console.warn("GroupedBits.push got bit > 1");
    if (this.lastBits === this.numberBits) {
      this._numbers.push(0);
      this.lastBits = 1;
    } else this.lastBits += 1;
    this.last <<= 1;
    this.last += bit & 1;
  }

  pushNumber(num: number, bits: number): void {
    if (num < 0) throw new RangeError("num can't be negative");
    this.extend(bitSplit(num, bits, bits));
  }

  extend(bits: number[]) {
    bits.forEach((bit) => this.push(bit));
  }

  pushNumbers(nums: number[], bits: number): void {
    nums.forEach((num) => this.pushNumber(num, bits));
  }

  shift(): 0 | 1 | undefined {
    if (this.length === 0) return undefined;
    const maskOverflow = 1 << this.numberBits;
    const maskMax = maskOverflow - 1;
    const maskMaxLast = 1 << (this.lastBits - 1);
    let shiftedValue: 0 | 1 = this.last & maskMaxLast ? 1 : 0;
    this.last -= shiftedValue ? maskMaxLast : 0;
    const beforeLast = this.length - 2;
    if (this.lastBits === 1) {
      this._numbers.pop();
      this.lastBits = this.numberBits;
    } else this.lastBits -= 1;
    for (let i = beforeLast; i >= 0; i -= 1) {
      this._numbers[i] <<= 1;
      this._numbers[i] += shiftedValue;
      shiftedValue = maskOverflow & this._numbers[i] ? 1 : 0;
      this._numbers[i] &= maskMax;
    }
    return shiftedValue;
  }

  get numBits() {
    return (this.length - 1) * this.numberBits + this.lastBits;
  }

  shiftBits(numBits: number): number | undefined {
    const bits: Array<0 | 1> = [];
    if (this.numBits < numBits) return undefined;
    for (let i = 0; i < numBits; i += 1) bits.push(this.shift()!);
    return bitJoin(bits, 1);
  }

  pop(): 0 | 1 | undefined {
    if (this.length === 0) return undefined;
    if (this.lastBits === 1) {
      this.lastBits = this.numberBits;
      return this._numbers.pop() ? 1 : 0;
    }
    this.lastBits -= 1;
    const bit = this.last & 1 ? 1 : 0;
    this.last >>= 1;
    return bit;
  }

  consume(groupedBits: GroupedBits) {
    while (groupedBits.length > 0) {
      this.push(groupedBits.pop()!);
    }
  }

  consumeLeft(groupedBits: GroupedBits) {
    while (groupedBits.length > 0) {
      this.push(groupedBits.shift()!);
    }
  }

  reverse(): GroupedBits {
    const reverse = new GroupedBits(this.numberBits);
    reverse.consume(this);
    return reverse;
  }

  topUp(): GroupedBits {
    this.last <<= this.numberBits - this.lastBits;
    this.lastBits = this.numberBits;
    return this;
  }

  trim(): GroupedBits {
    if (this.lastBits === this.numberBits) return this;
    this._numbers.pop();
    this.lastBits = this.numberBits;
    return this;
  }

  toNumber(): number {
    return (
      (bitJoin(this._numbers.slice(0, -1), this.numberBits) << this.lastBits) +
      this.last
    );
  }

  regroup(groupBits: number): GroupedBits {
    const regroupedBits = new GroupedBits(groupBits);
    regroupedBits.consumeLeft(this);
    return regroupedBits;
  }

  get numbers() {
    return Array.from(this._numbers);
  }

  protected representIndex(i: number) {
    const last = i === this.length - 1;
    return this.numbers[i]
      .toString(2)
      .padStart(last ? this.lastBits : this.numberBits, "0");
  }

  debug(message: string = "") {
    const prefix = message ? `${message} ` : message;
    console.log(
      prefix + this.numbers.map((_, i) => this.representIndex(i)).join(".")
    );
  }
}

export function bitsRegroup(
  numbers: number[],
  oldGroupBits: number,
  newGroupBits: number
): number[] {
  const groupBits = new GroupedBits(oldGroupBits, numbers);
  const regrouped = groupBits.regroup(newGroupBits).topUp().numbers;
  return regrouped;
}

export function b64toU8(b64char: string | undefined | null) {
  if (!b64char) return null;
  const index = tagSet.indexOf(b64char);
  if (index !== -1) return index;
  const index2 = b64Set.indexOf(b64char);
  if (index2 !== -1) return index2;
  return null;
}

export function b64toU8Array(b64: string) {
  const array = allOf(b64.split("").map(b64toU8));
  if (!array) return null;
  return new Uint8Array(array);
}

export function u8ArrayToB64(u8s: number[] | Uint8Array): string {
  return Array.from(u8s).map(u8toB64).join("");
}

export function u8ArrayToB64i(u8s: number[] | Uint8Array): string {
  return Array.from(u8s).map(u8toB64i).join("");
}

export function u8toRGB(u8: number): RGB {
  return bitSplit(u8, 3, 6).map((x) => (x * 255) / 3) as RGB;
}

export function b64toRGB(s: string | null | undefined): RGB | null {
  if (!s) return null;
  if (s.length === 0) throw new Error("");
  const u8 = b64toU8(s);
  if (u8 === null) return null;
  return u8toRGB(u8);
}

export function b64HexColor(s: string | null | undefined): string | undefined {
  const code = b64toRGB(s)
    ?.map((u2) => (u2 * 5).toString(16))
    ?.join("");
  return code && `#${code}`;
}

export function rgbToU8(colour: RGB): number {
  const [r, g, b] = colour.map((component) =>
    clamp(Math.round((component * 3) / 255), 0, 3)
  );
  return (r << 4) + (g << 2) + b;
}

export function rgbToB64(colour: RGB): string {
  return u8toB64(rgbToU8(colour));
}

export function rgbToB64i(colour: RGB): string {
  return u8toB64i(rgbToU8(colour));
}
