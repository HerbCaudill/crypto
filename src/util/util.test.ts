import { Base58 } from '../types'
import { base58 } from './base58.js'
import { keyToBytes } from './keyToBytes.js'

import { expect } from 'aegir/chai'

describe('base58', () => {
  describe('detect', () => {
    it('recognizes a base58 string', () => {
      expect(base58.detect('5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3z1eKYnnG3KSHtCD67')).to.be.true()
    })

    it('doesnt recognize a non-base58 string', () => {
      expect(base58.detect('1 can be confused with I and l')).to.be.false()
    })
  })
})

describe('keyToBytes', () => {
  it('converts a base58 string to bytes', () => {
    const key = '5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67' as Base58
    const bytes = keyToBytes(key)

    expect(bytes instanceof Uint8Array).to.be.true()
    expect(bytes).to.have.lengthOf(64)
  })

  it('converts a utf8 string to bytes', () => {
    const key = 'abcdef'
    const bytes = keyToBytes(key, 'utf8')

    expect(bytes instanceof Uint8Array).to.be.true()
    expect(bytes).to.have.lengthOf(6)
  })
})
