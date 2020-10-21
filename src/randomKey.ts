import nacl from 'tweetnacl'
import { base64 } from './util'

type Encoder = (b: Uint8Array) => string

export const randomKey = (length: number = 32, encoder: Encoder = base64.encode) =>
  encoder(nacl.randomBytes(length))
