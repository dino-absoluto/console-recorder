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

/* code */
export const eventOnce =
async <T extends unknown[]>(emitter: EventEmitter, event: string | symbol): Promise<T> => {
  return new Promise<T>((resolve, reject): void => {
    let handleError: (err: Error) => void
    const handleSucceed = (...args: unknown[]): void => {
      emitter.off('error', handleError)
      resolve(args as T)
    }
    handleError = (error: Error): void => {
      emitter.off(event, handleSucceed)
      reject(error)
    }
    emitter.once('error', handleError)
    emitter.once(event, handleSucceed)
  })
}
