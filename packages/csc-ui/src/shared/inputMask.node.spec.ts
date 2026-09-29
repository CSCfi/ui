/**
 * The input-mask engine (CONTEXT.md "Input mask"; ADR-0059): tokens,
 * lazy literals, caret mapping, completeness, the guide and optional
 * sections.
 */
import { describe, expect, it } from 'vitest';

import { compileMask, conformMask, isNumericMask } from './inputMask';

const conform = (mask: string, text: string, caret?: number, del = false) =>
  conformMask(compileMask(mask)!, text, caret, del);

describe('tokens', () => {
  it('drops characters a token does not take', () => {
    expect(conform('###', '1a2b3').text).toBe('123');
    expect(conform('AA', 'ä1ö').text).toBe('äö');
    expect(conform('**', '-a1').text).toBe('a1');
  });

  it('treats an escaped token character as a literal', () => {
    expect(conform('\\#-#', '5').text).toBe('#-5');
    expect(conform('\\#-#', '#-5').text).toBe('#-5');
  });

  it('drops what overflows the mask', () => {
    expect(conform('## ##', '123456').text).toBe('12 34');
  });

  it('knows a digits-only mask', () => {
    expect(isNumericMask('+358 ## ###')).toBe(true);
    expect(isNumericMask('AA ##')).toBe(false);
    expect(isNumericMask('\\A##')).toBe(true);
    expect(isNumericMask('abc')).toBe(false);
  });
});

describe('literals', () => {
  it('inserts a literal only when the next token character arrives', () => {
    expect(conform('## ###', '12').text).toBe('12');
    expect(conform('## ###', '123').text).toBe('12 3');
  });

  it('keeps an empty field empty under a prefix', () => {
    expect(conform('+358 ## ###', '').text).toBe('');
    expect(conform('+358 ## ###', '4').text).toBe('+358 4');
  });

  it('reads a digit as a token, not as a later literal of the prefix', () => {
    expect(conform('+358 ## ###', '3').text).toBe('+358 3');
  });

  it('consumes typed literals, formatted paste included', () => {
    expect(conform('+358 ## ###', '+358401').text).toBe('+358 40 1');
    expect(conform('+358 ## ###', '+358 40 123').text).toBe('+358 40 123');
    expect(conform('(###) ###', '(123) 456').text).toBe('(123) 456');
  });

  it('shows a typed literal right after its token', () => {
    expect(conform('## ###', '12 ').text).toBe('12 ');
  });

  it('appends a closing literal once the last token is filled', () => {
    expect(conform('## kg', '12').text).toBe('12 kg');
    expect(conform('## kg', '1').text).toBe('1');
  });

  it('trims trailing literals on a deletion', () => {
    expect(conform('## ###', '12 ', undefined, true).text).toBe('12');
    expect(conform('+358 ## ###', '+358 ', undefined, true).text).toBe('');
  });

  it('re-flows characters after a deletion inside the text', () => {
    expect(conform('## ###', '1 345', 1, true)).toMatchObject({
      caret: 1,
      text: '13 45',
    });
  });
});

describe('caret', () => {
  it('stays at the end after typing at the end', () => {
    expect(conform('## ###', '123', 3).caret).toBe(4);
  });

  it('keeps its place before dropped characters', () => {
    expect(conform('###', '1x2', 1).caret).toBe(1);
    expect(conform('###', '1x2', 2).caret).toBe(1);
  });

  it('follows a literal inserted before the next character', () => {
    // Typing 9 after "1" in "12 345": "192 345" → "19 234".
    expect(conform('## ###', '192 345', 2)).toMatchObject({
      caret: 3,
      text: '19 234',
    });
  });
});

describe('completeness', () => {
  it('is complete only when every token is filled', () => {
    expect(conform('## ###', '12 34').complete).toBe(false);
    expect(conform('## ###', '12 345').complete).toBe(true);
    expect(conform('## kg', '12').complete).toBe(true);
    expect(conform('## ###', '').complete).toBe(false);
  });

  it('reports the token characters alone', () => {
    expect(conform('+358 ## ###', '+358 40 123').unmasked).toBe('40123');
  });
});

describe('guide', () => {
  it('draws what the mask still asks for', () => {
    expect(conform('+358 ## ### ####', '').rest).toBe('+358 __ ___ ____');
    expect(conform('+358 ## ### ####', '4').rest).toBe('_ ___ ____');
    expect(conform('+358 ## ### ####', '+358 40 123 4567').rest).toBe('');
  });

  it('keeps a trimmed literal and an escaped one in the guide', () => {
    expect(conform('## ###', '12 ', undefined, true).rest).toBe(' ___');
    expect(conform('\\##', '').rest).toBe('#_');
  });

  it('is empty once closing literals are appended', () => {
    expect(conform('## kg', '1').rest).toBe('_ kg');
    expect(conform('## kg', '12').rest).toBe('');
  });
});

describe('optional sections', () => {
  const PHONE = '+358 #####[#######]';

  it('takes a run of variable length', () => {
    expect(conform(PHONE, '4012').complete).toBe(false);
    expect(conform(PHONE, '40123')).toMatchObject({
      complete: true,
      text: '+358 40123',
    });
    expect(conform(PHONE, '401234567890')).toMatchObject({
      complete: true,
      text: '+358 401234567890',
    });
    expect(conform(PHONE, '4012345678901').unmasked).toBe('401234567890');
  });

  it('inserts an optional literal lazily and consumes a typed one', () => {
    expect(conform('#####[-####]', '12345')).toMatchObject({
      complete: true,
      text: '12345',
    });
    expect(conform('#####[-####]', '123456').text).toBe('12345-6');
    expect(conform('#####[-####]', '12345-').text).toBe('12345-');
    expect(conform('#####[-####]', '12345-67').complete).toBe(true);
  });

  it('keeps grouping inside a section', () => {
    expect(conform('## ###[ ####]', '1234567').text).toBe('12 345 67');
  });

  it('trims an optional literal on a deletion, and draws it nowhere', () => {
    expect(conform('#####[-####]', '12345-', undefined, true)).toMatchObject({
      rest: '',
      text: '12345',
    });
  });

  it('draws only the required remainder in the guide', () => {
    expect(conform(PHONE, '').rest).toBe('+358 _____');
    expect(conform(PHONE, '401').rest).toBe('__');
    expect(conform(PHONE, '40123').rest).toBe('');
  });

  it('reads escaped brackets as literals', () => {
    expect(conform('\\[#\\]', '5').text).toBe('[5]');
    expect(isNumericMask('#####[-####]')).toBe(true);
  });

  it('rejects sections that are not trailing, nested or balanced', () => {
    for (const bad of ['[#]##', '##[#] kg', '[[#]]', '##[#', '##]'])
      expect(compileMask(bad), bad).toBeNull();

    expect(compileMask('## ###[ ####][###]')).not.toBeNull();
  });
});
