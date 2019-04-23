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
import { EventEmitter } from 'events'
import { eventOnce } from '../event-once'

/* code */
describe('eventOnce', () => {
  test('simple', async () => {
    const emitter = new EventEmitter()
    const p = eventOnce(emitter, 'ok')
    expect(emitter.listenerCount('ok')).toBe(1)
    expect(emitter.listenerCount('error')).toBe(1)
    await Promise.all([p, (async () => {
      emitter.emit('ok')
    })()])
    expect(emitter.listenerCount('ok')).toBe(0)
    expect(emitter.listenerCount('error')).toBe(0)
  })
  test('simple error', async () => {
    const emitter = new EventEmitter()
    const p = eventOnce(emitter, 'ok')
    expect(emitter.listenerCount('ok')).toBe(1)
    expect(emitter.listenerCount('error')).toBe(1)
    await expect(Promise.all([p, (async () => {
      emitter.emit('error', new Error('test error'))
    })()])).rejects.toThrow('test error')
    expect(emitter.listenerCount('ok')).toBe(0)
    expect(emitter.listenerCount('error')).toBe(0)
  })
})
