async function portError ({ error }) {
  this.log.error('error%s', error.message, error)
}

export default portError
