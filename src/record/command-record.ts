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
import { accessSync } from 'fs'
import { parser } from '../cli'
import { failedCheck } from '../utils/fail'

export const command = 'record <output>'
export const aliases = [ 'rec' ]
export const describe = 'Record a terminal session'
export const builder =
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(yargs: typeof parser) =>
  yargs.strict(true)
    .positional('output', {
      desc: 'File to save TTY session to',
      type: 'string'
    })
    .demandOption('output')
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
      if (!argv.output) {
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

type Options = ReturnType<typeof builder>['argv']

export const handler = async (argv: Options): Promise<void> => {
  const { record } = await import('..')
  const { output } = argv
  await record(output)
}
