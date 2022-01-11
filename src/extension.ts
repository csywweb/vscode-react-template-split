// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateCpnName(dirName: string) {


	const nameUnderlineArr = dirName.split('-');

	let cpnName = '';

	for (const name of nameUnderlineArr) {
		cpnName += capitalizeFirstLetter(name);
	}

	return cpnName;
}

function generateClassName(dirName: string) {
	const nameUnderlineArr = dirName.split('-');

	let className = '';
	// 去除'-'
	nameUnderlineArr.forEach((name, index) => {
		if (index === 0) {
			className += name;
		} else {
			className += capitalizeFirstLetter(name);
		}
	});

	return className;
}
function generateComponent(name: string, fullPath: string) {
	if (fs.existsSync(fullPath)) {
		console.log(`${name} already exists, please choose another name.`);
		vscode.window.showInformationMessage('组件已存在');
		return;
	}
	if (!name) {
		console.log('name should not be null');
	}

	const className = name;
	const cpnName = generateCpnName(name);
	console.log("className:", className);
	console.log("cpnName:", cpnName);
	fs.mkdirSync(fullPath);

	const tsxTemplate = path.resolve(__dirname, '../file-template/tsx.txt');
	const scssTemplate = path.resolve(__dirname, '../file-template/scss.txt');
	const typeTemplate = path.resolve(__dirname, '../file-template/type.txt');
	const indexTemplate = path.resolve(__dirname, '../file-template/index.txt');

	const tsxContent = fs.readFileSync(tsxTemplate, { encoding: 'utf-8' });
	const scssContent = fs.readFileSync(scssTemplate, { encoding: 'utf-8' });
	const typeContent = fs.readFileSync(typeTemplate, { encoding: 'utf-8' });
	const indexContent = fs.readFileSync(indexTemplate, { encoding: 'utf-8' });

	const tsxFile = path.resolve(`${fullPath}/${cpnName}.tsx`);
	const scssFile = path.resolve(`${fullPath}/${cpnName}.scss`);
	const typeFile = path.resolve(`${fullPath}/${cpnName}.type.ts`);
	const indexFile = path.resolve(`${fullPath}/index.ts`);

	// 写入tsx
	fs.writeFileSync(tsxFile, tsxContent.replace(/CpnName/g, cpnName).replace(/ClassName/g, className));
	// 写入scss
	fs.writeFileSync(scssFile, scssContent.replace(/ClassName/g, className));
	// 写入type
	fs.writeFileSync(typeFile, typeContent.replace(/CpnName/g, cpnName));
	// 写入index
	fs.writeFileSync(indexFile, indexContent.replace(/CpnName/g, cpnName));

	exec(`cd ${fullPath} && git add .`, (err) => {
		if (err) {
			console.log('command fail:', 'git add .');
		} else {
			console.log('command success:', 'git add .');
		}
	});

	vscode.window.showInformationMessage('component created successfully!');
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "react-template-split" is now active!');

	let cpn = vscode.commands.registerCommand('extension.createComponent', (param) => {
		const folderPath = param.fsPath;

		const options = {
			prompt: "Please input the component name(use '-' split): ",
			placeHolder: "componet-name"
		};

		vscode.window.showInputBox(options).then(value => {
			if (!value) { return; }

			const componentName = value;
			const fullPath = `${folderPath}/${componentName}`;

			generateComponent(componentName, fullPath);
		});
	});
	context.subscriptions.push(cpn);


}

// this method is called when your extension is deactivated
export function deactivate() { }
