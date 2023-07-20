import fs from 'fs';
import xml2js from 'xml2js';

export function addElementToCsProjFile(_csProjPath, _newElement) {
	// Read the .csproj file
	fs.readFile(_csProjPath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the .csproj file:', err);
			return;
		}

		// Parse the XML data into a JavaScript object
		xml2js.parseString(data, (err, result) => {
			if (err) {
				console.error('Error parsing XML:', err);
				return;
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
						);
					});
				}
			);

			if (!existingNoneElement) {
				// Add the new <ItemGroup><None> element to the JavaScript object
				if (!result.Project.ItemGroup) {
					result.Project.ItemGroup = [];
				}
				result.Project.ItemGroup.push(_newElement);

				// Convert the modified object back to XML format
				const builder = new xml2js.Builder();
				const updatedData = builder.buildObject(result);

				// Write the updated XML data back to the .csproj file
				fs.writeFile(_csProjPath, updatedData, 'utf8', (err) => {
					if (err) {
						console.error(
							`Error writing to the ${_csProjPath} file:`,
							err
						);
						return;
					}
					console.log(
						`New element added to the ${_csProjPath} file successfully!`
					);
				});
			} else {
				console.log(
					`Element already exists in the ${_csProjPath} file. Skipping addition.`
				);
			}
		});
	});
}
