import { letters, let2num, mod, num2let } from "../app"

const substitute = (s: string, n: number = 0, a: number = 1): string =>{
  let sb = ''
  for (const c of s) {
    const u = c.toUpperCase()
    if (!letters.has(u)) {
      sb += c
      continue
    }
    const upper = c === u
    const r = num2let(Math.abs(mod((let2num(u) * a + n), 26)))
    upper ? sb += r : sb += r.toLowerCase()
  }
  return sb
}

export default substitute
