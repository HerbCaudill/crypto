import { stretch } from '../index.js'
import { base58, keyToBytes } from '../util/index.js'

import { expect } from 'aegir/chai'

describe('stretch', () => {
  it('returns a 32-byte key', () => {
    const password = 'hello123'
    const key = stretch(password)

    expect(key).to.have.lengthOf(32)

    // results are deterministic
    expect(base58.encode(key)).to.equal(
      "B4WBEeoH1NQGiNjKLQ4vi9wtbBskG7sTpL4Tpy8EksCU"
    )
  })
})
