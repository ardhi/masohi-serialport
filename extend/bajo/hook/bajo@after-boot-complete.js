import * as sp from 'serialport'
const { SerialPort } = sp

async function afterBootComplete () {
  const { omit } = this.app.lib._
  const { runHook } = this.app.bajo

  for (const c of this.connections) {
    const opts = omit(c, ['name', 'parser', 'worker'])
    c.instance = { port: new SerialPort(opts) }
    const optsParser = omit(c.parser, ['name'])
    const Parser = sp.default[c.parser.name]
    c.instance.parser = c.instance.port.pipe(new Parser(optsParser))
    const source = `${this.name}.${c.name}` // <ns>.<connName>
    for (const k in this.events) {
      for (const evt of this.events[k]) {
        c.instance[k].on(evt, async (msg) => {
          let payload = evt === 'error' ? undefined : msg
          const error = evt === 'error' ? msg : undefined
          if (payload && c.payloadType === 'json') payload = JSON.parse(payload)
          await runHook(`${this.name}:${evt}`, { source, payload, error }, c)
          await runHook(`${this.name}.${c.name}:${evt}`, { source, payload, error })
        })
      }
    }
  }
}

export default afterBootComplete
