import { letters } from "../app"

const distribution = (s: string): NodeJS.Dict<number> => {
  const dict: NodeJS.Dict<number> = {}
  letters.forEach((k) => dict[k] = 0)

  for (const l of s) {
    const u = l.toUpperCase()
    if (!letters.has(u)) continue
    dict[u]!++
  }

  const keys = Object.keys(dict)
  keys.sort((a, b) => dict[b]! - dict[a]!)

  return keys.reduce<NodeJS.Dict<number>>((o, k) => ({ ...o, [k]: dict[k] }), {})
}

export default distribution
