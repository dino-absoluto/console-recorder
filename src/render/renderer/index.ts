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
import { ScreenBuffer } from '../interpreter/screen'
import { ScreenColor } from '../interpreter/color-screen'
import {
  Palette,
  ANSIColors
} from '../interpreter/color'
import {
  palette8Bit
} from '../interpreter/palette-8bit'
import {
  toBackgrounds
  , Rect
  , toFragments
  , Text
} from './fragments'
import { readFile, writeFile } from '../../utils/pfs'
import * as c from 'kleur'
import * as path from 'path'
import handlebars = require('handlebars')
import round = require('lodash/round')

const PRECISION = 4

handlebars.registerHelper('nullCheck', (some: unknown): boolean => some != null)
handlebars.registerHelper('percent',
  (some: number): string => (round(some * 100, PRECISION) + '%'))
handlebars.registerHelper('average',
  (a: number, b: number): number => (a + b) / 2)

/* constants */
const rem = 15
const glyphWidth = rem * 0.6
const glyphHeight = rem * 1.5
const glyphBaseline = rem * 0.8
const fontDefault = [
  'PT Mono',
  'SFMono-Regular',
  'Menlo',
  'DejaVu Sans Mono',
  'Liberation Mono',
  'Consolas',
  'Ubuntu Mono',
  'Courier New',
  'andale mono',
  'lucida console',
  'monospace'
]

const templatePromise = (async ():
Promise<ReturnType<typeof handlebars.compile>> => {
  let data: string
  try {
    data = (await readFile(path.join(__dirname, '/templates/svg.hbs'))).toString()
  } catch {
    data = (await import('./templates/svg.hbs')).default
  }
  return handlebars.compile(data)
})()

interface DataFrame {
  dur: number
  begin: string
  beginPercentage: number
  endPercentage: number
}

interface CursorState {
  x?: number
  y?: number
  actualX?: number
  actualY?: number
  visible?: boolean
}

class DataBuilder {
  public defaultBackground: Readonly<ScreenColor>
  public defaultForeground: Readonly<ScreenColor>
  public palette: Palette
  public padding = rem * 1.5
  public rem = rem
  public glyphWidth = glyphWidth
  public glyphHeight = glyphHeight
  public width: number = 0
  public height: number = 0
  public fontFamily = fontDefault
  public screens: ScreenBuffer[]
  public fragments: ReturnType<typeof toFragments> = []
  public fmMap = new Map<string, Text>()
  public rects: Rect[] = []
  public rectMap = new Map<string, Rect>()
  public frames: DataFrame[] = []
  public cursorFrames: CursorState[] = []
  public totalLength = 0
  public constructor (screens: ScreenBuffer[]) {
    this.screens = screens
    this.width = Math.round(screens[0].columns * glyphWidth + this.padding * 2)
    this.height = Math.round((screens.reduce(
      (max, i): number => Math.max(max, i.buffer.length), 0) + 1) *
      glyphHeight + this.padding * 2)
    const last = screens[screens.length - 1]
    if (last != null) {
      this.totalLength = last.timeEnd / 1000
    }
    const first = screens[0]
    if (first) {
      this.defaultBackground = first.defaultBackground
      this.defaultForeground = first.defaultForeground
      this.palette = first.palette
    } else {
      this.defaultBackground =
        new ScreenColor({ type: 'ansi', code: ANSIColors.background }, this)
      this.defaultForeground =
        new ScreenColor({ type: 'ansi', code: ANSIColors.foreground }, this)
      this.palette = palette8Bit
    }
  }

  protected parseScreen (screenIndex: number, screen: ScreenBuffer): void {
    const { fmMap, fragments } = this
    const fms = toFragments(screen, this)
    for (let fm of fms) {
      if (!fm) { continue }
      {
        const oldFm = fmMap.get(fm.id)
        if (oldFm) {
          fm = oldFm
        } else {
          fmMap.set(fm.id, fm)
          fragments.push(fm)
        }
      }
      if (!fm.options) {
        fm.options = {
          x: round(fm.col * glyphWidth, PRECISION),
          y: round(fm.row * glyphHeight + glyphBaseline, PRECISION),
          width: round(fm.span * glyphWidth, PRECISION),
          height: glyphHeight,
          frames: []
        }
      }
      const { frames } = fm.options
      const last = frames[frames.length - 1]
      if (last && last.end === screenIndex - 1) {
        last.end = screenIndex
      } else {
        frames.push({
          begin: screenIndex,
          end: screenIndex
        })
      }
    }
    const { rectMap, rects } = this
    const squares = toBackgrounds(screen, this)
    for (let sq of squares) {
      if (!sq) { continue }
      {
        const oldSq = rectMap.get(sq.id)
        if (oldSq) {
          sq = oldSq
        } else {
          rectMap.set(sq.id, sq)
          rects.push(sq)
        }
      }
      if (!sq.options) {
        sq.options = {
          x: round(sq.col * glyphWidth, PRECISION),
          y: round(sq.row * glyphHeight, PRECISION),
          width: round(sq.span * glyphWidth, PRECISION),
          height: glyphHeight,
          frames: []
        }
      }
      const { frames } = sq.options
      const last = frames[frames.length - 1]
      if (last && last.end === screenIndex - 1) {
        last.end = screenIndex
      } else {
        frames.push({
          begin: screenIndex,
          end: screenIndex
        })
      }
    }
  }

  protected initFrames (): void {
    const { frames } = this
    for (const [index, screen] of this.screens.entries()) {
      const begin = screen.time / 1000
      const end = screen.timeEnd / 1000
      const dur = Math.round((end - begin) * 1000) / 1000
      frames.push({
        begin: `frame${index - 1}.end`,
        dur: Math.max(0.001, dur),
        beginPercentage: screen.time / (this.totalLength * 1000),
        endPercentage: screen.timeEnd / (this.totalLength * 1000)
      })
    }
    const first = frames[0]
    if (first) {
      first.begin = `0; frame${frames.length - 1}.end`
    }
  }

  protected initCursor (): void {
    const { cursorFrames } = this
    let lastX = NaN
    let lastY = NaN
    let visible = true
    for (const screen of this.screens) {
      const x = screen.x * glyphWidth
      const y = screen.y * glyphHeight
      const frame: CursorState = {}
      if (lastX !== x) {
        frame.x = x
      }
      if (lastY !== y) {
        frame.y = y
      }
      frame.actualX = x
      frame.actualY = y
      if (visible !== screen.cursor) {
        frame.visible = screen.cursor
      }
      lastX = x
      lastY = y
      visible = screen.cursor
      cursorFrames.push(frame)
    }
  }

  public init (): void {
    this.initFrames()
    this.initCursor()
    for (const [index, screen] of this.screens.entries()) {
      this.parseScreen(index, screen)
    }
  }
}

export const fromScreens =
async (
  screens: ScreenBuffer[],
  output: string,
  overwrite: boolean = false): Promise<void> => {
  if (!screens) { return }
  // const screen = screens[screens.length - 1]
  const dataBuilder = new DataBuilder(screens)
  dataBuilder.init()
  const template = await templatePromise
  const data = template(dataBuilder)
  await writeFile(output, data, {
    flag: overwrite ? 'w' : 'wx'
  })
  console.log(
    c.blue('· output:'),
    c.white(output))
}
