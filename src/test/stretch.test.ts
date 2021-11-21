import { stretch } from '..'
import { base58, keyToBytes } from '../util'

describe('stretch', () => {
  test('returns a 32-byte key', () => {
    const password = 'hello123'
    const key = stretch(password)

    expect(key).toHaveLength(32)

    // results are deterministic
    expect(base58.encode(key)).toMatchInlineSnapshot(
      `"B4WBEeoH1NQGiNjKLQ4vi9wtbBskG7sTpL4Tpy8EksCU"`
    )
  })

  test('takes a byte array as as password', () => {
    const password = keyToBytes('5VbnBW')
    const key = stretch(password)

    // results are deterministic
    expect(base58.encode(key)).toMatchInlineSnapshot(
      `"A5wkCHbfhAdihYHspkD9XfPaQwnEsadD5FbQYWW4GCan"`
    )
  })
})
