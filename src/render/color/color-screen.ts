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
  ColorData,
  ColorRGB,
  ColorIndexed,
  ANSIColors
} from './color-data'

/* code */

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${(r * 256 * 256 + g * 256 + b).toString(16).padStart(6, '0')}`
}

export class ScreenColor {
  public data: ColorData = {
    type: 'index',
    code: 0
  }

  public constructor (color: ColorData) {
    this.data = color
  }

  public get isValid (): boolean {
    const { data } = this
    return data.type === 'rgb' ||
      (data.type === 'index' && data.code >= 0 && data.code < 256)
  }

  public get isBackground (): boolean {
    const { data } = this
    return data.type === 'index' && data.code === ANSIColors.background
  }

  public get isForeground (): boolean {
    const { data } = this
    return data.type === 'index' && data.code === ANSIColors.foreground
  }

  public isEqual (target: Readonly<ScreenColor>): boolean {
    let { data: a } = this
    let { data: b } = target
    if (a.type !== b.type) {
      return false
    }
    if (a.type === 'index') {
      b = b as ColorIndexed
      return a.code === b.code
    }
    if (a.type === 'rgb') {
      b = b as ColorRGB
      return a.r === b.r &&
        a.g === b.g &&
        a.b === b.b
    }
    return false
  }

  public toANSI (background = false): string {
    const { data } = this
    if (data.type === 'index') {
      const { code } = data
      if (code < 0 || code > 255) {
        if (background) {
          return '\x1b[49m'
        } else {
          return '\x1b[39m'
        }
      }
      if (background) {
        return `\x1b[48;5;${code}m`
      } else {
        return `\x1b[38;5;${code}m`
      }
    } else if (data.type === 'rgb') {
      const { r, g, b } = data
      if (background) {
        return `\x1b[48;2;${r};${g};${b}m`
      } else {
        return `\x1b[38;2;${r};${g};${b}m`
      }
    }
    return ''
  }

  public toHex (palette?: ColorPalette): string {
    const { data } = this
    if (data.type === 'rgb') {
      const { r, g, b } = data
      return `#${(r * 256 * 256 + g * 256 + b).toString(16).padStart(6, '0')}`
    }
    if (data.type === 'index') {
      if (!palette) {
        return ''
      }
      const { r, g, b } = palette[data.code]
      return rgbToHex(r, g, b)
    }
    return ''
  }

  public toString (): string {
    return this.toHex()
  }

  public [Symbol.toPrimitive] (): string {
    return this.toString()
  }
}

export const defaultBackground: Readonly<ScreenColor> =
  new ScreenColor({ type: 'index', code: ANSIColors.background })
export const defaultForeground: Readonly<ScreenColor> =
  new ScreenColor({ type: 'index', code: ANSIColors.foreground })
