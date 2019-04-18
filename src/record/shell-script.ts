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
import { spawn, ChildProcess } from 'child_process'
import { SessionOptions } from './shell'
import { IPty } from 'node-pty'

export class ScriptSession implements IPty {
  public pid: number
  public process: string = 'script'
  public child: ChildProcess
  public cols: number
  public rows: number
  public constructor (options: SessionOptions) {
    const child = spawn('script', [ '-q', '/dev/null' ])
    this.child = child
    this.pid = child.pid
    this.cols = options.columns || 80
    this.rows = options.rows || 24
  }

  public on (event: 'exit', listener: (exitCode: number, signal?: number) => void): void
  // eslint-disable-next-line no-dupe-class-members
  public on (event: 'data', listener: (data: string) => void): void
  // eslint-disable-next-line no-dupe-class-members, @typescript-eslint/no-explicit-any
  public on (event: string, listener: (...argv: any[]) => void): void {
    const { child } = this
    if (event === 'exit') {
      child.on('exit', listener)
    } else if (event === 'data') {
      if (child.stdout) {
        child.stdout.on('data', listener)
      }
    }
  }

  public write (data: string): void {
    const { child } = this
    if (child.stdin) {
      child.stdin.write(data)
    }
  }

  public kill (signal?: string): void {
    this.child.kill(signal)
  }

  public resize (columns: number, rows: number): void {
    this.cols = columns
    this.rows = rows
  }
}

export const newScript = (options: SessionOptions): IPty => {
  return new ScriptSession(options)
}
