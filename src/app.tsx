import { useEffect, useState } from 'react'
import distribution from './utilities/distribution'
import gcd from './utilities/gcd'
import substitute from './utilities/substitute'
import './app.scss'

import type { ChangeEvent } from 'react'

export const letters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
export const let2num = (s: string) => s.toUpperCase().charCodeAt(0) - 65 + 1
export const num2let = (n: number) => String.fromCharCode(n + 65 - 1)
export const mod = (n: number, m: number) => (((n % m) + m) % m)

function App () {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dist, setDist] = useState<NodeJS.Dict<number>>({})
  const [tab, setTab] = useState(0)
  const [sftInput, setSftInput] = useState<[string, string]>(['', ''])
  const [shift, setShift] = useState(0)
  const [affInput, setAffInput] = useState<[string, string]>(['1', '0'])

  const resize = (el: HTMLTextAreaElement) => {
    const scrollLeft = window.pageXOffset
      || (document.documentElement
        || document.body.parentNode
        || document.body)
        .scrollLeft
    const scrollTop  = window.pageYOffset
      || (document.documentElement
        || document.body.parentNode
        || document.body)
        .scrollTop
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 2 + 'px'
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(scrollLeft, scrollTop)
    setTimeout(() => document.documentElement.style.scrollBehavior = '', 5)
  }

  useEffect(() => {
    setDist(distribution(input))
    resize(
      document.getElementsByClassName('app-input')[0] as HTMLTextAreaElement)
  }, [input])

  useEffect(() => {
    resize(
      document.getElementsByClassName('app-output')[0] as HTMLTextAreaElement)
  }, [output])

  useEffect(() => {
    const [a, b] = sftInput
    if (a === '' || b === '') {
      setShift(0)
      return
    }
    const os = let2num(b) - let2num(a)
    setShift(os)
  }, [sftInput])

  useEffect(() => {
    if (tab === 0) {
      setOutput(substitute(input, shift))
    }
    if (tab === 1) {
      const [a, b] = affInput.map((s) => parseInt(s))
      if (isNaN(a) || isNaN(b)) return
      setOutput(substitute(input, b, a))
    }
  }, [tab, input, shift, affInput])

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

  const handleSftInputChange = (
    i: number,
    id: string | undefined,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const s = e.target.value.trim().toUpperCase()
    if (s.length > 1 || (s.length !== 0 && !letters.has(s))) return
    const a: [string, string] = [ ...sftInput ]
    a[i] = s
      setSftInput(a)
    if (id !== undefined && s.length !== 0) {
      (document.getElementById(id) as HTMLInputElement).focus()
    }
  }

  const handleAffInputChange = (
    i: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const s = e.target.value.trim()
    if (s.includes('-') && s.substring(1).includes('-')) return
    const n = parseInt(s)
    if (s.length !== 0 && s !== '-' && (isNaN(n) || (i === 0 && n === 0))) return
    const a: [string, string] = [ ...affInput ]
    a[i] = s.length > 1 ? '' + n : s
    const [b, c] = [parseInt(a[0]), parseInt(a[1])]
    if (!isNaN(b) && !isNaN(c) && c > 0 && gcd(b, c) !== 1) {
      alert(`${b} and ${c} are not relatively prime.`)
      return
    }
    setAffInput(a)
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
        className='app-section font-monospace'
      >
        <textarea
          className='app-input form-control'
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
          className='app-file-button btn btn-link'
          onClick={() => document.getElementById('app-file-upload')?.click()}
        >
          Load a text file
        </button>
        <textarea
          readOnly
          disabled
          className='app-output form-control'
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
        <div>
          <a
            className={`app-tab-link fw-bold ${tab === 0 ? 'active' : undefined}`.trim()}
            href='#shift'
            onClick={(e) => {
              e.preventDefault()
              setTab(0)
            }}
          >
            Shift Substitution
          </a>
          <a
            className={`app-tab-link fw-bold ${tab === 1 ? 'active' : undefined}`.trim()}
            href='#affine'
            onClick={(e) => {
              e.preventDefault()
              setTab(1)
            }}
          >
            Affine Substitution
          </a>
        </div>
        {tab === 0 ? (
          <div
            className='app-sub font-monospace'
          >
            <input
              id='app-sft-input-1'
              className='app-sub-input app-sft-input'
              type='text'
              value={sftInput[0]}
              spellCheck={false}
              autoComplete='off'
              onChange={handleSftInputChange.bind(null, 0, 'app-sft-input-2')}
            />
            <span>
              &nbsp;&rarr;&nbsp;
            </span>
            <input
              id='app-sft-input-2'
              className='app-sub-input app-sft-input'
              type='text'
              value={sftInput[1]}
              spellCheck={false}
              autoComplete='off'
              onChange={handleSftInputChange.bind(null, 1, undefined)}
            />
            {shift === 0 ? undefined : (
              <span className='font-monospace ms-3'>
                Shift: {shift}
              </span>
            )}
          </div>
        ) : (
          <div
            className='app-sub font-monospace'
          >
            <span>
              Letter &times;&nbsp;
            </span>
            <input
              className='app-sub-input app-aff-input'
              type='text'
              value={affInput[0]}
              spellCheck={false}
              autoComplete='off'
              onChange={handleAffInputChange.bind(null, 0)}
            />
            <span>
              &nbsp;+&nbsp;
            </span>
            <input
              className='app-sub-input app-aff-input'
              type='text'
              value={affInput[1]}
              spellCheck={false}
              autoComplete='off'
              onChange={handleAffInputChange.bind(null, 1)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App
