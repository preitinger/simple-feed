
test('regexp test', () => {
    const re = /(\d*)\.(\d*)\.(\d*)/

    expect(re.exec('25')).toBeNull();
    const res = re.exec('25.06.1977');
    expect(res).not.toBeNull();
    if (res == null) throw new Error('res null');
    expect(res.length).toBe(4);
    expect(res[0]).toBe('25.06.1977')
    expect(res[1]).toBe('25');
    expect(res[2]).toBe('06');
    expect(res[3]).toBe('1977');

    const res2 = re.exec('25.6.1977');
    expect(res2).not.toBeNull();
    if (res2 == null) throw new Error('res2 null');
    expect(res2.length).toBe(4);
    expect(res2[0]).toBe('25.6.1977');
    expect(res2[1]).toBe('25');
    expect(res2[2]).toBe('6');
    expect(res2[3]).toBe('1977');
    
})

test('exec not fully matching', () => {
    expect(/(\d*)\.(\d*)\.(\d*)/.exec('25.06')).toBeNull();
})