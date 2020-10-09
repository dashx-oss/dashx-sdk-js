class ContentOptionsBuilder {
  constructor(callback) {
    this.options = {}
    this.callback = callback
  }

  limit(by) {
    this.options.limit = by
    return this
  }

  filter(by) {
    this.options.filter = by
    return this
  }

  order(by) {
    this.options.order = by
    return this
  }

  cache(timeout) {
    this.options.cache = timeout
    return this
  }

  all(withOptions) {
    this.options = { ...this.options, ...withOptions, returnType: 'all' }
    return this.callback(this.options)
  }

  one(withOptions) {
    this.options = { ...this.options, ...withOptions, returnType: 'one' }
    return this.callback(this.options)
  }
}

export default ContentOptionsBuilder
