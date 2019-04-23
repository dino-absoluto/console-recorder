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
import {
  Recording,
  Modifiers
} from '../../recording'
import {
  ScreenBuffer
} from './screen'
import * as c from 'kleur'

const timeExtension = 2000

interface InterpreterOptions extends Modifiers {
  maxRows?: number
}

export const fromFile = async (fpath: string, options: InterpreterOptions = {}): Promise<ScreenBuffer[] | undefined> => {
  console.log(
    c.blue('· input:'),
    c.white(fpath)
  )
  const rec = await Recording.fromFile(fpath)
  if (!rec) { return }
  const screen = new ScreenBuffer({
    columns: rec.columns,
    rows: rec.rows
  })
  {
    const lastEvent = rec.events[rec.events.length - 1]
    console.log(' ',
      c.yellow(rec.events.length), c.green('frames'))
    console.log(' ',
      c.yellow(
        Math.round(((lastEvent && lastEvent.time) || 0) / 100) / 10),
      c.green('seconds')
    )
  }
  rec.normalize(options)
  const throttle = 25
  const screens = []
  let lastScreen: ScreenBuffer | undefined
  const begin = (rec.events[0] && rec.events[0].time) || 0
  let lastTime = 0
  for (const e of rec.events) {
    screen.decode(e.text)
    const time = e.time - begin
    if (lastScreen && time - lastTime < throttle) {
      continue
    }
    lastTime = time
    screen.time = time
    screen.timeEnd = time + timeExtension
    if (lastScreen) {
      lastScreen.timeEnd = time
    }
    lastScreen = screen.clone()
    screens.push(lastScreen)
  }
  return screens
}
