import { exec } from 'child_process'
import fs from 'fs'
import { glob } from 'glob'
import inquirer from 'inquirer'
import path from 'path'
import xml2js from 'xml2js'

function addPropertyToJsonFile(filePath, propertyName, propertyValue) {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the file:', err)
			return
		}

		try {
			// Parse the JSON data into a JavaScript object
			const jsonObject = JSON.parse(data)

			// Add the new property to the object
			jsonObject[propertyName] = propertyValue

			// Convert the modified object back to JSON format with proper indentation
			const updatedData = JSON.stringify(jsonObject, null, 2)

			// Write the updated JSON data back to the file
			fs.writeFile(filePath, updatedData, 'utf8', (err) => {
				if (err) {
					console.error('Error writing to the file:', err)
					return
				}
				console.log(
					`Property '${propertyName}' added to the ${filePath} successfully!`,
				)
			})
		} catch (error) {
			console.error('Error parsing JSON:', error)
		}
	})
}

// Search file(s) using glob pattern but exclude node_modules
// Search files matching the glob pattern but exclude the node_modules directory
const files = glob.sync(
	'../**/*.csproj',
	{ ignore: 'node_modules/**' },
	(err, files) => {
		console.log('🚀 ~ file: setup-viteaspnet.js:9 ~ glob ~ err:', err)
		if (err) {
			console.error('Error searching for files:', err)
			return
		}
	},
)

//get filename only without extension from files
const filesWithoutExtension = files.map((file) => {
	const fileWithoutExtension = path.basename(file, path.extname(file))
	return fileWithoutExtension
})

const answers = await inquirer.prompt([
	// {
	// 	name: 'viteVersion',
	// 	message: 'Vite.Asp.NetCore version:',
	// 	default: 'latest',
	// 	type: 'list',
	// 	choices: ['latest'],
	// },
	{
		name: 'csProjPath',
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
])

const { projectNamespace, csProjPath } = answers
// get just the directory path from csProjPath
const csProjDir = path.dirname(csProjPath)


/**
 * Setup Startup.cs
 */
//replace Startup.cs in UmbracoCMS2/Startup.cs with the one in ./vite-aspnetcore-config/Startup.cs
const startupAfterVite18Path = path.resolve(
	'./vite-aspnetcore-config/Startup.cs',
)

//rename "NAMESPACE" in file on startupAfterVite18Path
const startupAfterVite18 = fs.readFileSync(startupAfterVite18Path, 'utf8')
const startupAfterVite18WithNamespace = startupAfterVite18.replace(
	'NAMESPACE',
	projectNamespace,
)

// write startUpAfterVite18WithNamespace into file in config.STARTUP
fs.writeFileSync(
	path.join(csProjDir, 'Startup.cs'),
	startupAfterVite18WithNamespace,
	(err) => {
		if (err) {
			console.error('Error writing to the file:', err)
			return
		}
		console.log('Content has been written to the file successfully!')
	},
)



/**
 * Add Vite stuff on appsettings.json and appsettings.Development.json
 */
const appsettingsPath = path.join(csProjDir, 'appsettings.json')
const appsettingsDevelopmentPath = path.join(
	csProjDir,
	'appsettings.Development.json',
)

addPropertyToJsonFile(appsettingsPath, 'Vite', {
	Manifest: '../dist/manifest.json',
	PackageManager: 'pnpm',
	PackageDirectory: '../FE_DEV',
})
addPropertyToJsonFile(appsettingsDevelopmentPath, 'Vite', {
	Server: {
		Autorun: true,
		Port: 5173,
		Https: true,
	},
})

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
}
function addElementToCsProjFile(_csProjPath, _newElement) {
	// Read the .csproj file
	fs.readFile(_csProjPath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the .csproj file:', err)
			return
		}

		// Parse the XML data into a JavaScript object
		xml2js.parseString(data, (err, result) => {
			if (err) {
				console.error('Error parsing XML:', err)
				return
			}

			// Check if the <None> element with the specified attributes already exists
			const existingNoneElement = result.Project.ItemGroup?.find(
				(itemGroup) => {
					return itemGroup.None?.some((noneItem) => {
						return (
							noneItem['$'].Include ===
								_newElement.None[0]['$'].Include &&
							noneItem['$'].CopyToOutputDirectory ===
								_newElement.None[0]['$'].CopyToOutputDirectory
						)
					})
				},
			)

			if (!existingNoneElement) {
				// Add the new <ItemGroup><None> element to the JavaScript object
				if (!result.Project.ItemGroup) {
					result.Project.ItemGroup = []
				}
				result.Project.ItemGroup.push(_newElement)

				// Convert the modified object back to XML format
				const builder = new xml2js.Builder()
				const updatedData = builder.buildObject(result)

				// Write the updated XML data back to the .csproj file
				fs.writeFile(_csProjPath, updatedData, 'utf8', (err) => {
					if (err) {
						console.error(`Error writing to the ${_csProjPath} file:`, err)
						return
					}
					console.log(
						`New element added to the ${_csProjPath} file successfully!`,
					)
				})
			} else {
				console.log(
					`Element already exists in the ${_csProjPath} file. Skipping addition.`,
				)
			}
		})
	})
}
addElementToCsProjFile(csProjPath, noneElement)


/**
 * Install Vite.Asp.NetCore in the directory of the .csproj file
 */
const command = `dotnet add ${csProjDir} package Vite.AspNetCore`
exec(command, (error, stdout) => {
	if (error) {
		console.error('Error running dotnet add package:', error.message)
		return
	}

	console.log('Package installed successfully!')
	console.log(stdout)
})
