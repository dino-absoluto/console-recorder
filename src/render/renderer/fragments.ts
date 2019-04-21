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
import { Palette } from '../interpreter/color'

interface Container {
  palette: Palette
}

interface Period {
  begin: number
  end: number
}

interface RectOptions {
  frames: Period[]
  x: number
  y: number
  width: number
  height: number
}

export interface Rect {
  id: string
  col: number
  row: number
  span: number
  fill: ScreenColor
  options?: RectOptions
}

const makeRectId = (rect: Rect): string => {
  return JSON.stringify([ rect.col, rect.row, rect.span, rect.fill ])
}

export const toBackgrounds =
(screen: ScreenBuffer, container: Container): Rect[] => {
  const defaultBackground = new ScreenColor(screen.defaultBackground.color, container)
  let lastBg = defaultBackground
  let lastRect: Rect | undefined
  const rects: Rect[] = []
  screen.buffer.forEach((line, row): void => {
    lastRect = undefined
    if (!line) { return undefined }
    for (const [col, block] of line.entries()) {
      if (!block) {
        lastBg = defaultBackground
        continue
      }
      if (!block.bg.isEqual(lastBg)) {
        lastBg = block.bg != null
          ? new ScreenColor(block.bg.color, container)
          : defaultBackground
        if (!lastBg.isValid && !lastBg.isForeground) {
          lastRect = undefined
        } else {
          lastRect = {
            id: '',
            col,
            row,
            span: 1,
            fill: new ScreenColor(lastBg.color, container)
          }
          lastRect.id = makeRectId(lastRect)
          rects.push(lastRect)
        }
        continue
      }
      if (lastRect) {
        lastRect.span++
        lastRect.id = makeRectId(lastRect)
      }
    }
  })
  return rects
}

interface TextOptions {
  frames: Period[]
  x: number
  y: number
  width: number
  height: number
}

export interface Text {
  id: string
  col: number
  row: number
  span: number
  fill: ScreenColor
  text: string
  options?: TextOptions
}

const makeTextId = (text: Text): string => {
  return JSON.stringify([ text.col, text.row, text.span, text.fill, text.text ])
}

export const toFragments =
(screen: ScreenBuffer, container: Container): Text[] => {
  const defaultForeground = new ScreenColor(screen.defaultForeground.color, container)
  let lastFg = defaultForeground
  let lastText: Text | undefined
  const texts: Text[] = []
  screen.buffer.forEach((line, row): void => {
    lastText = undefined
    if (!line) { return undefined }
    for (const [col, block] of line.entries()) {
      if (!block) {
        lastFg = defaultForeground
        continue
      }
      if (!block.fg.isEqual(lastFg) || !lastText) {
        lastFg = block.fg != null
          ? new ScreenColor(block.fg.color, container)
          : defaultForeground
        lastText = {
          id: '',
          col,
          row,
          span: 1,
          fill: new ScreenColor(lastFg.color, container),
          text: block.ch
        }
        lastText.id = makeTextId(lastText)
        texts.push(lastText)
        continue
      }
      if (lastText) {
        lastText.span++
        lastText.text += block.ch
        lastText.id = makeTextId(lastText)
      }
    }
  })
  return texts
}
