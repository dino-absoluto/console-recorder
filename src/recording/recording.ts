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
import { delay, elapseTimer } from '../utils/time'
import { eventOnce } from '../utils/event-once'

/* code */
/** @public A recorded event */
export interface RecordEvent {
  time: number
  text: string
}

const THRESHOLD = 4

/** @public */
export interface RecordingData {
  columns: number
  rows: number
  events: RecordEvent[]
}

/** @public */
export interface Modifiers {
  speed?: number
  step?: number
  typingSpeed?: number
  typingPause?: number
  typingStep?: number
  maxDelay?: number
}

/** @public A recorded history */
export class Recording implements RecordingData {
  public columns: number = process.stdout.columns || 80
  public rows: number = process.stdout.rows || 24
  public events: RecordEvent[] = []
  /** @internal */
  private playing: Promise<void> | undefined
  /** @internal */
  public constructor (options: Partial<RecordingData> = {}) {
    if (options.events) {
      this.events = options.events
    }
    if (options.columns) {
      this.columns = options.columns
    }
    if (options.rows) {
      this.rows = options.rows
    }
  }

  public static async fromFile (fpath: string): Promise<Recording> {
    const data =
      JSON.parse((await readFile(fpath)).toString()) as Partial<RecordingData>
    if (typeof data === 'object' && Array.isArray(data.events)) {
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
      return new Recording({
        events,
        columns: data.columns,
        rows: data.rows
      })
    }
    throw new Error('failed to read from file')
  }

  public static async record (
    stream: NodeJS.ReadableStream
    , columns?: number
    , rows?: number): Promise<Recording> {
    const events: RecordEvent[] = []
    const timer = elapseTimer()
    const handleData = (chunk: Buffer): void => {
      events.push({
        time: timer(),
        text: chunk.toString()
      })
    }
    const promise = eventOnce(stream, 'end')
    stream.addListener('data', handleData)
    return promise
      .then((): Recording => new Recording({
        events, columns, rows
      }))
      .finally((): void => {
        stream.off('data', handleData)
      })
  }

  public normalize (options: Modifiers = {}): void {
    const { events } = this
    if (!(events.length > 0)) {
      return
    }
    {
      const step = options.step && options.step > 0
        ? options.typingStep
        : undefined
      const maxDelay = options.maxDelay && options.maxDelay > 0
        ? options.maxDelay
        : Number.MAX_SAFE_INTEGER
      let startTime = events[0].time
      let lastTime = startTime
      let corrected = 0
      const newEvents: RecordEvent[] = []
      let lastEvent: RecordEvent | undefined
      for (const e of events) {
        let delta = e.time - lastTime
        if (step) {
          delta = Math.round(delta / step) * step
        }
        delta = Math.min(delta, maxDelay)
        lastTime = e.time
        if (!lastEvent || delta > 0) {
          corrected += delta
          lastEvent = {
            time: corrected,
            text: e.text
          }
          newEvents.push(lastEvent)
        } else {
          lastEvent.text += e.text
        }
      }
      this.events = newEvents
    }
    {
      const { typingSpeed, typingStep } = options
      const step = typingStep && typingStep > 0
        ? typingStep
        : undefined
      const multiplier = typingSpeed && typingSpeed > 0
        ? (1 / typingSpeed)
        : 1
      const pause = options.typingPause && options.typingPause > 0
        ? options.typingPause
        : undefined
      let lastTime = 0
      let corrected = 0
      let lastKey = false
      for (const e of this.events) {
        let delta = e.time - lastTime
        lastTime = e.time
        if (lastKey) {
          delta *= multiplier
          if (step) {
            delta = Math.round(delta / step) * step
          }
          if (pause) {
            delta = Math.min(delta, pause)
          }
        }
        if (e.text.length === 1 || e.text === '\b\u001b[K') {
          lastKey = true
        } else {
          lastKey = false
        }
        corrected += delta
        e.time = corrected
      }
    }
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
