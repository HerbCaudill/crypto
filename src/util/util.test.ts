import { utf8 } from './utf8'
import { keyToBytes } from './keyToBytes'
import { payloadToBytes } from './payloadToBytes'
import { base58 } from './base58'

describe('keyToBytes', () => {
  it('converts a base58 string to bytes', () => {
    const key =
      '5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67'
    const bytes = keyToBytes(key)

    expect(bytes instanceof Uint8Array).toBe(true)
    expect(bytes).toHaveLength(64)
  })

  it('converts a utf8 string to bytes', () => {
    const key = 'abcdef'
    const bytes = keyToBytes(key, 'utf8')

    expect(bytes instanceof Uint8Array).toBe(true)
    expect(bytes).toHaveLength(6)
  })

  it('passes through a byte array unchanged', () => {
    const key =
      '5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67'
    const bytes = keyToBytes(key)

    expect(bytes instanceof Uint8Array).toBe(true)
    expect(keyToBytes(bytes)).toEqual(bytes)
  })
})

describe('payloadToBytes', () => {
  it('converts a string to a byte array', () => {
    const input = 'abcdef'
    const result = payloadToBytes(input)

    expect(result instanceof Uint8Array).toBe(true)
    expect(result).toHaveLength(6)
  })

  it('passes back a byte array unchanged', () => {
    const input = utf8.encode('abcdef')
    const result = payloadToBytes(input)
    expect(input).toEqual(result)
  })

  it('converts a javascript object to a byte array', () => {
    const input = { a: 1, b: 'foo', c: undefined }
    const result = payloadToBytes(input)
    expect(result instanceof Uint8Array).toBe(true)
    expect(base58.encode(result)).toMatchInlineSnapshot(`"2A7X2snkdg1Vfu3GXfG8XPQp"`)
    expect(JSON.parse(utf8.decode(result))).toEqual(input)
  })
})
