import { randomKey } from '../index.js'
import { keyToBytes } from '../util/index.js'

import { expect } from 'aegir/chai'

describe('randomKey', () => {
  it('should return keys of the expected length', () => {
    expect(keyToBytes(randomKey())).to.have.lengthOf(32)
    expect(keyToBytes(randomKey(16))).to.have.lengthOf(16)
  })
})
