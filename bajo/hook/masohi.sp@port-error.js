async function portError ({ payload }) {
  this.log.error('error%s', payload)
}

export default portError
