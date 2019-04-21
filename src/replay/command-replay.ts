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
import { accessSync, constants } from 'fs'
import { parser } from '../cli'
import { failedCheck } from '../utils/fail'

export const command = 'replay <input>'
export const aliases = [ 'play' ]
export const describe = 'Replay TTY session'
export const builder =
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(yargs: typeof parser) =>
  yargs.strict(true)
    .option('playSpeed', {
      type: 'number',
      alias: [ 'speed' ],
      desc: 'Playing speed multiplier',
      default: 1.0,
      coerce: (n: number): number => {
        return n > 0.1 ? n : 1.0
      }
    })
    .option('normalize', {
      type: 'number',
      desc: 'Normalize events at steps of {number}ms'
    })
    .option('typingSpeed', {
      type: 'number',
      desc: 'Multiply typing speed by {number}',
      implies: 'normalize'
    })
    .option('maxDelay', {
      type: 'number',
      desc: 'Maximum delay between events, calculated before playSpeed',
      implies: 'normalize'
    })
    .positional('input', {
      type: 'string',
      desc: 'A recorded TTY session'
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
        accessSync(input, constants.F_OK | constants.R_OK)
      } catch (err) {
        switch (err.code) {
          case 'ENOENT':
            throw failedCheck('input file does not exist')
          default:
            throw err
        }
      }
      return true
    })

type Options = ReturnType<typeof builder>['argv']

export const handler = async (argv: Options): Promise<void> => {
  const { replay } = await import('..')
  const input: string = argv.input as string
  await replay(input, {
    step: argv.normalize,
    speed: argv.playSpeed,
    typingSpeed: argv.typingSpeed,
    maxDelay: argv.maxDelay
  })
}
