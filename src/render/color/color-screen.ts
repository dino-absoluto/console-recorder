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
import { palette8Bit } from './palette-8bit'
import {
  Palette,
  TypedColor,
  ANSIColors,
  ColorRGB,
  ColorANSI
} from './color'

/* code */

interface PaletteContainer {
  palette: Palette
}

const defaultPalette: PaletteContainer = {
  palette: palette8Bit
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${(r * 256 * 256 + g * 256 + b).toString(16).padStart(6, '0')}`
}

export class ScreenColor {
  protected paletteContainer: PaletteContainer
  public color: TypedColor = {
    type: 'ansi',
    code: 0
  }

  public constructor (color: TypedColor, paletteContainer?: PaletteContainer) {
    this.color = color
    this.paletteContainer = paletteContainer || defaultPalette
    Object.defineProperty(this, 'paletteContainer', {
      enumerable: false
    })
  }

  public get isValid (): boolean {
    const { color } = this
    return color.type === 'rgb' ||
      (color.type === 'ansi' && color.code >= 0 && color.code < 256)
  }

  public get isBackground (): boolean {
    const { color } = this
    return color.type === 'ansi' && color.code === ANSIColors.background
  }

  public get isForeground (): boolean {
    const { color } = this
    return color.type === 'ansi' && color.code === ANSIColors.foreground
  }

  public isEqual (target: Readonly<ScreenColor>): boolean {
    let { color: a } = this
    let { color: b } = target
    if (a.type !== b.type) {
      return false
    }
    if (a.type === 'ansi') {
      b = b as ColorANSI
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
    const { color } = this
    if (color.type === 'ansi') {
      const { code } = color
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
    } else if (color.type === 'rgb') {
      const { r, g, b } = color
      if (background) {
        return `\x1b[48;2;${r};${g};${b}m`
      } else {
        return `\x1b[38;2;${r};${g};${b}m`
      }
    }
    return ''
  }

  public toHex (): string {
    const { color } = this
    if (color.type === 'rgb') {
      const { r, g, b } = color
      return `#${(r * 256 * 256 + g * 256 + b).toString(16).padStart(6, '0')}`
    }
    if (color.type === 'ansi') {
      const { r, g, b } = this.paletteContainer.palette[color.code]
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
  new ScreenColor({ type: 'ansi', code: ANSIColors.background })
export const defaultForeground: Readonly<ScreenColor> =
  new ScreenColor({ type: 'ansi', code: ANSIColors.foreground })
