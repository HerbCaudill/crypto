import { keyToBytes } from './keyToBytes'

describe('keyToBytes', () => {
  it('converts a base58 string to bytes', () => {
    const key =
      '5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67'
    const bytes = keyToBytes(key)
    expect(bytes).toHaveLength(64)
  })

  it('converts a utf8 string to bytes', () => {
    const key = 'abcdef'
    const bytes = keyToBytes(key, 'utf8')
    expect(bytes).toHaveLength(6)
  })

  it('passes through a byte array unchanged', () => {
    const key =
      '5VbnBWz6kBnV2wfJZaPgv81Mj7QtAsPmq3QZgc3zZqbYZEzEdZQ9r24BGZpN6mt6djyr7W2v1eKYnnG3KSHtCD67'
    const bytes = keyToBytes(key)
    expect(keyToBytes(bytes)).toEqual(bytes)
  })
})
