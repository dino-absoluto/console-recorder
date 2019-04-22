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
/* code */
export const enum ANSIColors {
  background = -1,
  foreground = -2
  , black = 0
  , red = 1
  , green = 2
  , yellow = 3
  , blue = 4
  , magenta = 5
  , cyan = 6
  , white = 7
  , brightBlack = 8
  , brightRed = 9
  , brightGreen = 10
  , brightYellow = 11
  , brightBlue = 12
  , brightMagenta = 13
  , brightCyan = 14
  , brightWhite = 15
}

export interface ColorIndexed {
  type: 'index'
  code: number
}

export interface ColorRGB {
  type: 'rgb'
  r: number
  g: number
  b: number
}

export type ColorData = ColorIndexed | ColorRGB
export type ColorPalette = ColorRGB[]
