import { signatures, asymmetric } from '../index.js'

import {expect} from 'aegir/chai'

const { keyPair, encrypt, decrypt } = asymmetric

const plaintext = 'The leopard pounces at noon'
const zalgoText = 'ẓ̴̇a̷̰̚l̶̥͑g̶̼͂o̴̅͜ ̸̻̏í̴͜s̵̜͠ ̴̦̃u̸̼̎p̵̘̔o̵̦͑ǹ̵̰ ̶̢͘u̵̇ͅș̷̏'
const poop = '💩'

describe('crypto', () => {
  describe('asymmetric encrypt/decrypt', () => {
    const tests: {
      label: string, message: string
    }[] = [
      { label: 'plain text', message: plaintext },
      { label: 'empty string', message: '' },
      { label: 'emoji message', message: poop },
      { label: 'zalgo text', message: zalgoText },
    ]

    tests.forEach(({ label, message }) => {
      it(`round trip: ${label}`, () => {
        const alice = keyPair()
        const bob = keyPair()
        const eve = keyPair()

        const encrypted = encrypt({
          secret: message,
          recipientPublicKey: bob.publicKey,
          senderSecretKey: alice.secretKey,
        })
        const decrypted = decrypt({
          cipher: encrypted,
          senderPublicKey: alice.publicKey,
          recipientSecretKey: bob.secretKey,
        })
        expect(decrypted).to.equal(message)

        const attemptToDecrypt = () =>
          decrypt({
            cipher: encrypted,
            senderPublicKey: alice.publicKey,
            recipientSecretKey: eve.secretKey,
          })
        expect(attemptToDecrypt).throw()
      })
    })

    it('fwiw: cannot use signature keys to encrypt', () => {
      const a = signatures.keyPair()
      const b = signatures.keyPair()
      expect(() =>
        asymmetric.encrypt({
          secret: plaintext,
          recipientPublicKey: b.publicKey,
          senderSecretKey: a.secretKey,
        })
      ).throw()
    })
  })

  describe('asymmetric encrypt/decrypt with ephemeral key', () => {
    const tests: {
      label: string, message: string
    }[] = [
      { label: 'plain text', message: plaintext },
      { label: 'empty string', message: '' },
      { label: 'emoji message', message: poop },
      { label: 'zalgo text', message: zalgoText },
    ]

    tests.forEach(({ label, message }) => {
      it(`round trip: ${label}`, () => {
        const bob = keyPair()
        const eve = keyPair()

        const encrypted = encrypt({
          secret: message,
          recipientPublicKey: bob.publicKey,
        })
        const decrypted = decrypt({
          cipher: encrypted,
          recipientSecretKey: bob.secretKey,
        })
        expect(decrypted).to.equal(message)

        const attemptToDecrypt = () =>
          decrypt({
            cipher: encrypted,
            recipientSecretKey: eve.secretKey,
          })
        expect(attemptToDecrypt).throw()
      })
    })
  })

  describe('keyPair', () => {
    it('is deterministic if secretKey is provided', () => {
      const secretKey = 'C3U7T1J7M9gvhFHkDXeWHuAko8bdHd9w1CJKsLEUCVqp'
      const keys = keyPair(secretKey)
      expect(keys.publicKey).to.equal("5gTFPqj34hU2g57uXRWvANQTKRdhuHhREzQqxpwjVLaz")
    })
  })
})
