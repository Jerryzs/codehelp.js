const gcd = (n: number, m: number): number => {
  n = Math.abs(n)
  m = Math.abs(m)
  if (m > n) {
    let a = n
    n = m
    m = a
  }
  while (true) {
      if (m === 0) return n
      n %= m
      if (n === 0) return m
      m %= n
  }
}

export default gcd
