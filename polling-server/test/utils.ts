export function log(msg: string): void {
  if (process.env.DEBUG === "true") console.log(msg);
}
