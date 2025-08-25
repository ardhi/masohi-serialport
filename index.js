async function factory (pkgName) {
  const me = this

  class MasohiSerialport extends this.lib.Plugin {
    static alias = 'sp'
    static dependencies = ['masohi']

    constructor () {
      super(pkgName, me.app)
      this.config = {
        connections: [],
        stations: []
      }
      this.events = {
        port: ['error', 'open', 'close'],
        parser: ['data']
      }
      this.parsers = ['ByteLengthParser', 'CCTalkParser', 'DelimiterParser', 'InterByteTimeoutParser',
        'PacketLengthParser', 'ReadlineParser', 'ReadyParser', 'RegexParser', 'SlipEncoder', 'SlipDecoder',
        'SpacePacketParser']
    }

    init = async () => {
      const { buildCollections } = this.app.bajo

      const handler = async ({ item }) => {
        const { isString, has } = this.lib._
        if (!has(item, 'path')) throw this.error('connMustHave%s', 'path')
        item.baudRate = item.baudRate ?? 38400
        if (isString(item.parser)) item.parser = { name: item.parser }
        item.parser = item.parser ?? { name: 'ReadlineParser', delimiter: '\r\n' }
        if (!this.parsers.includes(item.parser.name)) throw this.error('unknownParser%s', item.parser.name)
      }

      this.connections = await buildCollections({ ns: this.name, handler, dupChecks: ['name', 'path'], container: 'connections' })
    }

    exit = async () => {
      if (this.connections.length === 0) return
      for (const c of this.connections) {
        if (!c.instance) continue
        await c.instance.port.close()
      }
    }

    getStationData = ({ payload, source: connection }) => {
      const { find } = this.lib._
      return find(this.config.stations, { connection })
    }
  }

  return MasohiSerialport
}

export default factory
