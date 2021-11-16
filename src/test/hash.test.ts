import { keyToBytes } from '../util'
import * as crypto from '..'

describe('crypto', () => {
  describe('hash', () => {
    const payload = 'one if by day, two if by night'

    it('has the correct length', () => {
      const hash = crypto.hash(payload, 'TEST_HASH_PURPOSE')
      expect(keyToBytes(hash).length).toBe(32)
    })

    it('results are deterministic', () => {
      const hash = crypto.hash(payload, 'TEST_HASH_PURPOSE')
      expect(hash).toMatchInlineSnapshot(`"CkG7uYzjkuKco3BW8tbAK9RwynWvsNYNDstmLj2Ark3T"`)
    })

    it('gives different results with different seeds', () => {
      const hash1 = crypto.hash(payload, 'SOMETHING')
      const hash2 = crypto.hash(payload, 'SOMETHING_ELSE')
      expect(hash2).not.toEqual(hash1)
    })
  })
})
