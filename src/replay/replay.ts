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
  Recording,
  Modifiers } from '../recording'
import { startMessage, endMessage } from '../utils/messages'
import * as readLine from 'readline'
import * as kleur from 'kleur'

/** @public Describe options for replay() */
export type ReplayOptions = Modifiers

/** @public Start replaying */
export async function replay (fname: string, options: ReplayOptions = {}): Promise<void> {
  return Recording.fromFile(fname).then(async (record): Promise<void> => {
    record.normalize(options)
    const { stdin, stdout } = process
    const columns = stdout.columns
    const rows = stdout.rows
    if (!columns || !rows) {
      console.log(kleur.yellow(kleur.bold('WARNING:') +
        ' console size is indeterminable.'))
    } else if (record.columns !== columns || record.rows !== rows) {
      console.log(kleur.yellow(kleur.bold('WARNING:') +
        ' replaying at different console size.'))
      console.log(kleur.yellow(`Now: ${columns}x${rows}. The recording was made at ${
        record.columns}x${record.rows}.`))
    }
    startMessage(kleur.blue('REPLAY STARTED'))
    if (stdin.setRawMode) {
      stdin.setRawMode(true)
      readLine.emitKeypressEvents(stdin)
    }
    const handleKeypress = (_: unknown,
      key: {
        ctrl: boolean
        name: string
      }): void => {
      if (key && key.ctrl && key.name === 'c') {
        record.stop().catch((): void => {
          console.log('^C')
        })
      }
    }
    stdin.on('keypress', handleKeypress)
    await record.replay(stdout).then((): void => {
      stdout.write('\n')
      endMessage(kleur.blue('REPLAY ENDED'))
    }).catch((err): void => {
      try {
        process.stdout.write('\x1b[0m\x1b[?25h\x1b[?1049h\x1b[?1049l\n')
      } catch {
      }
      if (err.message.indexOf('canceled') >= 0) {
        endMessage(kleur.yellow('REPLAY CANCELED'))
      } else {
        endMessage(kleur.red('REPLAY ERRORED'))
        console.error(kleur.red(err))
      }
    }).finally((): void => {
      stdin.off('keypress', handleKeypress)
      if (stdin.setRawMode) {
        stdin.setRawMode(false)
        stdin.pause()
      }
    })
  })
}

export default replay
