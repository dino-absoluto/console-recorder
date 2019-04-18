# console-recorder

> Simply record and replay console session.

#### Concept

It is in essence a text log with timestamp. By using the timestamp,
you can reproduce the console state in real-time.

Replay is a visual reproduction. The actual commands won't be re-run.

#### Features
- The playback speed can also be adjusted faster or slower.
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
$ echo Hello World!
Hello World!
$ exit
exit

│ -RECORDING ENDED-
└────────────────────────────────────────────────┘
▲ console-recorder/ $
```

Replay a previously recorded session.

```bash
console-recorder play log.json
┌────────────────────────────────────────────────┐
│ -REPLAY STARTED-
$ echo Hello World!
Hello World!
$ exit
exit

│ -REPLAY ENDED-
└────────────────────────────────────────────────┘
```
