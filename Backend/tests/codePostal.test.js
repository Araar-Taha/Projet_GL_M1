import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { whereCodePostal } from '../src/lib/codePostal.js';

describe('Tests Unitaires - Filtre code postal', () => {
  it('Classe departement : filtre avec le debut du code postal', () => {
    const result = whereCodePostal('54');

    assert.deepStrictEqual(result, {
      code_postal: { startsWith: '54' }
    });
  });

  it('Classe departement outre-mer : accepte un code departement sur 3 chiffres', () => {
    const result = whereCodePostal('971');

    assert.deepStrictEqual(result, {
      code_postal: { startsWith: '971' }
    });
  });

  it('Classe commune : filtre sur le code postal exact', () => {
    const result = whereCodePostal('54000');

    assert.deepStrictEqual(result, {
      code_postal: '54000'
    });
  });
});
