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
import { spawnShell } from './shell'
import { startMessage, endMessage } from '../utils/messages'
import { Recording } from '../recording'
import * as path from 'path'
import chalk from 'chalk'
import makeDir = require('make-dir')

export const record = (fname: string): void => {
  startMessage(chalk.blue('RECORDING STARTED'))
  const stream = spawnShell()
  Recording.record(
    stream,
    stream.columns,
    stream.rows).then(async (record): Promise<void> => {
    if (!(record.events.length > 0)) {
      return
    }
    await makeDir(path.dirname(fname))
    await record.save(fname)
    console.log()
    endMessage(chalk.blue('RECORDING ENDED'))
  })
}

export default record
