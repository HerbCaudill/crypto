import { base58 } from './base58'
import nacl from 'tweetnacl'

export const keypairToBase58 = (keypair: nacl.BoxKeyPair | nacl.SignKeyPair) => ({
  publicKey: base58.encode(keypair.publicKey),
  secretKey: base58.encode(keypair.secretKey),
})
