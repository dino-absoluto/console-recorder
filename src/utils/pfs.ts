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
import * as fs from 'fs'
import { promisify } from 'util'

/* code */
export { constants } from 'fs'
export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)
export const rename = promisify(fs.rename)
export const unlink = promisify(fs.unlink)
export const rmdir = promisify(fs.rmdir)
export const access = promisify(fs.access)
