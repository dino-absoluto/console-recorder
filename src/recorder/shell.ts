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
import { platform } from 'os'
import chalk from 'chalk'
import { PassThrough, Readable } from 'stream'
import pty = require('node-pty')

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

const { stdin, stdout } = process

const getColumns = (): number => stdout.columns || 80
const getRows = (): number => stdout.rows || 24

interface PTYStream extends Readable {
  columns?: number
  rows?: number
}

export const spawnShell = (): PTYStream => {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('TTY is required')
  }
  if (!stdin.setRawMode) {
    throw new Error('RawMode is required')
  }

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: getColumns(),
    rows: getRows(),
    // cwd: platform() === 'win32' ? process.env.USERPROFILE : process.env.HOME,
    experimentalUseConpty: true
  })

  const handleResize = (): void => {
    ptyProcess.resize(getColumns(), getRows())
  }
  stdout.on('resize', handleResize)
  const handleExit = (): void => {
    ptyProcess.kill()
  }
  process.on('exit', handleExit)
  const handleData = (chunk: string | Buffer): void => {
    ptyProcess.write(chunk.toString())
  }

  stdin.setRawMode(true)
  console.log(chalk.blue('---SESSION STARTED---'))

  const stream = new PassThrough({
    emitClose: true
  })

  stream.on('error', (): void => {
    ptyProcess.kill()
  })

  ptyProcess.on('data', (data): void => {
    stream.write(data)
    stdout.write(data)
  })

  ptyProcess.on('exit', (exitCode): void => {
    console.log(chalk.red('---SESSION ENDED---'))
    if (stdin.setRawMode) {
      stdin.setRawMode(false)
    }
    stdout.off('resize', handleResize)
    stdin.off('data', handleData)
    stdin.pause()
    process.off('exit', handleExit)
    if (exitCode !== 0) {
      stream.end((): void =>
        stream.destroy(new Error(`shell exit with ${exitCode}`)))
    } else {
      stream.end()
    }
  })
  stdin.on('data', handleData)

  return stream
}
