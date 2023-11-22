import { keyToBytes } from '../util/index.js'
import { hash } from '../index.js'

import { expect } from 'aegir/chai'

describe('crypto', () => {
  describe('hash', () => {
    const payload = 'one if by day, two if by night'

    it('has the correct length', () => {
      const h = hash(payload, 'TEST_HASH_PURPOSE')
      expect(keyToBytes(h).length).to.equal(32)
    })

    it('results are deterministic', () => {
      const h = hash(payload, 'TEST_HASH_PURPOSE')
      expect(h).to.equal("14rA39xtqMBQjd3oGekYjaiqK8qsdfQqSF69zdThvVz4")
    })

    it('gives different results with different seeds', () => {
      const hash1 = hash(payload, 'SOMETHING')
      const hash2 = hash(payload, 'SOMETHING_ELSE')
      expect(hash2).not.to.equal(hash1)
    })
  })
})
