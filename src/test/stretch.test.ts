import { initCrypto } from '..'
import { base58, keyToBytes } from '/util'

describe('stretch', () => {
  test('returns a 32-byte key', async () => {
    const crypto = await initCrypto()
    const password = 'hello123'
    const key = crypto.stretch(password)

    expect(key).toHaveLength(32)

    // results are deterministic
    expect(base58.encode(key)).toMatchInlineSnapshot(
      `"8hYkvmB2xxdjzi7ZL7DNKXUFEDHsAHWs66fMXYkpdDWr"`
    )
  })

  test('takes a byte array as as password', async () => {
    const crypto = await initCrypto()
    const password = keyToBytes('5VbnBW')
    const key = crypto.stretch(password)

    // results are deterministic
    expect(base58.encode(key)).toMatchInlineSnapshot(
      `"GwHAQ3X85pUcMb862DEwovntjKXtBWznTJUKqomYK5ei"`
    )
  })
})
