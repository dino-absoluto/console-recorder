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
import { Record } from './record'
import * as path from 'path'
import * as readLine from 'readline'
import makeDir = require('make-dir')

const recordFile = path.join(__dirname, '/../__tmp__/_record.json')

if (process.argv.indexOf('--play') >= 0) {
  Record.fromFile(recordFile).then(async (record): Promise<void> => {
    if (record == null) {
      return
    }
    const { stdin, stdout } = process
    if (stdin.setRawMode) {
      stdin.setRawMode(true)
      readLine.emitKeypressEvents(stdin)
    }
    stdin.on('keypress', (_, key): void => {
      if (key && key.ctrl && key.name === 'c') {
        console.log('^C')
        process.exit()
      }
    })
    await record.play(stdout)
    process.exit(0)
  })
} else {
  const stream = spawnShell()
  Record.record(stream,
    stream.columns,
    stream.rows).then(async (record): Promise<void> => {
    if (!(record.events.length > 0)) {
      return
    }
    await makeDir(path.dirname(recordFile))
    await record.save(recordFile)
  })
}
