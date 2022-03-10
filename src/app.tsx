import { useEffect, useState } from 'react'
import distribution from './utilities/distribution'
import shift from './utilities/shift'
import './app.scss'

import type { ChangeEvent } from 'react'

export const letters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
export const let2num = (s: string) => s.toUpperCase().charCodeAt(0) - 65
export const num2let = (n: number) => String.fromCharCode(n + 65)
export const mod = (n: number, m: number) => (((n % m) + m) % m)

function App () {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dist, setDist] = useState<NodeJS.Dict<number>>({})
  const [subInput, setSubInput] = useState<[string, string]>(['', ''])
  const [offset, setOffset] = useState(0)

  const resize = () => {
    const arr = document.getElementsByTagName('textarea')
    for (const el of Array.from(arr)) {
      el.style.height = '5px'
      el.style.height = el.scrollHeight + 2 + 'px'
    }
  }

  useEffect(() => {
    resize()
    setDist(distribution(input))
  }, [input])

  useEffect(() => {
    const [a, b] = subInput
    if (a === '' || b === '') {
      setOffset(0)
      return
    }
    const os = let2num(b) - let2num(a)
    setOffset(os)
    console.log(os)
  }, [subInput])

  useEffect(() => {
    setOutput(shift(input, offset))
  }, [input, offset])

  useEffect(() => {
    resize()
  }, [output])

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    setInput(el.value)
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') setInput(result)
    }
  }

  const handleSubInputChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value.toUpperCase()
    if (s.length > 1 || (s.length !== 0 && !letters.has(s))) return
    const a: [string, string] = [ ...subInput ]
    a[i] = s
    setSubInput(a)
    if (i === 0 && s.length !== 0) {
      (document.getElementsByClassName('app-sub-input')[1] as HTMLInputElement).focus()
    }
  }

  return (
    <div
      className="app container"
    >
      <div
        className='app-section'
      >
        <h1
          className='text-center'
        >
          CodeHelp.js
        </h1>
      </div>
      <div
        className='app-section'
      >
        <textarea
          className='app-input form-control font-monospace'
          value={input}
          placeholder='Ciphertext...'
          spellCheck={false}
          autoComplete='off'
          onChange={handleInputChange}
        />
        <input
          id='app-file-upload'
          className='d-none'
          type='file'
          accept='text/plain'
          onChange={handleFileUpload}
        />
        <button
          className='app-file-button btn btn-link font-monospace'
          onClick={() => document.getElementById('app-file-upload')?.click()}
        >
          Load a text file
        </button>
        <textarea
          readOnly
          disabled
          className='app-input form-control bg-white font-monospace'
          value={output}
          placeholder='Output...'
          spellCheck={false}
          autoComplete='off'
        />
      </div>
      {!input ? undefined : (
        <>
          <div
            className='app-section'
          >
            <span
              className='fw-bold'
            >
              Letter Distribution
            </span>
            <div className='app-distribution font-monospace'>
              {Object.keys(dist).map((k) => (
                <span key={`LD_${k}`}>
                  {`${k}: ${dist[k]}`}
                </span>
              ))}
              <span className='flex-grow-1'></span>
            </div>
          </div>
        </>
      )}
      <div
        className='app-section'
      >
        <span
          className='fw-bold'
        >
          Shift Substitution
        </span>
        <div>
          <input
            className='app-sub-input font-monospace'
            type='text'
            value={subInput[0]}
            onChange={handleSubInputChange.bind(null, 0)}
          />
          &rarr;
          <input
            className='app-sub-input font-monospace'
            type='text'
            value={subInput[1]}
            onChange={handleSubInputChange.bind(null, 1)}
          />
          {offset === 0 ? undefined : (
            <span className='font-monospace ms-3'>
              Shift: {offset}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
