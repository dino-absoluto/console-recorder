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
// import * as c from 'kleur'
import { accessSync } from 'fs'
import { fromFile } from './interpreter'
import { fromScreens } from './renderer'
import { parser } from '../cli'
import { failedCheck } from '../utils/fail'
import { ColorPalette } from './color/color-data'
import { Recording } from '../recording'
import { buildOptions, wrapOptions } from '../replay/options'
import * as c from 'kleur'
import round = require('lodash/round')

export const command = 'render [options]'
export const aliases = []
export const describe = 'Render a record to SVG file'
export const builder =
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(yargs: typeof parser) =>
  buildOptions(yargs.strict(true))
    .usage('$0 -i <input> -o <output>')
    .option('input', {
      type: 'string',
      alias: ['i'],
      required: true
    })
    .option('output', {
      type: 'string',
      alias: ['o'],
      required: true
    })
    .option('overwrite', {
      type: 'boolean',
      default: false
    })
    .option('palette', {
      type: 'string',
      default: 'minus'
    })
    .check((argv): boolean => {
      if (!argv.input) {
        throw failedCheck('invalid input')
      }
      if (!argv.output) {
        throw failedCheck('invalid output')
      }
      if (argv.overwrite) {
        return true
      }
      const { output } = argv
      try {
        accessSync(output)
        throw failedCheck(`file existed "${argv.output}"`)
      } catch (err) {
        if (err.code === 'ENOENT') {
          return true
        } else {
          throw err
        }
      }
    })

type Options = ReturnType<typeof builder>['argv']

export const handler = async (argv: Options): Promise<void> => {
  const rec = await Recording.fromFile(argv.input)
  {
    console.log(
      c.blue('· input:'),
      c.white(argv.input)
    )
    const lastEvent = rec.events[rec.events.length - 1]
    console.log(' ',
      c.yellow(rec.events.length), c.green('frames'))
    console.log(' ',
      c.yellow(
        round(((lastEvent && lastEvent.time) || 0) / 1000, 4)),
      c.green('seconds')
    )
  }
  const screens = await fromFile(rec, wrapOptions(argv))
  if (!screens) {
    return
  }
  let palette: ColorPalette | undefined
  switch (argv.palette) {
    case 'minus': {
      palette = (await import('./color/palette-minus')).default
      break
    }
    case 'minus-light': {
      palette = (await import('./color/palette-minus-light')).default
      break
    }
    default: {
      break
    }
  }
  const data = await fromScreens(screens, argv.output, argv.overwrite, palette)
  if (data) {
    console.log(
      c.blue('· output:'),
      c.white(argv.output))
    console.log(' ',
      c.yellow(screens.length), c.green('frames'))
    console.log(' ',
      c.yellow(data.totalLength),
      c.green('seconds')
    )
  }
}
