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
  ANSIColors
} from '../interpreter/color'
import { palette8Bit } from '../interpreter/palette-8bit'

/* code */
const palette = Array.from(palette8Bit)
export default palette
;([
  { type: 'rgb', r: 0x1c, g: 0x20, b: 0x25 },
  { type: 'rgb', r: 0xd5, g: 0x6e, b: 0x88 },
  { type: 'rgb', r: 0x61, g: 0x99, b: 0x32 },
  { type: 'rgb', r: 0xaa, g: 0x82, b: 0x43 },
  { type: 'rgb', r: 0x53, g: 0x90, b: 0xba },
  { type: 'rgb', r: 0xd1, g: 0x6a, b: 0xc0 },
  { type: 'rgb', r: 0x36, g: 0x9d, b: 0x91 },
  { type: 'rgb', r: 0xca, g: 0xc5, b: 0xc0 },

  { type: 'rgb', r: 0x2d, g: 0x34, b: 0x3a },
  { type: 'rgb', r: 0xdc, g: 0x85, b: 0x9b },
  { type: 'rgb', r: 0x7a, g: 0xa9, b: 0x53 },
  { type: 'rgb', r: 0xb7, g: 0x96, b: 0x60 },
  { type: 'rgb', r: 0x6f, g: 0xa1, b: 0xc5 },
  { type: 'rgb', r: 0xd8, g: 0x81, b: 0xca },
  { type: 'rgb', r: 0x55, g: 0xac, b: 0xa2 },
  { type: 'rgb', r: 0xdc, g: 0xd8, b: 0xd5 }
] as ColorRGB[]).forEach((color, index): void => {
  palette[index] = color
})

palette[ANSIColors.background] = palette8Bit[ANSIColors.black]
palette[ANSIColors.foreground] = palette8Bit[ANSIColors.white]
