import sodium from 'libsodium-wrappers'
import msgpack from 'msgpack-lite'
import { DecryptParams, Encoder, EncryptParams, Key, Payload, SignedMessage } from './types'
import { base58, keypairToBase58, keyToBytes, payloadToBytes, utf8 } from './util'

await sodium.ready

/** Returns an object containing wrappers of some libsodium crypto functions, accepting and returning base58 strings rather than byte arrays. */

export const asymmetric = {
  /**
   * @returns A key pair consisting of a public key and a secret key, encoded as base58 strings, to
   * use for asymmetric encryption and decryption. (Note that asymmetric encryption keys cannot be
   * used for signatures, and vice versa.)
   */
  keyPair: (
    /** (optional) If provided, the the key pair will be derived from the secret key. */
    seed?: Key
  ) => {
    const keypair = seed
      ? sodium.crypto_box_seed_keypair(stretch(seed))
      : sodium.crypto_box_keypair()
    return keypairToBase58(keypair)
  },

  /**
   * Asymmetrically encrypts a string of text.
   * @returns The encrypted data, encoded in msgpack format as a base58 string
   * @see asymmetric.decrypt
   */
  encrypt: ({ secret, recipientPublicKey, senderSecretKey }: EncryptParams): string => {
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
    const messageBytes = payloadToBytes(secret)

    let senderPublicKey: string | undefined
    if (senderSecretKey === undefined) {
      // use ephemeral sender keys
      const senderKeys = asymmetric.keyPair()
      senderSecretKey = senderKeys.secretKey
      senderPublicKey = senderKeys.publicKey
    } else {
      // use provided sender keys; no public key included in metadata
      senderPublicKey = undefined
    }

    // encrypt message
    const message = sodium.crypto_box_easy(
      messageBytes,
      nonce,
      keyToBytes(recipientPublicKey),
      keyToBytes(senderSecretKey)
    )
    const cipherBytes = msgpack.encode({ nonce, message, senderPublicKey })
    return base58.encode(cipherBytes)
  },

  /**
   * Asymmetrically decrypts a message encrypted by `asymmetric.encrypt`.
   * @returns The original plaintext
   * @see asymmetric.encrypt
   */
  decrypt: ({ cipher, recipientSecretKey, senderPublicKey }: DecryptParams): string => {
    const cipherBytes = keyToBytes(cipher)
    const unpackedCipher = msgpack.decode(cipherBytes)
    const { nonce, message } = unpackedCipher

    // if sender public key is not included, assume an ephemeral public key is included in metadata
    senderPublicKey = senderPublicKey ?? unpackedCipher.senderPublicKey

    const decrypted = sodium.crypto_box_open_easy(
      message,
      nonce,
      keyToBytes(senderPublicKey!),
      keyToBytes(recipientSecretKey)
    )
    return utf8.decode(decrypted)
  },
}

export const symmetric = {
  /**
   * Symmetrically encrypts a string of text (or utf8-encoded byte array).
   * @param payload The plaintext (or utf8-encoded byte array) to encrypt
   * @param password An encryption key (32 bytes long or more), or a password to be expanded into a 32-byte key
   * @returns The encrypted data, in msgpack format
   * @see symmetric.decrypt
   */
  encrypt: (payload: Payload, password: Key): string => {
    const key = stretch(password)
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
    const messageBytes = payloadToBytes(payload)
    const encrypted = sodium.crypto_secretbox_easy(messageBytes, nonce, key)

    const cipherBytes = msgpack.encode({ nonce, message: encrypted })

    return base58.encode(cipherBytes)
  },

  /**
   * Symmetrically decrypts a message encrypted by `symmetric.encrypt`.
   * @param cipher The encrypted data in msgpack format
   * @param password The password or key used to encrypt
   * @returns The original plaintext
   * @see symmetric.encrypt
   */
  decrypt: (cipher: string, password: Key): string => {
    const key = stretch(password)
    const cipherBytes = keyToBytes(cipher)

    const { nonce, message } = msgpack.decode(cipherBytes)

    const decrypted = sodium.crypto_secretbox_open_easy(message, nonce, key)
    return utf8.decode(decrypted)
  },
}

export const signatures = {
  /**
   * @returns A key pair consisting of a public key and a secret key, encoded as base58 strings, to
   * use for signing and verifying messages. (Note that signature keys cannot be used for asymmetric
   * encryption, and vice versa.)
   */
  keyPair: (
    /** (optional) If provided, the the key pair will be deterministically derived from the
     * seed; otherwise, a random seed will be used. */
    seed?: Key
  ) => {
    const keypair = seed
      ? sodium.crypto_sign_seed_keypair(stretch(seed))
      : sodium.crypto_sign_keypair()
    return keypairToBase58(keypair)
  },

  /**
   * @returns A signature, encoded as a base58 string
   */
  sign: (
    /** The plaintext data or message to sign */
    payload: Payload,
    /** The signer's secret key, encoded as a base58 string */
    secretKey: Key
  ): string =>
    base58.encode(
      sodium.crypto_sign_detached(
        payloadToBytes(payload), //
        keyToBytes(secretKey)
      )
    ),

  /**
   * @returns true if verification succeeds, false otherwise
   */
  verify: ({ payload, signature, publicKey }: SignedMessage): boolean =>
    sodium.crypto_sign_verify_detached(
      keyToBytes(signature),
      payloadToBytes(payload),
      keyToBytes(publicKey)
    ),
}

/** Derives a key from a low-entropy input, such as a password. Current version of libsodium
 * uses the Argon2id algorithm, although that may change in later versions. */
export const stretch = (password: Key) => {
  const passwordBytes =
    typeof password === 'string'
      ? keyToBytes(password, base58.detect(password) ? 'base58' : 'utf8')
      : password
  const salt = base58.decode('H5B4DLSXw5xwNYFdz1Wr6e')
  if (passwordBytes.length >= 16) return sodium.crypto_generichash(32, passwordBytes, salt) // it's long enough -- just hash to expand it to 32 bytes
  return sodium.crypto_pwhash(
    32,
    passwordBytes,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  )
}

/** Computes a fixed-length fingerprint for an arbitrary long message. */
export const hash = (
  /** A seed used to distinguish different hashes derived from a given payload.*/
  seed: Key,
  /** The data to hash. */
  payload: Payload
) => {
  const hash = sodium.crypto_generichash(32, payloadToBytes(payload), keyToBytes(seed, 'utf8'))
  return base58.encode(hash)
}

/** Returns an unpredictable key with the given length (32 bytes by default).*/
export const randomKey = (length: number = 32, encoder: Encoder = base58.encode) =>
  encoder(sodium.randombytes_buf(length))

export * from './types'
export * from './util'
