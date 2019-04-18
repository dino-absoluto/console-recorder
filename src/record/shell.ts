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
import { PassThrough, Readable } from 'stream'
import { newScript } from './shell-script'
import { newPty } from './shell-pty'

const { stdin, stdout } = process

const getColumns = (): number => stdout.columns || 80
const getRows = (): number => stdout.rows || 24

interface PTYStream extends Readable {
  name?: string
  columns?: number
  rows?: number
}

export interface SessionOptions {
  columns?: number
  rows?: number
}

export interface SpawnShellOptions {
  useNodePty?: boolean
}

export const spawnShell =
async (options: SpawnShellOptions = {}): Promise<PTYStream> => {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('TTY is required')
  }
  if (!stdin.setRawMode) {
    throw new Error('RawMode is required')
  }

  const ptyOptions = {
    columns: getColumns(),
    rows: getRows()
  }
  const ptyProcess = await (platform() === 'win32' || options.useNodePty
    ? newPty(ptyOptions)
    : newScript(ptyOptions))

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

  const stream: PTYStream & PassThrough = new PassThrough({
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

  stream.name = ptyProcess.process

  return stream
}
