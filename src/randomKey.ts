import sodium from 'libsodium-wrappers'
import { Encoder } from './types'
import { base58 } from './util'

/** Returns an unpredictable key with the given length (32 bytes by default).*/

export const randomKey = (length: number = 32, encoder: Encoder = base58.encode) =>
  encoder(sodium.randombytes_buf(length))
