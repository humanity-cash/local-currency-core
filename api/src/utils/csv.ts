export function convertArrayToCSV(array) {
	// Use first element to choose the keys and the order
	const keys = Object.keys(array[0]);

	// Build header
	let result = keys.join(",") + "\n";

	// Add the rows
	array.forEach(function (obj) {
		result += keys.map(k => obj[k]).join(",") + "\n";
	});

	return result;
}
