import { useEffect, useState } from 'react'
import distribution from './utilities/distribution'
import gcd from './utilities/gcd'
import substitute from './utilities/substitute'
import './app.scss'

import type { ChangeEvent, SyntheticEvent } from 'react'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const letters = new Set(alphabet)
export const let2num = (s: string) => s.toUpperCase().charCodeAt(0) - 65 + 1
export const mod = (n: number, m: number) => (((n % m) + m) % m)
export const num2let = (n: number) => String.fromCharCode(mod(n - 1, 26) + 65)

function App () {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dist, setDist] = useState<NodeJS.Dict<number>>({})
  const [tab, setTab] = useState(0)
  const [sftInput, setSftInput] = useState<[string, string]>(['', ''])
  const [shift, setShift] = useState('0')
  const [affInput, setAffInput] = useState<[string, string]>(['1', '0'])
  const [mapState, setMapState] = useState(0)
  const [mapAlpha, setMapAlpha] = useState(alphabet)

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
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault()

      const data = e.dataTransfer
      if (data) (data.items
          ? data.items[0].getAsFile()?.text()
          : data.files[0].text())
        ?.then(setInput)
    }

    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('drop', handleWindowDrop)

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [])

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
      setShift('0')
      return
    }
    const os = let2num(b) - let2num(a)
    setShift('' + os)
  }, [sftInput])

  useEffect(() => {
    if (tab === 0)
      document.getElementById('app-sft-input-1')?.focus()
    if (tab === 1)
      document.getElementById('app-aff-input-1')?.focus()
  }, [tab])

  useEffect(() => {
    let alpha

    if (tab === 0) {
      let s = parseInt(shift)
      if (isNaN(s)) s = 0
      alpha = substitute(alphabet, s)
    }
    if (tab === 1) {
      let [a, b] = affInput.map((s) => parseInt(s))
      if (isNaN(a)) a = 1
      if (isNaN(b)) b = 0
      alpha = substitute(alphabet, b, a)
    }

    if (alpha) {
      if (mapState === 0) {
        const arr = Array.from(alpha)
          .map((l) => let2num(l) - 1)
        alpha = Object.values(arr)
          .sort((a, b) => arr[a] - arr[b])
          .map((n) => num2let(n + 1))
          .join('')
      }

      setMapAlpha(alpha)
    }
  }, [tab, shift, affInput, mapState])

  useEffect(() => {
    if (tab === 0) {
      let s = parseInt(shift)
      if (isNaN(s)) s = 0
      setOutput(substitute(input, s))
    }
    if (tab === 1) {
      let [a, b] = affInput.map((s) => parseInt(s))
      if (isNaN(a)) a = 1
      if (isNaN(b)) b = 0
      setOutput(substitute(input, b, a))
    }
  }, [tab, input, shift, affInput])

  const inputSelectAll = (e: SyntheticEvent<HTMLInputElement>) => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
  }

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

  const handleShiftChange = (e: ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value.trim()
    if (s.includes('-') && s.substring(1).includes('-')) return
    const n = parseInt(s)
    if (s.length !== 0
        && s !== '-'
        && (isNaN(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER))
      return
    setShift(s.length > 1 ? '' + n : s)
  }

  const handleAffInputChange = (
    i: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const s = e.target.value.trim()
    if (s.includes('-') && s.substring(1).includes('-')) return
    const n = parseInt(s)
    if (s.length !== 0
        && s !== '-'
        && (isNaN(n)
          || (i === 0 && n === 0)
          || Math.abs(n) > Number.MAX_SAFE_INTEGER))
      return
    const t: [string, string] = [ ...affInput ]
    t[i] = s.length > 1 ? '' + n : s
    const a = parseInt(t[0])
    if (!isNaN(a) && gcd(a, 26) !== 1) {
      alert(`${a} and 26 must be relatively prime.`)
      return
    }
    setAffInput(t)
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
          autoCorrect='off'
          autoCapitalize='off'
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
          Select or drop a text file
        </button>
        <textarea
          readOnly
          className='app-output form-control'
          value={output}
          placeholder='Output...'
          spellCheck={false}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
        />
      </div>
      <div
        className='app-section app-action'
      >
        <div>
          <div
            className='fw-bold'
          >
            <span
              className='me-2'
            >
              Substitution
            </span>
            <span>
              (
              <button
                className={`app-tab-link btn btn-link ${
                  tab === 0 ? 'active' : ''
                }`.trim()}
                onClick={() => setTab(0)}
              >
                Shift
              </button>
              /
              <button
                className={`app-tab-link btn btn-link ${
                  tab === 1 ? 'active' : ''
                }`.trim()}
                onClick={() => setTab(1)}
              >
                Affine
              </button>
              )
            </span>
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
                autoCorrect='off'
                autoCapitalize='off'
                onFocus={inputSelectAll}
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
                autoCorrect='off'
                autoCapitalize='off'
                onFocus={inputSelectAll}
                onChange={handleSftInputChange.bind(null, 1, undefined)}
              />
              <span
                className='me-5'
              />
              <span>
                Shift:&nbsp;
              </span>
              <input
                className='app-sub-input app-sft-direct-input'
                type='text'
                value={shift}
                spellCheck={false}
                autoComplete='off'
                autoCorrect='off'
                autoCapitalize='off'
                onFocus={inputSelectAll}
                onChange={handleShiftChange}
              />
            </div>
          ) : (
            <div
              className='app-sub font-monospace'
            >
              <span>
                Letter &times;&nbsp;
              </span>
              <input
                id='app-aff-input-1'
                className='app-sub-input app-aff-input'
                type='text'
                value={affInput[0]}
                spellCheck={false}
                autoComplete='off'
                autoCorrect='off'
                autoCapitalize='off'
                onFocus={inputSelectAll}
                onChange={handleAffInputChange.bind(null, 0)}
              />
              <span>
                &nbsp;+&nbsp;
              </span>
              <input
                id='app-aff-input-2'
                className='app-sub-input app-aff-input'
                type='text'
                value={affInput[1]}
                spellCheck={false}
                autoComplete='off'
                autoCorrect='off'
                autoCapitalize='off'
                onFocus={inputSelectAll}
                onChange={handleAffInputChange.bind(null, 1)}
              />
            </div>
          )}
        </div>
        <div>
          <div
            className='fw-bold'
          >
            <span
              className='me-2'
            >
              Substitution Map
            </span>
            <span>
              (
              <button
                className='app-cipher-map-switch btn btn-link fw-bold'
                onClick={() => mapState === 0 ? setMapState(1) : setMapState(0)}
              >
                Swap
              </button>
              )
            </span>
          </div>
          <div
            className='app-cipher-map font-monospace'
          >
            <div
              className='fw-bold'
            >
              <span>
                Ciphered:&nbsp;
              </span>
              <span>
                Plain:&nbsp;
              </span>
            </div>
            <div
              className='overflow-auto'
            >
              <span
                className='app-cipher-map-alphabet'
              >
                {mapState === 0 ? mapAlpha : alphabet}
              </span>
              <span
                className='app-cipher-map-alphabet'
              >
                {mapState === 1 ? mapAlpha : alphabet}
              </span>
            </div>
          </div>
        </div>
      </div>
      {!input ? undefined : (
        <>
          <div
            className='app-section'
          >
            <div
              className='app-distribution-heading fw-bold'
            >
              Letter Distribution
            </div>
            <div
              className='app-distribution font-monospace'
            >
              {Object.keys(dist).map((k) => (
                <span
                  key={`letter-dist_${k}`}
                  title={`${k}: ${dist[k]}`}
                >
                  {`${k}: ${dist[k]}`}
                </span>
              ))}
              <span
                className='flex-grow-1'
              />
            </div>
          </div>
        </>
      )}
      <div className='app-section font-monospace small text-muted'>
        Created by Jerry in 2022, while at&nbsp;
        <a
          className='text-reset'
          href='https://www.winchesterthurston.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Winchester Thurston School, Pittsburgh, PA
        </a>.
        <br />
        Source code available on&nbsp;
        <a
          className='text-reset'
          href='https://github.com/Jerryzs/codehelp.js'
          target='_blank'
          rel='noopener noreferrer'
        >
          Github
        </a>.
      </div>
    </div>
  );
}

export default App
