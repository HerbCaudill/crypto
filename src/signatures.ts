import { base58 } from '/util'
import nacl from 'tweetnacl'
import { Key, Payload } from '/util'
import { keypairToBase58 } from '/util/keypairToBase58'
import { keyToBytes } from '/util/keyToBytes'
import { payloadToBytes } from '/util/payloadToBytes'

export const signatures = {
  /**
   * @param seed (optional) If provided, the the key pair will be derived from the seed.
   * @returns A key pair consisting of a public key and a secret key, encoded as base58 strings, to
   * use for signing and verifying messages. (Note that signature keys cannot be used for asymmetric
   * encryption, and vice versa.)
   */
  keyPair: (seed?: Key) => {
    const keyPair = seed //
      ? nacl.sign.keyPair.fromSeed(keyToBytes(seed))
      : nacl.sign.keyPair()
    return keypairToBase58(keyPair)
  },

  /**
   * @param message The plaintext message to sign
   * @param secretKey The signer's secret key, encoded as a base58 string
   * @returns A signature, encoded as a base58 string
   */
  sign: (payload: Payload, secretKey: Key) => {
    return base58.encode(
      nacl.sign.detached(
        payloadToBytes(payload), //
        keyToBytes(secretKey)
      )
    )
  },

  /**
   * @param content The plaintext message to be verified
   * @param signature The signature provided along with the message, encoded as a base58 string
   * @param publicKey The signer's public key, encoded as a base58 string
   * @returns true if verification succeeds, false otherwise
   */
  verify: ({ payload, signature, publicKey }: SignedMessage) => {
    return nacl.sign.detached.verify(
      payloadToBytes(payload),
      keyToBytes(signature),
      keyToBytes(publicKey)
    )
  },
}

export type SignedMessage = {
  payload: Payload
  signature: Key
  publicKey: Key
}
