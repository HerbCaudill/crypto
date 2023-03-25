import sodium from 'libsodium-wrappers'
import msgpack from 'msgpack-lite'
import { Payload } from './types'
import { base58, keyToBytes } from './util'

/** Computes a fixed-length fingerprint for an arbitrary long message. */

export const hash = (
  /** A seed used to distinguish different hashes derived from a given payload.*/
  seed: string,
  /** The data to hash. */
  payload: Payload
) => {
  const hash = sodium.crypto_generichash(32, msgpack.encode(payload), keyToBytes(seed, 'utf8'))
  return base58.encode(hash)
}