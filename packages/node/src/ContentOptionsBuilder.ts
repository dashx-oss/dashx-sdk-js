import { parseFilterOrderObject } from './utils'

export type ContentOptions = {
  returnType?: 'all' | 'one',
  language?: string,
  include?: Array<string>,
  exclude?: Array<string>,
  fields?: Array<string>,
  preview?: boolean,
  filter?: Record<string, any>,
  order?: Record<string, 'ASC' | 'DESC'>,
  limit?: number,
  page?: number
}

export type FetchContentOptions = Pick<ContentOptions, 'exclude' | 'include' | 'fields' | 'language' | 'preview'>

class ContentOptionsBuilder {
  private options: ContentOptions

  private callback: (options: ContentOptions) => Promise<any>

  constructor(
    callback: (options: ContentOptions) => Promise<any>
  ) {
    this.options = {}
    this.callback = callback
  }

  limit(by: ContentOptions['limit']): ContentOptionsBuilder {
    this.options.limit = by
    return this
  }

  filter(by: ContentOptions['filter']): ContentOptionsBuilder {
    this.options.filter = parseFilterOrderObject(by)
    return this
  }

  order(by: ContentOptions['order']): ContentOptionsBuilder {
    this.options.order = parseFilterOrderObject(by)
    return this
  }

  language(to: ContentOptions['language']): ContentOptionsBuilder {
    this.options.language = to
    return this
  }

  fields(identifiers: ContentOptions['fields']): ContentOptionsBuilder {
    this.options.fields = identifiers
    return this
  }

  include(identifiers: ContentOptions['include']): ContentOptionsBuilder {
    this.options.include = identifiers
    return this
  }

  exclude(identifiers: ContentOptions['exclude']): ContentOptionsBuilder {
    this.options.exclude = identifiers
    return this
  }

  preview(): ContentOptionsBuilder {
    this.options.preview = true
    return this
  }

  all(withOptions: ContentOptions): Promise<any> {
    this.options = { ...this.options, ...withOptions, returnType: 'all' }
    return this.callback(this.options)
  }

  one(withOptions: ContentOptions): Promise<any> {
    this.options = { ...this.options, ...withOptions, returnType: 'one' }
    return this.callback(this.options).then((data) => (Array.isArray(data) ? data[0] : null))
  }
}

export default ContentOptionsBuilder
