import * as sp from 'serialport'
const { SerialPort } = sp

async function afterBootComplete () {
  const { omit, camelCase } = this.lib._
  const { runHook } = this.app.bajo

  for (const c of this.connections) {
    const opts = omit(c, ['name', 'parser', 'worker'])
    c.instance = { port: new SerialPort(opts) }
    const optsParser = omit(c.parser, ['name'])
    const Parser = sp.default[c.parser.name]
    c.instance.parser = c.instance.port.pipe(new Parser(optsParser))
    const source = `${this.name}.${c.name}`
    for (const k in this.events) {
      for (const evt of this.events[k]) {
        c.instance[k].on(evt, async (data) => {
          const path = k === 'parser' && evt === 'data' ? 'data' : camelCase(`${k} ${evt}`)
          const type = k === 'port' && evt === 'error' ? evt : 'string'
          const params = { source, payload: { type, data } }
          await runHook(`${this.name}:${path}`, params, c.name)
          await runHook(`${this.name}.${c.name}:${path}`, params)
        })
      }
    }
  }
}

export default afterBootComplete
