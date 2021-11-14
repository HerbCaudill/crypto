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

export type SignedMessage = {
  /** The plaintext message to be verified */
  payload: Payload
  /** The signature for the message, encoded as a base58 string */
  signature: Key
  /** The signer's public key, encoded as a base58 string */
  publicKey: Key
}

export interface EncryptParams {
  /** The plaintext to encrypt */
  secret: Payload
  /** The public key of the intended recipient */
  recipientPublicKey: Key
  /** The secret key of the sender (optional). If not provided, an ephemeral keypair will be generated, and the public key included as metadata. */
  senderSecretKey?: Key
}

export interface DecryptParams {
  /** The encrypted data, encoded in msgpack format as a base58 string */
  cipher: Key
  /** The public key of the sender (optional). If not provided, an ephemeral public key is assumed to be included in the cipher metadata. */
  senderPublicKey?: Key
  /** The secret key of the recipient */
  recipientSecretKey: Key
}

export type Encoder = (b: Uint8Array) => string
