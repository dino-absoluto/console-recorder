# console-recorder

> Simply record and replay console session.

[![Build Status](https://travis-ci.com/dino-absoluto/console-recorder.svg?branch=master)](https://travis-ci.com/dino-absoluto/console-recorder)
[![Coverage Status](https://coveralls.io/repos/github/dino-absoluto/console-recorder/badge.svg?branch=master)](https://coveralls.io/github/dino-absoluto/console-recorder?branch=master)
[![npm version](https://badge.fury.io/js/console-recorder.svg)](https://badge.fury.io/js/console-recorder)

#### Concept

It is in essence a text log with timestamps. By using the timestamps,
you can reproduce the console state in real-time.

Replay is a visual reproduction. The actual commands won't be re-run.

#### Features
- Record tools such as VIM.
- Customize your replay experience with options: speed, typingSpeed, etc.
- Terminate the replay with Ctrl+C.
- Turn your recording to **Animated SVG** file.

## Install

```bash
npm i -g console-recorder
```

## Usage
#### Record
```bash
console-recorder rec log.json
```
This open a new shell session.

Use `exit` to terminate the session and finish the recording.

#### Replay
```bash
console-recorder play log.json
```

This replay a previously recorded session.

No interaction is necessary, you can terminate the replay with Ctrl+C.

#### Render
```bash
console-recorder render -i log.json -o output.svg
```

Render a recorded session to an **Animated SVG** file.

![palette](docs/media/palette.svg)
