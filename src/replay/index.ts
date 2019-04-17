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
import replay from './replay'
import { accessSync } from 'fs'
import { parser } from '..'
import { failedCheck } from '../utils/fail'

export const command = 'replay <input>'
export const aliases = [ 'play' ]
export const describe = 'Replay TTY session'
export const builder =
(yargs: typeof parser) => // eslint-disable-line @typescript-eslint/explicit-function-return-type
  yargs.strict(true)
    .positional('input', {
      desc: 'a recorded TTY session',
      type: 'string'
    })
    .demandOption('input')
    .check((argv): boolean => {
      if (argv._.length > 1) {
        throw failedCheck('too many output')
      }
      return true
    })
    .check((argv): boolean => {
      if (!argv.input || typeof argv.input !== 'string') {
        throw failedCheck('invalid input')
      }
      const input = argv.input
      try {
        accessSync(input)
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw failedCheck('input file does not exist')
        } else {
          throw err
        }
      }
      return true
    })

type Options = ReturnType<typeof builder>['argv']

export const handler = (argv: Options): void => {
  const input: string = argv.input as string
  replay(input)
}
