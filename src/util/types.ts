export type Utf8 = string
export type Base58 = string
export type Key = Base58 | Uint8Array
export type Payload = Base58 | Uint8Array | object

export type ByteKeypair = {
  publicKey: Uint8Array
  secretKey: Uint8Array
}

export type Base58Keypair = {
  publicKey: Base58
  secretKey: Base58
}

export type Encrypted<T> = string
export type Serialized<T> = string
