import sodium from 'libsodium-wrappers-sumo'
import msgpack from 'msgpack-lite'
import { Base58, Payload } from './types'
import { base58, keyToBytes } from './util'
import { stretch } from './stretch'

export const symmetric = {
  /**
   * Symmetrically encrypts a string of text, a byte array, or an object.
   * @param payload The plaintext to encrypt
   * @param password An encryption key (32 bytes long or more), or a password to be expanded into a 32-byte key
   * @returns The encrypted data, in msgpack format
   * @see symmetric.decrypt
   */
  encrypt: (payload: Payload, password: Base58): Base58 => {
    const key = stretch(password)
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
    const messageBytes = msgpack.encode(payload)
    const encrypted = sodium.crypto_secretbox_easy(messageBytes, nonce, key)

    const cipherBytes = msgpack.encode({ nonce, message: encrypted })

    return base58.encode(cipherBytes)
  },

  /**
   * Symmetrically decrypts a message encrypted by `symmetric.encrypt`.
   * @param cipher The encrypted data in msgpack format
   * @param password The password or key used to encrypt
   * @returns The original plaintext, byte array, or object
   * @see symmetric.encrypt
   */
  decrypt: (cipher: Base58, password: string): Payload => {
    const key = stretch(password)
    const cipherBytes = keyToBytes(cipher)

    const { nonce, message } = msgpack.decode(cipherBytes)

    const decrypted = sodium.crypto_secretbox_open_easy(message, nonce, key)
    return msgpack.decode(decrypted)
  },
}
