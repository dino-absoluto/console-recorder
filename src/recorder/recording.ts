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
import { readFile, writeFile } from '../utils/pfs'

/* code */
export interface RecordEvent {
  time: number
  text: string
}

const delay = (period: number): Promise<void> => {
  return new Promise((resolve): void => { setTimeout(resolve, period) })
}

const elapseTimer = (): () => number => {
  const startTime = Date.now()
  return (): number => Date.now() - startTime
}

export class Recording {
  public columns: number = process.stdout.columns || 80
  public rows: number = process.stdout.rows || 25
  public events: RecordEvent[] = []
  protected playing: Promise<void> | undefined
  public constructor (events?: RecordEvent[], columns?: number, rows?: number) {
    if (events) {
      this.events = events
    }
    if (columns) {
      this.columns = columns
    }
    if (rows) {
      this.rows = rows
    }
  }

  public static async fromFile (fpath: string): Promise<Recording | undefined> {
    const THRESHOLD = 2
    const data = JSON.parse((await readFile(fpath)).toString())
    if (data && Array.isArray(data.events)) {
      let events: RecordEvent[] = data.events
      events = events.reduce((acc, e): RecordEvent[] => {
        const last = acc[acc.length - 1]
        if (last && Math.abs(last.time - e.time) < THRESHOLD) {
          last.text += e.text
        } else {
          acc.push(e)
        }
        return acc
      }, [] as RecordEvent[])
      return new Recording(events, data.columns, data.rows)
    }
  }

  public static async record (
    stream: NodeJS.ReadableStream
    , columns?: number
    , rows?: number): Promise<Recording> {
    const events: RecordEvent[] = []
    const timer = elapseTimer()
    const promise = new Promise<Recording>((resolve, reject): void => {
      stream.on('error', reject)
      stream.on('end', (): void => {
        resolve(new Recording(events, columns, rows))
      })
    })
    stream.on('data', (chunk): void => {
      events.push({
        time: timer(),
        text: chunk.toString()
      })
    })
    return promise
  }

  public async save (fpath: string): Promise<void> {
    await writeFile(fpath, JSON.stringify(this, null, 1))
  }

  public async replay (stream: NodeJS.WritableStream): Promise<void> {
    const timer = elapseTimer()
    const play = async (): Promise<void> => {
      for (const e of this.events) {
        const elapsed = timer()
        const period = e.time - elapsed
        if (this.playing === undefined) {
          throw new Error('canceled')
        }
        if (period <= 0) {
          stream.write(e.text)
        } else {
          await delay(period)
          stream.write(e.text)
        }
      }
    }
    this.playing = new Promise<void>((resolve, reject): void => {
      setImmediate((): void => {
        play().then(resolve, reject)
      })
    })
    return this.playing
  }

  public async stop (): Promise<void> {
    const p = this.playing
    this.playing = undefined
    return p
  }
}