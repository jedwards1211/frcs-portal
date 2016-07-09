import CachePage from '../../CachePage'

describe('CachePage', function() {
  it('chunks correctly', function() {
    expect(new CachePage('channel1', 0, 50,
      [0, 2, 5, 10, 11, 31, 35, 49],
      [1, 2, 3,  4,  5,  6,  7,  8]
    ).chunk(10)).toEqual([
      new CachePage('channel1', 0, 10,
        [0, 2, 5],
        [1, 2, 3]
      ),
      new CachePage('channel1', 10, 20,
        [10, 11],
        [ 4,  5]
      ),
      new CachePage('channel1', 30, 40,
        [31, 35],
        [ 6,  7],
      ),
      new CachePage('channel1', 40, 50,
        [49],
        [ 8]
      ),
    ])
  })

  it('replaces data correctly', function() {
    let initial, replacement, expected

    initial = new CachePage('channel1', 0, 100,
      [1, 4, 5, 9, 27, 58, 96, 97, 99],
      [1, 2, 3, 4,  5,  6,  7,  8,  9])

    replacement = new CachePage('channel1', 0, 100, [1], [1])
    expected = new CachePage('channel1', 0, 100, [1], [1])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', 27, 97,
      [27, 58, 95],
      [10, 11, 12])
    expected = new CachePage('channel1', 0, 100,
      [1, 4, 5, 9, 27, 58, 95, 97, 99],
      [1, 2, 3, 4, 10, 11, 12,  8,  9])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', -5, 105,
      [-4, 22, 101],
      [10, 11,  12])
    expected = new CachePage('channel1', 0, 100, [22], [11])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', -5, 105,
      [-4, 101],
      [10, 12])
    expected = new CachePage('channel1', 0, 100, [], [])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', -5, 27, [-4], [10])
    expected = new CachePage('channel1', 0, 100,
      [27, 58, 96, 97, 99],
      [ 5,  6,  7,  8,  9])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', -5, 27,
      [-4, -1,  0, 12],
      [10, 11, 12, 13])
    expected = new CachePage('channel1', 0, 100,
      [ 0, 12, 27, 58, 96, 97, 99],
      [12, 13,  5,  6,  7,  8,  9])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', 58, 105, [101], [10])
    expected = new CachePage('channel1', 0, 100,
      [1, 4, 5, 9, 27],
      [1, 2, 3, 4,  5])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)

    replacement = new CachePage('channel1', 58, 105,
      [58, 62, 100, 101],
      [10, 11,  12,  13])
    expected = new CachePage('channel1', 0, 100,
      [1, 4, 5, 9, 27, 58, 62],
      [1, 2, 3, 4,  5, 10, 11])
    expect(initial.clone().replaceData(replacement)).toEqual(expected)
  })
})
