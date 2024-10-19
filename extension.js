// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const timeStamp = require('console');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kata-kid" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable= vscode.commands.registerCommand('extension.countLines', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			let lineCount = 0;
			const language = document.languageId;

			for (let i = 0; i < document.lineCount; i++) {
				const line = document.lineAt(i).text;
				if (line.trim() !=='') {
					lineCount++;
				}
			}

			const data = {
				language: language,
				lines: lineCount,
				timeStamp: new Date().toISOString()
			};
			fs.writeFileSync('codingStats.json', JSON.stringify(data, null, 2));

			vscode.window.showInformationMessage("O documento " + language + " tem " + lineCount + " linhas.");
		}
		});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
