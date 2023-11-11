class CRC32 {
  private static readonly TABLE: number[] = CRC32.makeCrcTable();

  private static makeCrcTable(): number[] {
    let c: number;
    const table: number[] = new Array(256);

    for (let n = 0; n < 256; n += 1) {
      c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }

    return table;
  }

  static calculate(input: string | Buffer): number {
    let crc = 0 ^ -1;

    for (let i = 0; i < input.length; i += 1) {
      crc =
        (crc >>> 8) ^
        this.TABLE[
          (crc ^ (input instanceof Buffer ? input[i] : input.charCodeAt(i))) &
            0xff
        ];
    }

    return (crc ^ -1) >>> 0; // Convert to unsigned
  }
}

export default CRC32;
