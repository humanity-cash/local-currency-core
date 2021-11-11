export function convertArrayToCSV(input: any[]): string {
  // Use first element to choose the keys and the order
  const keys = Object.keys(input[0]);

  // Build header
  let result = keys.join(",") + "\n";

  // Add the rows
  input.forEach(function (obj) {
    result += keys.map((k) => obj[k]).join(",") + "\n";
  });

  return result;
}
