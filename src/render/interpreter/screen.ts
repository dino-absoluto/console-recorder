/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
import { ANSIColors } from '../color/color'
import { ScreenColor } from '../color/color-screen'
import { palette8Bit } from '../color/palette-8bit'
import ansiRegExp from './regexp'
import cloneDeep = require('lodash/cloneDeep')

export interface Block {
  ch: string
  fg: Readonly<ScreenColor>
  bg: Readonly<ScreenColor>
}

type Line = Block[]

interface BufferState {
  buffer: Line[]
  x: number
  y: number
  savedX: number
  savedY: number
  fg: Readonly<ScreenColor>
  bg: Readonly<ScreenColor>
  reverse: boolean
  cursor: boolean
}

const newState = (container: ScreenBuffer): BufferState => {
  return {
    buffer: [],
    x: 0,
    y: 0,
    savedX: 0,
    savedY: 0,
    fg: container.defaultForeground,
    bg: container.defaultBackground,
    reverse: false,
    cursor: true
  }
}

interface ScreenBufferOptions {
  defaultBackground?: Readonly<ScreenColor>
  defaultForeground?: Readonly<ScreenColor>
  columns?: number
  rows?: number
}

export class ScreenBuffer {
  public readonly defaultBackground: Readonly<ScreenColor>
  = new ScreenColor({ type: 'ansi', code: ANSIColors.background }, this)
  public readonly defaultForeground: Readonly<ScreenColor>
  = new ScreenColor({ type: 'ansi', code: ANSIColors.foreground }, this)
  public palette = palette8Bit
  public columns = 80
  public rows = 24
  private state = newState(this)
  private alternate: BufferState | undefined
  public time = 0
  public timeEnd = 0

  public constructor (options: ScreenBufferOptions = {}) {
    if (options.columns) {
      this.columns = options.columns
    }
    if (options.rows) {
      this.rows = options.rows
    }
    if (options.defaultBackground) {
      this.defaultBackground = options.defaultBackground
    }
    if (options.defaultForeground) {
      this.defaultForeground = options.defaultForeground
    }
  }

  public get buffer (): Line[] { return this.state.buffer }
  public get x (): number { return this.state.x }
  public set x (nx: number) {
    this.state.x = nx > 0 ? nx : 0
  }
  public get y (): number { return this.state.y }
  public set y (ny: number) {
    this.state.y = ny > 0 ? ny : 0
  }

  public get savedX (): number { return this.state.savedX }
  public set savedX (nx: number) {
    this.state.savedX = nx > 0 ? nx : 0
  }
  public get savedY (): number { return this.state.savedY }
  public set savedY (ny: number) {
    this.state.savedY = ny > 0 ? ny : 0
  }

  public get fg (): Readonly<ScreenColor> {
    if (this.reverse) {
      return this.state.bg
    } else {
      return this.state.fg
    }
  }
  public set fg (value: Readonly<ScreenColor>) {
    this.state.fg = value
  }
  public get bg (): Readonly<ScreenColor> {
    if (this.reverse) {
      return this.state.fg
    } else {
      return this.state.bg
    }
  }
  public set bg (value: Readonly<ScreenColor>) {
    this.state.bg = value
  }

  public get reverse (): boolean { return this.state.reverse }
  public set reverse (value: boolean) {
    this.state.reverse = value
  }

  public get cursor (): boolean { return this.state.cursor }
  public set cursor (value: boolean) {
    this.state.cursor = value
  }

  public clone (): ScreenBuffer {
    const screen = new ScreenBuffer({
      defaultBackground: this.defaultBackground,
      defaultForeground: this.defaultForeground
    })
    Object.assign(screen, {
      columns: this.columns,
      rows: this.rows,
      state: cloneDeep(this.state),
      time: this.time,
      timeEnd: this.timeEnd,
      palette: this.palette
    })
    return screen
  }

  protected getLine (index: number): Line {
    const { buffer } = this
    const line = buffer[index]
    if (line == null) {
      const line: Line = []
      buffer[index] = line
      return line
    } else {
      return line
    }
  }

  protected print (text: string): void {
    if (text.length === 0) {
      return
    }
    let { x, y } = this
    const blocks = [...text].map((ch): Block => ({
      ch,
      fg: this.fg,
      bg: this.bg
    }))
    for (const [index, block] of blocks.entries()) {
      /* wrap text */
      const nx = (x + index) % this.columns
      const line = this.getLine(Math.trunc((x + index) / this.columns) + y)
      line[nx] = block
    }
    this.x = x + blocks.length
    if (this.buffer.length > this.rows) {
      this.buffer.shift()
      this.y--
    }
  }

  protected act (code: string): void {
    if (code[0] === '\x1b') {
      return this.escape(code)
    }
    switch (code) {
      case '\r': {
        if (this.x > this.columns) {
          this.y++
        }
        this.x = 0
        return
      }
      case '\n': {
        this.x = 0
        this.y++
        return
      }
      case '\b': {
        this.x = this.x - 1
        return
      }
      case '\t': {
        this.x = Math.ceil((this.x + 1) / 8) * 8
        break
      }
      default: {
        break
      }
    }
  }

  protected escape (code: string): void {
    code = code.substr(1)
    switch (code[0]) {
      case '[':
        return this.escapeSquare(code)
      case '?':
        return this.escapeQuestion(code)
    }
  }

  protected escapeQuestion (code: string): void {
    code = code.substr(1)
    switch (code) {
      case '25h': {
        this.cursor = true
        return
      }
      case '25l': {
        this.cursor = false
        return
      }
      case '1049h': {
        if (this.alternate == null) {
          this.alternate = this.state
          this.state = newState(this)
        }
        return
      }
      case '1049l': {
        if (this.alternate != null) {
          this.state = this.alternate
          this.alternate = undefined
        }
      }
    }
  }

  protected escapeSquare (code: string): void {
    code = code.substr(1)
    if (code[0] === '?') {
      return this.escapeQuestion(code)
    }
    switch (code) {
      case '3J':
      case '2J': {
        this.x = 0
        this.y = 0
        this.buffer.length = 0
        return
      }
      case '0K':
      case 'K': {
        const line = this.getLine(this.y)
        line.length = this.x
        return
      }
      case '1K': {
        const line = this.getLine(this.y)
        const length = line.length
        for (let i = 0; i < length; ++i) {
          delete line[i]
        }
        return
      }
      case '2K': {
        const line = this.getLine(this.y)
        line.length = 0
        return
      }
      case 's': {
        this.savedX = this.x
        this.savedY = this.y
        return
      }
      case 'u': {
        this.x = this.savedX
        this.y = this.savedY
        return
      }
      default: {
        break
      }
    }
    const id = code[code.length - 1]
    const values = code.substr(0, code.length - 1)
      .split(/;|:/g).filter((s): boolean => s.length > 0).map(
        (s): number => Number.parseInt(s, 10))
    switch (id) {
      case 'H':
      case 'f': {
        this.y = (values[0] || 1) - 1
        this.x = (values[1] || 1) - 1
        return
      }
      case 'A': {
        this.y -= values[0] || 1
        return
      }
      case 'B': {
        this.y += values[0] || 1
        return
      }
      case 'C': {
        this.x += values[0] || 1
        return
      }
      case 'D': {
        this.x -= values[0] || 1
        return
      }
      case 'E': {
        this.y += values[0] || 1
        this.x = 0
        return
      }
      case 'F': {
        this.y -= values[0] || 1
        this.x = 0
        return
      }
      case 'G': {
        this.x = (values[0] || 1) - 1
        return
      }
      case 'm': {
        this.escapeColor(values)
      }
    }
  }

  protected escapeColor (values: number[]): void {
    if (values.length === 0 || values[0] === 0) {
      this.fg = this.defaultForeground
      this.bg = this.defaultBackground
      this.reverse = false
      return
    }
    const length = values.length
    for (let i = 0; i < length; ++i) {
      const n = values[i]
      switch (n) {
        case 7: {
          this.reverse = true
          break
        }
        case 27: {
          this.reverse = false
          break
        }
        case 30:
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37: {
          const code = n - 30
          this.fg = new ScreenColor({
            type: 'ansi',
            code
          }, this)
          break
        }
        case 38: {
          const mode = values[++i]
          if (mode === 5) {
            const code = values[++i]
            this.fg = new ScreenColor({
              type: 'ansi',
              code
            }, this)
          } else if (mode === 2) {
            const r = values[++i]
            const g = values[++i]
            const b = values[++i]
            this.fg = new ScreenColor({
              type: 'rgb',
              r,
              g,
              b
            }, this)
          }
          break
        }
        case 39: {
          this.fg = this.defaultForeground
          break
        }
        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47: {
          const code = n - 40
          this.bg = new ScreenColor({
            type: 'ansi',
            code
          }, this)
          break
        }
        case 48: {
          const mode = values[++i]
          if (mode === 5) {
            const code = values[++i]
            this.bg = new ScreenColor({
              type: 'ansi',
              code
            }, this)
          } else if (mode === 2) {
            const r = values[++i]
            const g = values[++i]
            const b = values[++i]
            this.bg = new ScreenColor({
              type: 'rgb',
              r,
              g,
              b
            }, this)
          }
          break
        }
        case 49: {
          this.bg = this.defaultBackground
          break
        }
        case 90:
        case 91:
        case 92:
        case 93:
        case 94:
        case 95:
        case 96:
        case 97: {
          const code = n - 90 + 8
          this.fg = new ScreenColor({
            type: 'ansi',
            code
          }, this)
          break
        }
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107: {
          const code = n - 100 + 8
          this.bg = new ScreenColor({
            type: 'ansi',
            code
          }, this)
          break
        }
      }
    }
  }

  public decode (text: string): void {
    const fms = text.split(ansiRegExp)
    const end = Math.trunc(fms.length / 2)
    for (let i = 0; i < end; ++i) {
      this.print(fms[i * 2])
      this.act(fms[i * 2 + 1])
    }
    this.print(fms[fms.length - 1])
  }

  public toANSIString (): string {
    const { columns } = this
    let lastFg: Readonly<ScreenColor> = this.defaultForeground
    let lastBg: Readonly<ScreenColor> = this.defaultBackground
    return [...this.buffer].map((line): string => {
      if (!line) { return '' }
      const blocks = [...line]
      if (blocks.length > columns) {
        blocks.length = columns
      }
      return blocks.map((block): string => {
        if (!block) {
          return ' '
        }
        let text = block.ch
        if (!lastFg.isEqual(block.fg)) {
          const fg = block.fg
          text = fg.toANSI(false) + text
          lastFg = fg
        }
        if (!lastBg.isEqual(block.bg)) {
          const bg = block.bg
          text = bg.toANSI(true) + text
          lastBg = bg
        }
        return text
      }).join('')
    }).join('\x1b[49m\n')
  }
}
