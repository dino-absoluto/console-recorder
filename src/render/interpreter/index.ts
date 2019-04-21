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
// import { Record } from '../recorder/record'
import { Recording } from 'console-recorder'
import {
  ScreenBuffer
} from './screen'
import * as c from 'kleur'

const timeExtension = 2000

export const fromFile = async (fpath: string): Promise<ScreenBuffer[] | undefined> => {
  console.log(
    c.blue('· input:'),
    c.white(fpath)
  )
  const rec = await Recording.fromFile(fpath)
  if (!rec) { return }
  const screen = new ScreenBuffer({
    columns: rec.columns,
    rows: rec.rows
  // , defaultBackground: DEFAULT_FG
  // , defaultForeground: DEFAULT_BG
  })
  // const multiplier = 1 / rec.playSpeed
  const multiplier = 1 / 2
  const throttle = 50 * multiplier
  const screens = []
  let lastScreen: ScreenBuffer | undefined
  const begin = (rec.events[0] && rec.events[0].time) || 0
  let lastTime = 0
  for (const e of rec.events) {
    screen.decode(e.text)
    const time = (e.time - begin) * multiplier
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
  console.log(' ',
    c.yellow(screens.length), c.green('frames'))
  console.log(' ',
    c.yellow(
      Math.round(((lastScreen && lastScreen.timeEnd) || 0) / 100) / 10),
    c.green('seconds')
  )
  return screens
}
