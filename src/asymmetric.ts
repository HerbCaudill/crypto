﻿import * as base64 from '@stablelib/base64'
import { decode as utf8Decode } from '@stablelib/utf8'
import msgpack from 'msgpack-lite'
import nacl from 'tweetnacl'
import { newNonce } from '/nonce'
import { Key, keypairToBase64, keyToBytes, Payload, payloadToBytes } from '/util'

/**
 * @param secretKey (optional) If provided, the the key pair will be derived from the secret key.
 * @returns A key pair consisting of a public key and a secret key, encoded as base64 strings, to
 * use for asymmetric encryption and decryption. (Note that asymmetric encryption keys cannot be
 * used for signatures, and vice versa.)
 */
function keyPair(secretKey?: Key) {
  const keyPair = secretKey
    ? nacl.box.keyPair.fromSecretKey(keyToBytes(secretKey))
    : nacl.box.keyPair()
  return keypairToBase64(keyPair)
}

/**
 * Asymmetrically encrypts a string of text.
 * @param secret The plaintext to encrypt
 * @param recipientPublicKey The public key of the intended recipient
 * @param senderSecretKey The secret key of the sender (optional). If not provided, an ephemeral
 * keypair will be generated, and the public key included as metadata.
 * @returns The encrypted data, encoded in msgpack format as a base64 string
 * @see asymmetric.decrypt
 */
function encrypt({ secret, recipientPublicKey, senderSecretKey }: EncryptParams): string {
  const nonce = newNonce()
  const messageBytes = payloadToBytes(secret)
  let senderPublicKey: string | undefined
  if (senderSecretKey === undefined) {
    // use ephemeral sender keys
    const senderKeys = keyPair()
    senderSecretKey = senderKeys.secretKey
    senderPublicKey = senderKeys.publicKey
  } else {
    // use provided sender keys; no public key included in metadata
    senderPublicKey = undefined
  }

  // encrypt message
  const message = nacl.box(
    messageBytes,
    nonce,
    keyToBytes(recipientPublicKey),
    keyToBytes(senderSecretKey!)
  )
  const cipherBytes = msgpack.encode({ nonce, message, senderPublicKey })
  return base64.encode(cipherBytes)
}

/**
 * Asymmetrically decrypts a message encrypted by `asymmetric.encrypt`.
 * @param cipher The encrypted data, encoded in msgpack format as a base64 string
 * @param senderPublicKey The public key of the sender (optional). If not provided, an ephemeral
 * public key is assumed to be included in the cipher metadata.
 * @param recipientSecretKey The secret key of the recipient
 * @returns The original plaintext
 * @see asymmetric.encrypt
 */
function decrypt({ cipher, senderPublicKey, recipientSecretKey }: DecryptParams) {
  const cipherBytes = keyToBytes(cipher)
  const unpackedCipher = msgpack.decode(cipherBytes)
  const { nonce, message } = unpackedCipher

  // if sender public key is not included, assume an ephemeral public key is included in metadata
  senderPublicKey = senderPublicKey ?? unpackedCipher.senderPublicKey

  const decrypted = nacl.box.open(
    message,
    nonce,
    keyToBytes(senderPublicKey!),
    keyToBytes(recipientSecretKey)
  )
  if (!decrypted) throw new Error('Could not decrypt message')
  return utf8Decode(decrypted)
}

// types

interface EncryptParams {
  secret: Payload
  recipientPublicKey: Key
  senderSecretKey?: Key
}

interface DecryptParams {
  cipher: Key
  senderPublicKey?: Key
  recipientSecretKey: Key
}

export const asymmetric = { keyPair, encrypt, decrypt }
