import { letters, let2num, num2let, mod } from "../app"

const shift = (s: string, n: number): string => {
  let sb = ''
  for (const c of s) {
    const u = c.toUpperCase()
    if (!letters.has(u)) {
      sb += c
      continue
    }
    const upper = c === u
    const r = num2let(Math.abs(mod((let2num(u) + n), 26)))
    upper ? sb += r : sb += r.toLowerCase()
  }
  return sb
}

export default shift
