import uuid from 'uuid-random'
import type { Response } from 'got'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import HttpClient from './HttpClient'
import type { ContentOptions } from './ContentOptionsBuilder'

type Config = {
  baseUri?: string,
  publicKey?: string,
  privateKey?: string,
  contentCache?: number
}

type Parcel = {
  to: string[] | string,
  body: string,
  data: Record<string, any>
}

type IdentifyParams = {
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string
}

class DashXClient extends HttpClient {
  contentCacheTimeout?: number

  constructor({
    baseUri = process.env.DASHX_BASE_URI || 'https://api.dashx.com/v1',
    publicKey = process.env.DASHX_PUBLIC_KEY,
    privateKey = process.env.DASHX_PRIVATE_KEY,
    contentCache
  }: Config = {}) {
    super(baseUri, publicKey, privateKey)
    this.contentCacheTimeout = contentCache
  }

  deliver(parcel: Parcel): Promise<Response> {
    return this.create().makeRequest('/deliver', parcel)
  }

  identify(uid: string, options?: IdentifyParams) : Promise<Response>
  identify(options?: IdentifyParams) : Promise<Response>
  identify(
    uid: string | IdentifyParams = {}, options: IdentifyParams = {} as IdentifyParams
  ): Promise<Response> {
    let params

    if (typeof uid === 'string') {
      params = { uid, ...options }
    } else {
      params = {
        anonymousUid: uuid(),
        ...options
      }
    }

    return this.create().makeRequest('/identify', params)
  }

  track(event: string, uid: string, data: Record<string, any>): Promise<Response> {
    return this.create().makeRequest('/track', { event, uid, data })
  }

  content(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<Response> {
    if (options) {
      return this.create()
        .setCacheTimeout(options.cache || this.contentCacheTimeout)
        .makeRequest('/content', { ...options, contentType })
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.create()
        .setCacheTimeout(wrappedOptions.cache || this.contentCacheTimeout)
        .makeRequest('content', { ...wrappedOptions, contentType })
    )
  }
}

export default DashXClient
