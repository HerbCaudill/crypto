export type Utf8 = string
export type Base64 = string
export type Key = Base64 | Uint8Array
export type Payload = Base64 | Uint8Array | object

export type ByteKeypair = {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export type Base64Keypair = {
  publicKey: Base64
  secretKey: Base64
}

export type Encrypted<T> = string
export type Serialized<T> = string
