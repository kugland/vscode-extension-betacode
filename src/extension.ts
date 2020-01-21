'use strict';

import * as vscode from 'vscode';

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
  "^": '\u0306',  // vrachy (breve)
};

const betaCodeReplaces = Object.keys(betaCodeMap)
  .sort((a, b) => b.length - a.length)
  .map(code => [code, betaCodeMap[code]]);

const diacriticalPrecedence: Record<string, number> = {
  '(': 0, ')': 0, '+': 1,
  '/': 2, '\\': 2, '=': 2,
  '|': 3, '_': 4, '^': 4,
};

const normalizeDiacriticals = (text: string) => {
  return text.replace(/([)(\\/=|_^+]{2,})/g, (match: string) => {
    const normalized = match.split('')
      .sort((a, b) => diacriticalPrecedence[a] - diacriticalPrecedence[b])
      .join('');
    return normalized;
  });
}

const translateBetaCode = (text: string) => {
  let result = text;
  result = normalizeDiacriticals(text);
  for (const [code, greek] of betaCodeReplaces) {
    result = result.split(code).join(greek);
  }
  return result.normalize('NFKC');
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.reverseWord', function () {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selections = editor.selections;
	
			editor.edit(editBuilder => {
        for (const selection of selections) {
          const paragraph = document.getText(selection);
          const translated = translateBetaCode(paragraph);
          editBuilder.replace(selection, translated);
        }
			});
		}
	});

	context.subscriptions.push(disposable);
}