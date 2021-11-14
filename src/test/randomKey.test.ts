import { initCrypto } from '..'
import { keyToBytes } from '../util'

describe('randomKey', () => {
  it('should return keys of the expected length', async () => {
    const crypto = await initCrypto()
    expect(keyToBytes(crypto.randomKey())).toHaveLength(32)
    expect(keyToBytes(crypto.randomKey(16))).toHaveLength(16)
  })
})
