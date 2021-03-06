import { keyToBytes } from './keyToBytes'

describe('keyToBytes', () => {
  it('converts a base64 string to bytes', () => {
    const key = 'OH8olQvUFfxqjd+A4FkPQZq0mSb9GGKIOfuCFLDd0B0='
    const bytes = keyToBytes(key)
    expect(bytes).toHaveLength(32)
  })

  it('converts a utf8 string to bytes', () => {
    const key = 'abcdef'
    const bytes = keyToBytes(key, 'utf8')
    expect(bytes).toHaveLength(6)
  })

  it('passes through a byte array unchanged', () => {
    const key = 'OH8olQvUFfxqjd+A4FkPQZq0mSb9GGKIOfuCFLDd0B0='
    const bytes = keyToBytes(key)
    expect(keyToBytes(bytes)).toEqual(bytes)
  })
})
