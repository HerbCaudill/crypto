import sodium from 'libsodium-wrappers'
import { base58 } from './base58'

export const keypairToBase58 = (keypair: sodium.KeyPair) => ({
  publicKey: base58.encode(keypair.publicKey),
  secretKey: base58.encode(keypair.privateKey),
})
