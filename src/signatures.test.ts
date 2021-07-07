import nacl from 'tweetnacl'
import { randomKey } from '.'
import { keypairToBase58 } from './util'
import { asymmetric } from '/asymmetric'
import { signatures, SignedMessage } from '/signatures'

const plaintext = 'The leopard pounces at noon'

describe('crypto', () => {
  describe('signatures', () => {
    const { sign, verify } = signatures

    const alice = {
      publicKey: 'CgSKNnDzHhf26V8KcmQdxquK4fWUNDRy3MA6Sqf5hSma',
      secretKey: 'F8KpL9S5dtUutS1AUNmgPeqxVkMUWLnWdvvoiKzVo3FjvXokxhQuK5ns8ZBzgBKHvdADSDfw88TSoBVvkua7Pj2', // prettier-ignore
    }

    const signedMessage: SignedMessage = {
      payload: 'one if by day, two if by night',
      signature: '5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67', // prettier-ignore
      publicKey: alice.publicKey,
    }

    test('alice signs with her secret key', () => {
      const signature = sign(signedMessage.payload, alice.secretKey)
      expect(signature).toEqual(signedMessage.signature)
    })

    test(`bob verifies using alice's public key`, () => {
      const isLegit = verify(signedMessage)
      expect(isLegit).toBe(true)
    })

    test(`round trip with bytes payload`, () => {
      const payload = nacl.randomBytes(32)
      const { secretKey, publicKey } = alice
      const signature = sign(payload, secretKey)
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`round trip with JSON payload`, () => {
      const payload = {
        type: 0,
        payload: { team: 'Spies Я Us' },
        user: 'alice',
        client: { name: 'test', version: '0' },
        timestamp: 1588335904711,
        index: 0,
        prev: undefined,
      }
      const { secretKey, publicKey } = alice
      const signature = sign(payload, secretKey)
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`JSON normalization`, () => {
      const payload = { a: 1, b: 2, c: 3 }
      const scrambled = { b: 2, a: 1, c: 3 }

      const { secretKey, publicKey } = alice
      const signature = sign(scrambled, secretKey)
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`Eve tampers with the message, but Bob is not fooled`, () => {
      // Eve
      const tamperedContent = (signedMessage.payload as string)
        .replace('one', 'forty-two')
        .replace('two', 'seventy-twelve')
      const tamperedMessage = {
        ...signedMessage,
        payload: tamperedContent,
      }

      // Bob
      const isLegit = verify(tamperedMessage)
      expect(isLegit).toBe(false)
    })

    test(`fails verification if signature is wrong`, () => {
      const badSignature = '5VanBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67' // prettier-ignore
      const badMessage = {
        ...signedMessage,
        signature: badSignature,
      }
      const isLegit = verify(badMessage)
      expect(isLegit).toBe(false)
    })

    test(`fails verification if public key is wrong`, () => {
      const badKey = 'AAAAAnDzHhf26V8KcmQdxquK4fWUNDRy3MA6Sqf5hSma'
      const badMessage = {
        ...signedMessage,
        publicKey: badKey,
      }
      const isLegit = verify(badMessage)
      expect(isLegit).toBe(false)
    })

    test('fwiw: cannot use encryption keys to sign', () => {
      const a = asymmetric.keyPair()
      expect(() => sign(plaintext, a.secretKey)).toThrow()
    })

    test('keypair generated from seed is deterministic', () => {
      const seed = 'CgSKNnDzHhf26V8KcmQdxquK4fWUNDRy3MA6Sqf5hSma'
      const keys = signatures.keyPair(seed)
      expect(keys).toMatchInlineSnapshot(`
        Object {
          "publicKey": "4fzpin2ZYHRujbbub1ibVxny29EQS2G26nWBkSsDAcRU",
          "secretKey": "4UExdSFxP5AWWqnFbqQTDvwA5s1nnpFCPsWDeyAXYMCAnmP3SaFYxHvbaHn2QMpvKYwrZ4vzhg5Dv9qr2tD2Jmga",
        }
      `)
    })
  })
})
