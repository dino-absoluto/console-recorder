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
import record from './record'
import { accessSync } from 'fs'
import { parser } from '..'
import { failedCheck } from '../utils/fail'

export const command = 'record <output>'
export const aliases = [ 'rec' ]
export const describe = 'Record TTY session'
export const builder =
(yargs: typeof parser) => // eslint-disable-line @typescript-eslint/explicit-function-return-type
  yargs.strict(true)
    .option('overwrite', {
      type: 'boolean',
      default: false,
      desc: 'Overwrite existing file'
    })
    .check((argv): boolean => {
      if (argv._.length > 1) {
        throw failedCheck('too many output')
      }
      return true
    })
    .check((argv): boolean => {
      if (!argv.output || typeof argv.output !== 'string') {
        throw failedCheck('invalid input')
      }
      const output = argv.output
      if (argv.overwrite) {
        return true
      }
      try {
        accessSync(output)
        throw failedCheck(`file existed "${argv.output}"`)
      } catch (err) {
        if (err.code === 'ENOENT') {
          return true
        } else {
          throw err
        }
      }
    })

type Argv = ReturnType<typeof builder>['argv']

interface Options extends Argv {
  output?: string
}

export const handler = (argv: Options): void => {
  const output: string = argv.output as string
  record(output)
}
