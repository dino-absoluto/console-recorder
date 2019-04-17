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
import * as path from 'path'
import record from './record'
import { parser } from '..'

export const command = 'record <output>'
export const aliases = [ 'rec' ]
export const describe = 'Record TTY session'
export const builder = (yargs: typeof parser): typeof parser => {
  return yargs.strict(true)
    .check((argv): boolean => {
      if (argv._.length > 1) {
        const err = new Error('too many output file')
        err.name = 'Check'
        throw err
      }
      return true
    })
}

type Argv = typeof parser.argv

interface Options extends Argv {
  output?: string
}

export const handler = (argv: Options): void => {
  console.log(argv)
}
