async function portClose ({ source }) {
  const { breakNsPath } = this.app.bajo
  const { subNs } = breakNsPath(source)
  this.log.debug('connIs%s%s', subNs, 'open')
}

export default portClose
