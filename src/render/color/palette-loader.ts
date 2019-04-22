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
import {
  ColorPalette,
  ColorRGB,
  ANSIColors
} from './color-data'
import { readFile } from '../../utils/pfs'
import standard from './palette-standard'

interface ColorPaletteData {
  light?: boolean
  colors?: string[]
}

export const parseColor = (text: string): ColorRGB | undefined => {
  if (/#[0-9a-fA-F]{6}$/.test(text)) {
    text = text.substr(1)
    const r = parseInt(text.substr(0, 2), 16)
    const g = parseInt(text.substr(2, 2), 16)
    const b = parseInt(text.substr(4, 2), 16)
    return {
      type: 'rgb',
      r,
      g,
      b
    }
  }
  return undefined
}

/* code */
const loadPalette = async (fname: string): Promise<ColorPalette> => {
  const palette = Array.from(standard)
  const data: ColorPaletteData = JSON.parse((await readFile(fname)).toString())
  palette[ANSIColors.background] = palette[ANSIColors.black]
  palette[ANSIColors.foreground] = palette[ANSIColors.white]
  if (typeof data === 'object') {
    if (data.colors) {
      data.colors.forEach((text, index): void => {
        const color = parseColor(text)
        if (color) {
          palette[index] = color
        }
      })
    }
    if (data.light) {
      palette[ANSIColors.background] = palette[ANSIColors.white]
      palette[ANSIColors.foreground] = palette[ANSIColors.black]
    } else {
      palette[ANSIColors.background] = palette[ANSIColors.black]
      palette[ANSIColors.foreground] = palette[ANSIColors.white]
    }
  }
  return palette
}
export default loadPalette
