const useColor = process.stdout.isTTY && process.env.NO_COLOR !== "1";

function wrap(code: number, text: string): string {
  return useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export const c = {
  red: (s: string) => wrap(31, s),
  green: (s: string) => wrap(32, s),
  yellow: (s: string) => wrap(33, s),
  dim: (s: string) => wrap(2, s),
  bold: (s: string) => wrap(1, s),
};

export function die(msg: string): never {
  console.error(`${c.red("error:")} ${msg}`);
  process.exit(1);
}
