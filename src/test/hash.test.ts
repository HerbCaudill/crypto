import { keyToBytes } from '../util'
import { hash } from '../index'

describe('crypto', () => {
  describe('hash', () => {
    const payload = 'one if by day, two if by night'

    it('has the correct length', () => {
      const h = hash(payload, 'TEST_HASH_PURPOSE')
      expect(keyToBytes(h).length).toBe(32)
    })

    it('results are deterministic', () => {
      const h = hash(payload, 'TEST_HASH_PURPOSE')
      expect(h).toMatchInlineSnapshot(`"CkG7uYzjkuKco3BW8tbAK9RwynWvsNYNDstmLj2Ark3T"`)
    })

    it('gives different results with different seeds', () => {
      const hash1 = hash(payload, 'SOMETHING')
      const hash2 = hash(payload, 'SOMETHING_ELSE')
      expect(hash2).not.toEqual(hash1)
    })
  })
})
