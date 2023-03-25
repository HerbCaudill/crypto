import sodium from 'libsodium-wrappers'
import msgpack from 'msgpack-lite'
import { Base58, Payload, SignedMessage } from './types'
import { base58, keypairToBase58, keyToBytes } from './util'
import { stretch } from './stretch'

export const signatures = {
  /**
   * @returns A key pair consisting of a public key and a secret key, encoded as base58 strings, to
   * use for signing and verifying messages. (Note that signature keys cannot be used for asymmetric
   * encryption, and vice versa.)
   */
  keyPair: (
    /** (optional) If provided, the the key pair will be deterministically derived from the
     * seed; otherwise, a random seed will be used. */
    seed?: string
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
    secretKey: Base58
  ) => base58.encode(sodium.crypto_sign_detached(msgpack.encode(payload), keyToBytes(secretKey))),

  /**
   * @returns true if verification succeeds, false otherwise
   */
  verify: ({ payload, signature, publicKey }: SignedMessage): boolean =>
    sodium.crypto_sign_verify_detached(
      keyToBytes(signature),
      msgpack.encode(payload),
      keyToBytes(publicKey)
    ),
}
