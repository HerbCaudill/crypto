import * as utf8 from '@stablelib/utf8'
import { base58 } from './base58'
import { Key } from '../types'

export const keyToBytes = (x: Key, encoding: Encoding = 'base58'): Uint8Array => {
  const decode = encoding === 'base58' ? base58.decode : utf8.encode
  return typeof x === 'string' ? decode(x) : x
}

type Encoding = 'base58' | 'utf8'
