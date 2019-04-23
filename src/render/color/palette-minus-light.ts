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
} from './color-data'
import standard from './palette-standard'

/* code */
const palette = Array.from(standard)
export default palette
;([
  { type: 'rgb', r: 0x35, g: 0x41, b: 0x4d },
  { type: 'rgb', r: 0xbe, g: 0x45, b: 0x63 },
  { type: 'rgb', r: 0x35, g: 0x78, b: 0x00 },
  { type: 'rgb', r: 0x96, g: 0x58, b: 0x1d },
  { type: 'rgb', r: 0x26, g: 0x6c, b: 0x9f },
  { type: 'rgb', r: 0xb9, g: 0x40, b: 0xa5 },
  { type: 'rgb', r: 0x03, g: 0x7c, b: 0x6e },
  { type: 'rgb', r: 0xd8, g: 0xd0, b: 0xc7 },

  { type: 'rgb', r: 0x46, g: 0x55, b: 0x65 },
  { type: 'rgb', r: 0xe4, g: 0x53, b: 0x77 },
  { type: 'rgb', r: 0x40, g: 0x8f, b: 0x00 },
  { type: 'rgb', r: 0xb4, g: 0x69, b: 0x23 },
  { type: 'rgb', r: 0x2d, g: 0x82, b: 0xbe },
  { type: 'rgb', r: 0xdd, g: 0x4c, b: 0xc5 },
  { type: 'rgb', r: 0x03, g: 0x94, b: 0x83 },
  { type: 'rgb', r: 0xe9, g: 0xe4, b: 0xde }
] as ColorRGB[]).forEach((color, index): void => {
  palette[index] = color
})

palette[ANSIColors.background] = palette[ANSIColors.brightWhite]
palette[ANSIColors.foreground] = palette[ANSIColors.black]
