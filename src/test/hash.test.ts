import { initCrypto } from '..'
import { keyToBytes } from '../util'

describe('crypto', () => {
  describe('hash', () => {
    const payload = 'one if by day, two if by night'

    it('has the correct length', async () => {
      const crypto = await initCrypto()
      const hash = crypto.hash(payload, 'TEST_HASH_PURPOSE')
      expect(keyToBytes(hash).length).toBe(32)
    })

    it('results are deterministic', async () => {
      const crypto = await initCrypto()
      const hash = crypto.hash(payload, 'TEST_HASH_PURPOSE')
      expect(hash).toMatchInlineSnapshot(`"CkG7uYzjkuKco3BW8tbAK9RwynWvsNYNDstmLj2Ark3T"`)
    })

    it('gives different results with different seeds', async () => {
      const crypto = await initCrypto()
      const hash1 = crypto.hash(payload, 'SOMETHING')
      const hash2 = crypto.hash(payload, 'SOMETHING_ELSE')
      expect(hash2).not.toEqual(hash1)
    })
  })
})
