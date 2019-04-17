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
import * as readLine from 'readline'
import chalk from 'chalk'

export const replay = (fname: string): void => {
  Recording.fromFile(fname).then(async (record): Promise<void> => {
    if (record == null) {
      return
    }
    const { stdin, stdout } = process
    console.log(chalk.blue('---REPLAY STARTED---'))
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
      console.log(chalk.red('---REPLAY ENDED---'))
    }).catch((err): void => {
      if (err.message.indexOf('canceled') >= 0) {
        console.log(chalk.red('---REPLAY CANCELED---'))
      } else {
        console.log(chalk.red('---REPLAY ERRORED---'))
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
