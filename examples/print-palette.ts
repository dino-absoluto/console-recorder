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
export const { stdout } = process
const RESET = '\x1b[0m'

const color = (code: number, background: boolean = false) => {
  if (code < 0) {
    return ''
  }
  if (background) {
    return `\x1b[48;5;${code}m`
  } else {
    return `\x1b[38;5;${code}m`
  }
}

let lines: string[] = []
{
  lines.push('---STANDARD COLORS---')
  let line = color(15)
  for (let i = 0; i < 16; ++i) {
    const text = (i % 8).toString().padEnd(5, ' ').padStart(9, ' ')
    if (i === 8) {
      line += RESET + '\n'
    }
    line += color(i, true) + text
  }
  lines.push(line + RESET)
}
{
  lines.push('---216 COLORS---')
  let line = ''
  for (let i = 0; i < 216; ++i) {
    line += color(i + 16, true) + '  '
    if (i > 0 && (i + 1) % 36 === 0) {
      line += RESET + '\n'
    }
  }
  lines.push(line)
}
{
  lines.push('---GRAYSCALE---')
  let line = ''
  for (let i = 0; i < 24; ++i) {
    line += color(i + 232, true) + '   '
  }
  line += RESET + '\n'
  lines.push(line)
}

lines.push('---END---\x1b[0m')

console.log(lines.join('\n').replace(/\n+/g, '\n'))
