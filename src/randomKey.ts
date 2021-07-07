import nacl from 'tweetnacl'
import { base58 } from './util'

type Encoder = (b: Uint8Array) => string

export const randomKey = (length: number = 32, encoder: Encoder = base58.encode) =>
  encoder(nacl.randomBytes(length))
