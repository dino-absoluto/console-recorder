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
  ColorRGB,
  ColorPalette,
  ANSIColors
} from './color-data'

/* code */
const palette: ColorPalette = [
  { type: 'rgb', r: 0, g: 0, b: 0 },
  { type: 'rgb', r: 205, g: 0, b: 0 },
  { type: 'rgb', r: 0, g: 205, b: 0 },
  { type: 'rgb', r: 205, g: 205, b: 0 },
  { type: 'rgb', r: 0, g: 0, b: 238 },
  { type: 'rgb', r: 205, g: 0, b: 205 },
  { type: 'rgb', r: 0, g: 205, b: 205 },
  { type: 'rgb', r: 229, g: 229, b: 229 },

  { type: 'rgb', r: 127, g: 127, b: 127 },
  { type: 'rgb', r: 255, g: 0, b: 0 },
  { type: 'rgb', r: 0, g: 255, b: 0 },
  { type: 'rgb', r: 255, g: 255, b: 0 },
  { type: 'rgb', r: 92, g: 92, b: 255 },
  { type: 'rgb', r: 255, g: 0, b: 255 },
  { type: 'rgb', r: 0, g: 255, b: 255 },
  { type: 'rgb', r: 255, g: 255, b: 255 }
]

export default palette

palette[ANSIColors.background] = palette[ANSIColors.black]
palette[ANSIColors.foreground] = palette[ANSIColors.brightWhite]

{
  const values = [ 0, 95, 135, 175, 215, 255 ]
  for (let r = 0; r < 6; ++r) {
    for (let g = 0; g < 6; ++g) {
      for (let b = 0; b < 6; ++b) {
        const hex: ColorRGB = {
          type: 'rgb',
          r: values[r],
          g: values[g],
          b: values[b]
        }
        palette.push(hex)
      }
    }
  }
}

for (let i = 0; i < 24; ++i) {
  const v = 8 + i * 10
  const hex: ColorRGB = {
    type: 'rgb',
    r: v,
    g: v,
    b: v
  }
  palette.push(hex)
}
