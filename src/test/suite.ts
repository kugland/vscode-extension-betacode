import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';

const cases: [string, string][] = [
  ['Pa/ter h(mw=n o( e)n toi=s ou)ranoi=s:', 'Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς·'],
  ['kai\\ mh\\ ei)sene/gkh|s h(ma=s ei)s peirasmo/n,', 'καὶ μὴ εἰσενέγκῃς ἡμᾶς εἰς πειρασμόν,'],
  ['a)lla\\ r(u=sai h(ma=s a)po\\ tou= ponhrou=.', 'ἀλλὰ ῥῦσαι ἡμᾶς ἀπὸ τοῦ πονηροῦ.'],
  ['A)mh/n. *a)mh/n.', 'Ἀμήν. Ἀμήν.'],
  ['su/nacis su/nacij', 'σύναξις σύναξις'],
  ['a_ a^ i+ i/+ s2', 'ᾱ ᾰ ϊ ΐ ς'],
];

async function translate(
  text: string,
  selections?: (doc: vscode.TextDocument) => vscode.Selection[],
) {
  const doc = await vscode.workspace.openTextDocument({ content: text });
  const editor = await vscode.window.showTextDocument(doc);
  editor.selections = selections
    ? selections(doc)
    : [new vscode.Selection(doc.positionAt(0), doc.positionAt(text.length))];
  await vscode.commands.executeCommand('extension.betaCode');
  const result = doc.getText();
  await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
  return result;
}

export async function run(): Promise<void> {
  console.log(
    `VS Code ${vscode.version}, Electron ${process.versions.electron}, Node ${process.versions.node}`,
  );

  for (const [input, expected] of cases) {
    assert.equal(await translate(input), expected, `translating ${JSON.stringify(input)}`);
  }

  // Only the selected ranges are translated, each independently.
  const multi = await translate('lo/gos | lo/gos | lo/gos', (doc) => [
    new vscode.Selection(doc.positionAt(0), doc.positionAt(6)),
    new vscode.Selection(doc.positionAt(18), doc.positionAt(24)),
  ]);
  assert.equal(multi, 'λόγος | lo/gos | λόγος');

  console.log(`All ${cases.length + 1} integration tests passed.`);
}
