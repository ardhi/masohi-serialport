async function portError ({ payload }) {
  this.log.error('error%s', payload.data)
}

export default portError
