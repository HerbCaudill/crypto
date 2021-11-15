import { initCrypto } from '..'
import { SignedMessage } from '/types'

describe('crypto', () => {
  const setup = async () => {
    const crypto = await initCrypto()
    const { randomKey } = crypto
    const { keyPair, sign, verify } = crypto.signatures
    const alice = keyPair('alice')
    return { alice, keyPair, sign, verify, randomKey }
  }

  describe('signatures', () => {
    const payload = 'one if by day, two if by night'

    test('alice signs with her secret key', async () => {
      const { alice, sign } = await setup()
      const signature = sign(payload, alice.secretKey)
      expect(signature).toMatchInlineSnapshot(
        `"3cEJfYLP3eRx4yVjaxuyMy2rxpVvmT5Hh7knm4Vwz53mv1HWcU3o2m4R2Tu7p1XEfJUcske3i5XNXUDgDnDRmGSa"`
      )
    })

    test(`bob verifies using alice's public key`, async () => {
      const { alice, sign, verify } = await setup()
      const signature = sign(payload, alice.secretKey)
      const { publicKey } = alice
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`round trip with bytes payload`, async () => {
      const { alice, sign, verify, randomKey } = await setup()
      const payload = randomKey()
      const { secretKey, publicKey } = alice
      const signature = sign(payload, secretKey)
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`round trip with JSON payload`, async () => {
      const payload = {
        type: 0,
        payload: { team: 'Spies Я Us' },
        user: 'alice',
        client: { name: 'test', version: '0' },
        timestamp: 1588335904711,
        index: 0,
        prev: undefined,
      }
      const { alice, sign, verify } = await setup()
      const { secretKey, publicKey } = alice
      const signature = sign(payload, secretKey)
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`JSON normalization`, async () => {
      const payload = { a: 1, b: 2, c: 3 }
      const scrambled = { b: 2, a: 1, c: 3 }
      const { alice, sign, verify } = await setup()

      const { secretKey, publicKey } = alice
      const signature = sign(scrambled, secretKey)
      const isLegit = verify({ payload, signature, publicKey })
      expect(isLegit).toBe(true)
    })

    test(`Eve tampers with the message, but Bob is not fooled`, async () => {
      // Alice signs a message
      const { alice, sign, verify } = await setup()
      const signedMessage: SignedMessage = {
        payload,
        signature: sign(payload, alice.secretKey),
        publicKey: alice.publicKey,
      }

      // Eve tampers with the contents of the message
      const tamperedContent = payload //
        .replace('one', 'forty-two')
        .replace('two', 'seventy-twelve')
      const tamperedMessage = {
        ...signedMessage,
        payload: tamperedContent,
      }

      // Bob is not fooled
      const isLegit = verify(tamperedMessage)
      expect(isLegit).toBe(false)
    })

    test(`fails verification if signature is wrong`, async () => {
      const { alice, sign, verify } = await setup()
      const signedMessage: SignedMessage = {
        payload,
        signature: sign(payload, alice.secretKey),
        publicKey: alice.publicKey,
      }

      const badSignature = '5VanBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67' // prettier-ignore
      const badMessage = {
        ...signedMessage,
        signature: badSignature,
      }
      const isLegit = verify(badMessage)
      expect(isLegit).toBe(false)
    })

    test(`fails verification if public key is wrong`, async () => {
      const { alice, sign, verify } = await setup()
      const signedMessage: SignedMessage = {
        payload,
        signature: sign(payload, alice.secretKey),
        publicKey: alice.publicKey,
      }
      const badKey = 'AAAAAnDzHhf26V8KcmQdxquK4fWUNDRy3MA6Sqf5hSma'
      const badMessage = {
        ...signedMessage,
        publicKey: badKey,
      }
      const isLegit = verify(badMessage)
      expect(isLegit).toBe(false)
    })

    test('fwiw: cannot use encryption keys to sign', async () => {
      const crypto = await initCrypto()
      const keysForAnotherPurpose = crypto.asymmetric.keyPair()
      const tryToSignWithEncryptionKeys = () =>
        crypto.signatures.sign(payload, keysForAnotherPurpose.secretKey)
      expect(tryToSignWithEncryptionKeys).toThrow()
    })

    test('keypair generated from seed is deterministic', async () => {
      // Alice signs a message
      const { keyPair } = await setup()
      const seed = 'passw0rd'
      const keys = keyPair(seed)
      expect(keys).toMatchInlineSnapshot(`
        Object {
          "publicKey": "BWWvjmQtJKHNMKqENTPDjjHzme33TmyXLxi7hXzMQyDk",
          "secretKey": "34ZMB3SxAtAYabMGG9bfMppTP9FXJxSWb9n8RLRVDHt6hTiaSvXMeB7fNri5ZAh8BKBoGsUNBXwtUgTcZCnqMypv",
        }
      `)
    })
  })
})
