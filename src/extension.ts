//  An extension that allows typing polytonic Greek into VS Code.
//  Copyright (C) 2020  André Kugland
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.


'use strict';

import * as vscode from 'vscode';

/**
 * Mapping of BetaCode codes to Greek Unicode characters.
 */
const betaCodeMap: Record<string, string> = {
  // Uppercase characters
  A: 'Α', B: 'Β', C: 'Ξ', D: 'Δ', E: 'Ε', F: 'Φ', G: 'Γ', H: 'Η',
  I: 'Ι', J: 'Σ', K: 'Κ', L: 'Λ', M: 'Μ', N: 'Ν', O: 'Ο', P: 'Π',
  Q: 'Θ', R: 'Ρ', S: 'Σ', S2: 'Σ', S3: 'Ϲ', T: 'Τ', U: 'Υ', V: 'Ϝ',
  W: 'Ω', X: 'Χ', Y: 'Ψ', Z: 'Ζ',

  // Lowercase characters
  a: 'α', b: 'β', c: 'ξ', d: 'δ', e: 'ε', f: 'φ', g: 'γ', h: 'η',
  i: 'ι', j: 'ς', k: 'κ', l: 'λ', m: 'μ', n: 'ν', o: 'ο', p: 'π',
  q: 'θ', r: 'ρ', s: 'σ', s2: 'ς', s3: 'ϲ', t: 'τ', u: 'υ', v: 'ϝ',
  w: 'ω', x: 'χ', y: 'ψ', z: 'ζ',

  // Accents
  ')': '\u0313',  // psili (spiritus lenis)
  '(': '\u0314',  // dasia (spiritus asper)
  '\\': '\u0300', // varia (grave accent)
  '/': '\u0301',  // oxia / tonos (acute accent)
  '=': '\u0342',  // perispomeni (circumflex)
  '|': '\u0345',  // ypogegrammeni (iota subscript)
  '+': '\u0308',  // dialytika (diaeresis)
  '_': '\u0304',  // macron
  '^': '\u0306',  // vrachy (breve)

  // Misc
  ':': '·',
};

/**
 * betaCodeMap represented as an array of tuples [code, greek],
 * ordered by code length (needed to ensure correct translating
 * of codes with more than one character).
 */
const betaCodeReplaces: [string, string][] = (
  Object.keys(betaCodeMap)
    .sort((a, b) => b.length - a.length)
    .map(code => [code, betaCodeMap[code]])
);

/**
 * Precedence of diacriticals (used in normalizeDiacriticals).
 */
const diacriticalPrecedence: Record<string, number> = {
  '(': 0, ')': 0, '+': 1,
  '/': 2, '\\': 2, '=': 2,
  '|': 3, '_': 4, '^': 4,
};

/**
 * Reorder diacriticals or String.normalize to be able to compose
 * combined characters whenever possible.
 */
const normalizeDiacriticals = (text: string) => {
  return text.replace(/([)(\\/=|_^+]{2,})/g, (match: string) => {
    const normalized = match.split('')
      .sort((a, b) => diacriticalPrecedence[a] - diacriticalPrecedence[b])
      .join('');
    return normalized;
  });
}

/**
 * Main function, which does the actual translation.
 *
 * @param text   text being translated.
 */
const translateBetaCode = (text: string) => {
  let result = text;
  // First reorder codes for diacriticals when needed.
  result = normalizeDiacriticals(text);
  // Then replace codes with Greek unicode characters.
  for (const [code, greek] of betaCodeReplaces) {
    result = result.split(code).join(greek);
  }
  // Normalize the result to combined Unicode characters.
  result = result.normalize('NFKC');
  return result;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.betaCode', function () {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const selections = editor.selections;

      editor.edit(editBuilder => {
        for (const selection of selections) {
          const text = document.getText(selection);
          const translatedText = translateBetaCode(text);
          editBuilder.replace(selection, translatedText);
        }
      });
    }
  });

  context.subscriptions.push(disposable);
}
