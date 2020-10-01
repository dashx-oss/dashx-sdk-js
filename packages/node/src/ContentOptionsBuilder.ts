import type { Response } from 'got'

export type ContentOptions = {
  returnType?: 'all' | 'one',
  filter?: Record<string, boolean | string | number>,
  order?: Record<string, 'ASC' | 'DESC'>,
  limit?: number,
  page?: number,
  cache?: number
}

class ContentOptionsBuilder {
  private options: ContentOptions

  private callback: (options: ContentOptions) => Promise<Response>

  constructor(
    callback: (options: ContentOptions) => Promise<Response>
  ) {
    this.options = {}
    this.callback = callback
  }

  limit(by: ContentOptions['limit']) {
    this.options.limit = by
    return this
  }

  filter(by: ContentOptions['filter']) {
    this.options.filter = by
    return this
  }

  cache(timeout: ContentOptions['cache']) {
    this.options.cache = timeout
    return this
  }

  order(by: ContentOptions['order']) {
    this.options.order = by
    return this
  }

  all(withOptions: ContentOptions) {
    this.options = { ...this.options, ...withOptions, returnType: 'all' }
    return this.callback(this.options)
  }

  one(withOptions: ContentOptions) {
    this.options = { ...this.options, ...withOptions, returnType: 'one' }
    return this.callback(this.options)
  }
}

export default ContentOptionsBuilder
