import fs from 'fs';
export function addPropertyToJsonFile(filePath, propertyName, propertyValue) {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the file:', err);
			return;
		}

		try {
			// Parse the JSON data into a JavaScript object
			const jsonObject = JSON.parse(data);

			// Add the new property to the object
			jsonObject[propertyName] = propertyValue;

			// Convert the modified object back to JSON format with proper indentation
			const updatedData = JSON.stringify(jsonObject, null, 2);

			// Write the updated JSON data back to the file
			fs.writeFile(filePath, updatedData, 'utf8', (err) => {
				if (err) {
					console.error('Error writing to the file:', err);
					return;
				}
				console.log(
					`Property '${propertyName}' added to the ${filePath} successfully!`
				);
			});
		} catch (error) {
			console.error('Error parsing JSON:', error);
		}
	});
}
