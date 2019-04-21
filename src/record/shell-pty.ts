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
import { newScript } from './shell-script'
import { platform } from 'os'
import { IPty } from 'node-pty'

const shell = ((): string => {
  if (platform() === 'win32') {
    return 'powershell.exe'
  } else {
    const shell = process.env.SHELL
    if (shell) {
      return shell
    } else {
      return 'bash'
    }
  }
})()

export interface SessionOptions {
  columns?: number
  rows?: number
}

export const newPty = async (options: SessionOptions): Promise<IPty> => {
  try {
    const pty = await import('node-pty')
    return pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: options.columns,
      rows: options.rows,
      // cwd: platform() === 'win32' ? process.env.USERPROFILE : process.env.HOME,
      experimentalUseConpty: true
    })
  } catch {
    return newScript(options)
  }
}
