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
import { parser } from '../cli'
import { ReplayOptions } from './replay'

export const buildOptions =
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(yargs: typeof parser) =>
  yargs
    .option('speed', {
      group: 'Replay:',
      type: 'number',
      desc: 'Multiply playback speed',
      default: 1.0
    })
    .option('step', {
      group: 'Replay:',
      type: 'number',
      desc: 'Normalize duration at steps of {n}ms'
    })
    .option('typingSpeed', {
      group: 'Replay:',
      type: 'number',
      desc: 'Multiply typing speed'
    })
    .option('typingStep', {
      group: 'Replay:',
      type: 'number',
      desc: 'Pause per keystroke'
    })
    .option('typingPause', {
      group: 'Replay:',
      type: 'number',
      desc: 'Maximum pause when typing'
    })
    .option('maxDelay', {
      group: 'Replay:',
      type: 'number',
      desc: 'Maximum delay between events'
    })

type Options = ReturnType<typeof buildOptions>['argv']
export const wrapOptions = (argv: Options): ReplayOptions => {
  return {
    step: argv.step,
    speed: argv.speed,
    typingSpeed: argv.typingSpeed,
    typingPause: argv.typingPause,
    typingStep: argv.typingStep,
    maxDelay: argv.maxDelay
  }
}
