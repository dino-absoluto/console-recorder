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
import { EventEmitter } from 'events'
import { replay } from '../replay'
import pick = require('lodash/pick')

class TestStream extends Writable {
  public data = ''
  public _write (chunk: Buffer, encoding: string, callback: () => void): void {
    void (encoding)
    this.data += chunk.toString()
    callback()
  }
}

const immediate = promisify(setImmediate)

/* code */
describe('replay', () => {
  const { stdin, stdout } = process
  const savedStdinState = pick(stdout, 'setRawMode')
  const savedStdoutState = pick(stdout, 'columns', 'rows')
  beforeEach(() => {
    stdin.setRawMode = undefined
    stdout.columns = undefined
    stdout.rows = undefined
  })
  afterAll(() => {
    Object.assign(stdin, savedStdinState)
    Object.assign(stdout, savedStdoutState)
  })
  test('simple', async () => {
    jest.useFakeTimers()
    const stream = new TestStream()
    const logStream = new TestStream()
    const oldConsole = global.console
    global.console = new Console(logStream)
    jest.spyOn(stdout, 'write').mockImplementation(
      stream.write.bind(stream) as typeof stdout.write)
    jest.spyOn(stdout, 'end').mockImplementation(
      stream.end.bind(stream) as typeof stdout.end)
    const promise = replay(path.join(__dirname, 'fixtures/simple.json'), {
      speed: 10
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
  test('fake state', async () => {
    jest.useFakeTimers()
    stdin.setRawMode = jest.fn()
    stdout.columns = 40
    stdout.rows = 24
    const stream = new TestStream()
    const logStream = new TestStream()
    const oldConsole = global.console
    global.console = new Console(logStream)
    jest.spyOn(stdout, 'write').mockImplementation(
      stream.write.bind(stream) as typeof stdout.write)
    jest.spyOn(stdout, 'end').mockImplementation(
      stream.end.bind(stream) as typeof stdout.end)
    const promise = replay(path.join(__dirname, 'fixtures/simple.json'), {
      speed: 10
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
    expect(stdin.setRawMode).toBeCalledTimes(2)
  })
  test('fake state 2', async () => {
    jest.useFakeTimers()
    stdin.setRawMode = jest.fn()
    stdout.columns = 80
    stdout.rows = 24
    const stream = new TestStream()
    const logStream = new TestStream()
    const oldConsole = global.console
    global.console = new Console(logStream)
    jest.spyOn(stdout, 'write').mockImplementation(
      stream.write.bind(stream) as typeof stdout.write)
    jest.spyOn(stdout, 'end').mockImplementation(
      stream.end.bind(stream) as typeof stdout.end)
    const promise = replay(path.join(__dirname, 'fixtures/simple.json'))
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
    expect(stdin.setRawMode).toBeCalledTimes(2)
  })
  test('cancel', async () => {
    jest.useFakeTimers()
    stdin.setRawMode = jest.fn()
    const events = new EventEmitter()
    const stream = new TestStream()
    const logStream = new TestStream()
    const oldConsole = global.console
    global.console = new Console(logStream)
    jest.spyOn(stdout, 'write').mockImplementation(
      stream.write.bind(stream) as typeof stdout.write)
    jest.spyOn(stdout, 'end').mockImplementation(
      stream.end.bind(stream) as typeof stdout.end)
    jest.spyOn(stdin, 'on').mockImplementation(
      events.on.bind(events) as typeof stdin.on)
    const promise = replay(path.join(__dirname, 'fixtures/simple.json'), {
      step: 200
    })
    let pDone = false
    let done = () => pDone
    promise.then(() => (pDone = true))
    await Promise.race([promise, (async () => {
      while (!done() && stream.data.length < 50) {
        jest.runAllTimers()
        await immediate()
      }
      expect(done()).toBe(false)
      events.emit('keypress', undefined, { ctrl: true, name: 'c' })
      while (!done()) {
        jest.runAllTimers()
        await immediate()
      }
    })()])
    global.console = oldConsole
    expect(stream.data).toMatchSnapshot()
    expect(logStream.data).toMatchSnapshot()
    expect(stdin.setRawMode).toBeCalledTimes(2)
  })
  test('error', async () => {
    jest.useFakeTimers()
    stdin.setRawMode = jest.fn()
    const events = new EventEmitter()
    const stream = new TestStream()
    const logStream = new TestStream()
    const oldConsole = global.console
    global.console = new Console(logStream)
    jest.spyOn(stdout, 'write').mockImplementation(
      stream.write.bind(stream) as typeof stdout.write)
    jest.spyOn(stdout, 'end').mockImplementation(
      stream.end.bind(stream) as typeof stdout.end)
    jest.spyOn(stdin, 'on').mockImplementation(
      events.on.bind(events) as typeof stdin.on)
    const promise = replay(path.join(__dirname, 'fixtures/simple.json'), {
      speed: 10
    })
    let pDone = false
    let done = () => pDone
    promise.then(() => (pDone = true))
    await Promise.race([promise, (async () => {
      while (!done() && stream.data.length < 50) {
        jest.runAllTimers()
        await immediate()
      }
      expect(done()).toBe(false)
      stream.destroy()
      while (!done()) {
        jest.runAllTimers()
        await immediate()
      }
    })()])
    global.console = oldConsole
    expect(stream.data).toMatchSnapshot()
    expect(logStream.data).toMatchSnapshot()
    expect(stdin.setRawMode).toBeCalledTimes(2)
  })
  test('error.ENOENT', async () => {
    const promise = replay(path.join(__dirname, 'fixtures/non-existent.json'))
    expect(promise).rejects.toThrow('ENOENT')
  })
})
