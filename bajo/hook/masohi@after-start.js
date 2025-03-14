import * as sp from 'serialport'
const { SerialPort } = sp

async function masohiAfterStart () {
  const { omit, camelCase } = this.lib._
  const { publish } = this.app.masohi

  for (const c of this.connections) {
    const opts = omit(c, ['name', 'parser'])
    c.instance = { port: new SerialPort(opts) }
    const optsParser = omit(c.parser, ['name'])
    const Parser = sp.default[c.parser.name]
    c.instance.parser = c.instance.port.pipe(new Parser(optsParser))
    for (const k in this.events) {
      for (const evt of this.events[k]) {
        c.instance[k].on(evt, async (payload) => {
          const opts = { topic: k === 'parser' && evt === 'data' ? 'data' : camelCase(`${k} ${evt}`), options: { ns: this.name, nsConn: c.name } }
          const type = k === 'port' && evt === 'error' ? evt : 'string'
          opts.payload = { type, data: type === 'error' ? payload.message : payload }
          await publish(opts)
        })
      }
    }
  }
}

export default masohiAfterStart
