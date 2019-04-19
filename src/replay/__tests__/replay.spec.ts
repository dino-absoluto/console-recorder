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
import { Writable } from 'stream'
import { promisify } from 'util'
import { Console } from 'console'

class TestStream extends Writable {
  public data = ''
  public _write (chunk: Buffer, encoding: string, callback: () => void): void {
    void (encoding)
    this.data += chunk.toString()
    callback()
  }
}

/* code */
describe('replay', () => {
  test('simple', async () => {
    const immediate = promisify(setImmediate)
    jest.useFakeTimers()
    const { replay } = await import('../replay')
    const { stdout } = process
    const stream = new TestStream()
    const logStream = new TestStream()
    const oldConsole = global.console
    global.console = new Console(logStream)
    jest.spyOn(stdout, 'write').mockImplementation(
      stream.write.bind(stream) as typeof stdout.write)
    jest.spyOn(stdout, 'end').mockImplementation(
      stream.end.bind(stream) as typeof stdout.end)
    const promise = replay(path.join(__dirname, 'fixtures/simple.json'), {
      playSpeed: 10
    })
    let pDone = false
    let done = () => pDone
    promise.then(() => (pDone = true))
    await Promise.race([promise, (async () => {
      while (!done()) {
        jest.runAllTimers()
        await immediate()
      }
    })()])
    global.console = oldConsole
    expect(stream.data).toMatchSnapshot()
    expect(logStream.data).toMatchSnapshot()
  })
})
