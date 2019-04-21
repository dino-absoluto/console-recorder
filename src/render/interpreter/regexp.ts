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
// import { Record } from '../recorder/record'
import ansiRegExOriginal = require('ansi-regex')

const specialsBefore: string[] = [
  '\\x1b\\[\\?\\d{0,4}\\$p',
  '\\x1b\\[>c'
]
const specialsAfter = [
  '[\\x00-\\x1f]'
]

export const exp = new RegExp(
  `(${
    specialsBefore.length ? specialsBefore.join('|') + '|' : ''
  }${
    ansiRegExOriginal().source
  }|${
    specialsAfter.join('|')
  })`, 'g')

export default exp
