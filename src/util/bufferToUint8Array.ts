// https://stackoverflow.com/a/31394257/239663
export const bufferToUint8Array = (b: Buffer): Uint8Array =>
  new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT)
