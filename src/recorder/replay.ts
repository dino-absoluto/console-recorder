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
import { Recording } from './recording'
import { startMessage, endMessage } from './messages'
import * as readLine from 'readline'
import chalk from 'chalk'

export const replay = (fname: string): void => {
  Recording.fromFile(fname).then(async (record): Promise<void> => {
    if (record == null) {
      return
    }
    const { stdin, stdout } = process
    const columns = stdout.columns || 40
    const rows = stdout.rows || 24
    if (record.columns !== columns || record.rows !== rows) {
      console.log(chalk.yellow(chalk.bold('WARNING:'), 'replaying at different console size.'))
      console.log(chalk.yellow(`The recording was made at ${
        record.columns}x${record.rows}.`))
    }
    startMessage(chalk.blue('REPLAY STARTED'))
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
      console.log()
      endMessage(chalk.blue('REPLAY ENDED'))
    }).catch((err): void => {
      process.stdout.write('\x1b[0m\x1b[?25h\x1b[?1049l\x1b[?2004l')
      console.log()
      if (err.message.indexOf('canceled') >= 0) {
        endMessage(chalk.yellow('REPLAY CANCELED'))
      } else {
        endMessage(chalk.red('REPLAY ERRORED'))
        console.error(chalk.red(err))
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
