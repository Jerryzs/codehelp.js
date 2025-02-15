import { alphabet, letters, let2num, mod, num2let } from "../app"

const applyToEach = (s: string, f: (c: string) => string): string => {
  let sb = ''
  for (const c of s) {
    const u = c.toUpperCase()
    if (!letters.has(u)) {
      sb += c
      continue
    }
    const upper = c === u
    const r = f(u)
    upper ? sb += r : sb += r.toLowerCase()
  }
  return sb
}

export const substitute = (s: string, n: number = 0, a: number = 1): string =>
  applyToEach(s, (u: string) => num2let(Math.abs(mod((let2num(u) * a + n), 26))))

export const applyMap = (s: string, m: string, r: boolean = false): string => 
  applyToEach(s, (c: string) => (r ? alphabet : m)[(r ? m : alphabet).indexOf(c)])

export default substitute
