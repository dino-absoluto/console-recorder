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
import * as record from './record'
import * as replay from './replay'
import * as kleur from 'kleur'
import yargs = require('yargs')
import once = require('lodash/once')

export const parser = yargs.strict(true)
const printHelp = once((): void => {
  parser.showHelp()
})
parser
  .usage('$0 <cmd> [options] [output]')
  .demandCommand(1, 1)
  .command(record)
  .command(replay)
  .help()
  .fail((msg, err): void => {
    printHelp()
    if (err) {
      if (err.name === 'Check') {
        console.log(kleur.red(`Error: ${err.message || ''}`))
      } else {
        console.log(kleur.red(err.stack || ''))
      }
    } else {
      console.error(kleur.red(msg))
    }
  })
  .parse()
