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
- The playback speed can be adjusted faster or slower.
- Terminate the replay with Ctrl+C.
- And obviously, tools such as VIM works too.

## Install

```bash
npm i -g console-recorder
```

## Record & playback
Record session.

```bash
console-recorder rec log.json
┌────────────────────────────────────────────────┐
│ -RECORDING STARTED-
▲ console-recorder/ $ echo Hello World!
Hello World!
▲ console-recorder/ $ exit
exit

│ -RECORDING ENDED-
└────────────────────────────────────────────────┘
```

Replay a previously recorded session.

```bash
console-recorder play log.json
┌────────────────────────────────────────────────┐
│ -REPLAY STARTED-
▲ console-recorder/ $ echo Hello World!
Hello World!
▲ console-recorder/ $ exit
exit

│ -REPLAY ENDED-
└────────────────────────────────────────────────┘
```
