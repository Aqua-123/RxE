export function unpack(): never {
  throw new Error("Format0 support removed");
}

export async function compress(): Promise<never> {
  throw new Error("Format0 support removed");
}

export function parse(fluff: string) {
  return fluff;
}
