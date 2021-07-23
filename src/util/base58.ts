import basex from 'base-x'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const _base58 = basex(BASE58)

export const base58 = {
  ..._base58,
  decode: (s: string) => {
    const b = _base58.decode(s)
    return bufferToArray(b)
  },
}

// https://stackoverflow.com/a/31394257/239663
function bufferToArray(b: Buffer) {
  return new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT)
}
