import splitPrefixes from '../../splitPrefixes';

describe('splitPrefixes', () => {
  it('works for empty string', () => {
    expect([...splitPrefixes('', ',')]).toEqual([]);
    expect([...splitPrefixes('', /,/)]).toEqual([]); 
  }); 
  it('works for just sep', () => {
    expect([...splitPrefixes(',', ',')]).toEqual(['', ',']);
    expect([...splitPrefixes(',', /,/g)]).toEqual(['', ',']);
  });
  it('works for multiple seps', () => {
    expect([...splitPrefixes(',1,2,,,3,4,', ',')]).toEqual(['', ',1', ',1,2', ',1,2,', ',1,2,,', ',1,2,,,3', ',1,2,,,3,4', ',1,2,,,3,4,']);
    expect([...splitPrefixes(',1,2,,,3,4,', /,/g)]).toEqual(['', ',1', ',1,2', ',1,2,', ',1,2,,', ',1,2,,,3', ',1,2,,,3,4', ',1,2,,,3,4,']);
  });
});