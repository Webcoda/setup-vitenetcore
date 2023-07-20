#!/usr/bin/env node
import { exec } from 'child_process';
import fs from 'fs';
import { glob } from 'glob';
import inquirer from 'inquirer';
import path from 'path';

import { addElementToCsProjFile } from './utils/addElementToCsProjFile.js';
import { addPropertyToJsonFile } from './utils/addPropertyToJsonFile.js';

const stepSetupAppSettings = (csProjDir) => {
	const appsettingsPath = path.join(csProjDir, 'appsettings.json');
	const appsettingsDevelopmentPath = path.join(
		csProjDir,
		'appsettings.Development.json'
	);

	addPropertyToJsonFile(appsettingsPath, 'Vite', {
		Manifest: '../dist/manifest.json',
		PackageManager: 'pnpm',
		PackageDirectory: '../FE_DEV',
	});
	addPropertyToJsonFile(appsettingsDevelopmentPath, 'Vite', {
		Server: {
			Autorun: true,
			Port: 5173,
			Https: true,
		},
	});
};

const stepSetupCsprojFile = (csProjPath) => {
	/**
	 * Add <ItemGroup></ItemGroup> in .csproj file
	 */
	const noneElement = {
		None: [
			{
				$: {
					Include: 'dist\\**\\*',
					CopyToOutputDirectory: 'PreserveNewest',
				},
			},
		],
	};

	addElementToCsProjFile(csProjPath, noneElement);
};

const stepSetupStartup = (csProjDir, projectNamespace) => {
	//replace Startup.cs in UmbracoCMS2/Startup.cs with the one in ./vite-aspnetcore-config/Startup.cs
	const startupAfterVite18Path = path.resolve(
		'./vite-aspnetcore-config/Startup.cs'
	);

	//rename "NAMESPACE" in file on startupAfterVite18Path
	const startupAfterVite18 = fs.readFileSync(startupAfterVite18Path, 'utf8');
	const startupAfterVite18WithNamespace = startupAfterVite18.replace(
		'NAMESPACE',
		projectNamespace
	);

	// Create a backup of Startup.cs in csProjDir (will be named Startup.cs.bak) if the Startup.cs.bak doesn't exist yet
	const startupPath = path.join(csProjDir, 'Startup.cs');
	if (!fs.existsSync(startupPath + '.bak')) {
		fs.copyFileSync(startupPath, startupPath + '.bak');
	}
	// write startUpAfterVite18WithNamespace into file in config.STARTUP
	fs.writeFileSync(startupPath, startupAfterVite18WithNamespace, (err) => {
		if (err) {
			console.error('Error writing to the file:', err);
			return;
		}
		console.log('Content has been written to the file successfully!');
	});
}

const stepInstallViteAspNetCorePackage = (csProjDir) => {
    const command = `dotnet add ${csProjDir} package Vite.AspNetCore`;
    exec(command, (error, stdout) => {
        if (error) {
            console.error('Error running dotnet add package:', error.message);
            return;
        }

        console.log('Package installed successfully!');
        console.log(stdout);
    });
}

async function run() {
	// Search file(s) using glob pattern but exclude node_modules
	// Search files matching the glob pattern but exclude the node_modules directory
	const files = glob.sync(
		'../**/*.csproj',
		{ ignore: 'node_modules/**' },
		(err, files) => {
			console.log('🚀 ~ file: setup-viteaspnet.js:9 ~ glob ~ err:', err);
			if (err) {
				console.error('Error searching for files:', err);
				return;
			}
		}
	);

	//get filename only without extension from files
	const filesWithoutExtension = files.map((file) => {
		const fileWithoutExtension = path.basename(file, path.extname(file));
		return fileWithoutExtension;
	});

	const answers = await inquirer.prompt([
		// {
		// 	name: 'viteVersion',
		// 	message: 'Vite.Asp.NetCore version:',
		// 	default: 'latest',
		// 	type: 'list',
		// 	choices: ['latest'],
		// },
		{
			name: 'csProjFilePath',
			message: 'Path of .csproj file:',
			type: 'list',
			default: files[0],
			choices: files,
		},
		{
			name: 'projectNamespace',
			message: 'Project namespace (namespace in Startup.cs):',
			type: 'list',
			default: filesWithoutExtension[0],
			choices: filesWithoutExtension,
		},
	]);

	const { projectNamespace, csProjFilePath } = answers;
	// get just the directory path from csProjPath
	const csProjDir = path.dirname(csProjFilePath);

	/**
	 * Step: Setup Startup.cs
	 */
    stepSetupStartup(csProjDir, projectNamespace)
	
	/**
	 * Step: Setup appsettings.json and appsettings.Development.json
	 */
	stepSetupAppSettings(csProjDir);

	/**
	 * Step: Setup .csproj file
	 */
	stepSetupCsprojFile(csProjFilePath);

	/**
	 * Install Vite.Asp.NetCore in the directory of the .csproj file
	 */
	stepInstallViteAspNetCorePackage(csProjDir);
}

run();
