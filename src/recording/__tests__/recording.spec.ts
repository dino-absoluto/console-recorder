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
/* eslint-env jest */
/* imports */
import { Recording, RecordEvent } from '../recording'
import { Writable, PassThrough } from 'stream'
import { delay } from '../../utils/time'
import * as path from 'path'
import makeDir = require('make-dir')

class TestStream extends Writable {
  public data = ''
  public _write (chunk: Buffer, encoding: string, callback: () => void): void {
    void (encoding)
    this.data += chunk.toString()
    callback()
  }
}

describe('Recording', (): void => {
  test('constructor.1', (): void => {
    const { stdout } = process
    const rec = new Recording()
    expect(rec).toMatchObject({
      columns: stdout.columns || 80,
      rows: stdout.rows || 24,
      events: []
    })
  })
  test('save/load', async (): Promise<void> => {
    const events: RecordEvent[] = [
      { time: 0, text: 'Hello' },
      { time: 100, text: ' World!' }
    ]
    const rec = new Recording(events, 80, 24)
    expect(rec).toMatchObject({
      columns: 80,
      rows: 24,
      events
    })
    const fname = '__tmp__/Recording/test.json'
    await makeDir(path.dirname(fname))
    await rec.save(fname)
    const rec2 = await Recording.fromFile(fname)
    expect(rec2).toMatchObject(rec)
  })
  test('normalize', async (): Promise<void> => {
    const events: RecordEvent[] = [
      { time: 25, text: 'Hello' },
      { time: 110, text: ' World!' },
      { time: 170, text: ' World!' }
    ]
    const rec = new Recording(events)
    expect(rec.events).toMatchObject(events)
    rec.normalize(100)
    const eventsNormalized: RecordEvent[] = [
      { time: 0, text: 'Hello' },
      { time: 100, text: ' World!' },
      { time: 200, text: ' World!' }
    ]
    expect(rec.events).toMatchObject(eventsNormalized)
    const rec2 = new Recording()
    rec.normalize()
    rec2.normalize()
  })
  test('playSpeed', (): void => {
    const rec = new Recording()
    expect(rec.playSpeed).toBeCloseTo(1.25, 2)
    rec.playSpeed = 0.1
    expect(rec.playSpeed).toBeCloseTo(0.1, 2)
    rec.playSpeed = 0.05
    expect(rec.playSpeed).toBeCloseTo(1.25, 2)
  })
  test('simple recording', async (): Promise<void> => {
    const events: RecordEvent[] = [
      {
        time: expect.toBeWithin(0, 20),
        text: 'Hello'
      },
      {
        time: expect.toBeWithin(100, 120),
        text: ' World!'
      }
    ]
    const stream = new PassThrough()
    const pRec = Recording.record(stream, 80, 24)
    stream.write('Hello')
    await delay(100)
    stream.end(' World!')
    const rec = await pRec
    expect(rec.events).toMatchObject(events)
  })
  test('simple playback', async (): Promise<void> => {
    const events: RecordEvent[] = [
      { time: 0, text: 'Hello' },
      { time: 100, text: ' World!' }
    ]
    const rec = new Recording(events, 80, 24)
    expect(rec).toMatchObject({
      columns: 80,
      rows: 24,
      events
    })
    const stream = new TestStream()
    await rec.replay(stream)
    expect(stream.data).toBe('Hello World!')
  })
  test('stop playback', async (): Promise<void> => {
    const events: RecordEvent[] = [
      { time: 0, text: 'Hello' },
      { time: 100, text: ' World!' }
    ]
    const rec = new Recording(events, 80, 24)
    expect(rec).toMatchObject({
      columns: 80,
      rows: 24,
      events
    })
    const stream = new TestStream()
    expect(rec.replay(stream)).rejects.toThrow('canceled')
    await expect(rec.stop()).rejects.toThrow('canceled')
    expect(stream.data).not.toBe('Hello World!')
  })
})
