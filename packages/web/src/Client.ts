import fetch from 'unfetch'
import uuid from 'uuid-random'

import { addContentRequest, editContentRequest, fetchContentRequest, identifyAccountRequest, searchContentRequest, trackEventRequest } from './graphql'
import generateContext from './context'
import ContentOptionsBuilder from './ContentOptionsBuilder'
import { getItem, setItem } from './storage'
import { parseFilterObject } from './utils'
import type { Context } from './context'
import type { ContentOptions, FetchContentOptions } from './ContentOptionsBuilder'

type ClientParams = {
  publicKey: string,
  baseUri?: string
}

type IdentifyParams = Record<string, string | number> & {
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string
}

class Client {
  accountAnonymousUid: string | null = null

  accountUid: string | null = null

  context: Context

  publicKey: string

  baseUri: string

  constructor({ publicKey, baseUri = 'https://api.dashx.com/graphql' }: ClientParams) {
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.context = generateContext()
    this.generateAnonymousUid()
  }

  private generateAnonymousUid(regenerate = false): void {
    const accountAnonymousUid = getItem('accountAnonymousUid')
    if (!regenerate && accountAnonymousUid) {
      this.accountAnonymousUid = accountAnonymousUid
      return
    }

    this.accountAnonymousUid = uuid()
    setItem('accountAnonymousUid', this.accountAnonymousUid)
  }

  private async makeHttpRequest(request: string, params: any): Promise<any> {
    const response = await fetch(this.baseUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify({
        query: request,
        variables: { input: params }
      })
    }).then((res) => res.json())

    if (response.data) {
      return Promise.resolve(response.data)
    }

    return Promise.reject(response.errors)
  }

  identify(): Promise<Response>
  identify(uid: string): void
  identify(options: IdentifyParams): Promise<Response>
  identify(options?: string | IdentifyParams): Promise<any> | void {
    if (typeof options === 'string') {
      this.accountUid = options
      return undefined
    }

    const params = {
      anonymousUid: this.accountAnonymousUid,
      ...options
    }

    return this.makeHttpRequest(identifyAccountRequest, params)
      .then((res) => res?.identifyAccount)
  }

  reset(): void {
    this.accountUid = null
    this.generateAnonymousUid(true)
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const params = { event, data, uid: this.accountUid, anonymous_uid: this.accountAnonymousUid }

    return this.makeHttpRequest(trackEventRequest, params)
  }

  addContent(urn: string, data: Record<string, any>): Promise<Response> {
    let content; let
      contentType

    if (urn.includes('/')) {
      [ contentType, content ] = urn.split('/')
    } else {
      contentType = urn
    }

    const params = { content, contentType, data }

    return this.makeHttpRequest(addContentRequest, params)
  }

  editContent(urn: string, data: Record<string, any>): Promise<Response> {
    let content; let
      contentType

    if (urn.includes('/')) {
      [ contentType, content ] = urn.split('/')
    } else {
      contentType = urn
    }

    const params = { content, contentType, data }

    return this.makeHttpRequest(editContentRequest, params)
  }

  searchContent(contentType: string): ContentOptionsBuilder
  searchContent(contentType: string, options: ContentOptions): Promise<any>
  searchContent(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<any> {
    if (!options) {
      return new ContentOptionsBuilder(
        (wrappedOptions) => this.makeHttpRequest(
          searchContentRequest,
          { ...wrappedOptions, contentType }
        ).then((response) => response?.searchContent)
      )
    }

    const filter = parseFilterObject(options.filter)

    const result = this.makeHttpRequest(
      searchContentRequest,
      { ...options, contentType, filter }
    ).then((response) => response?.searchContent)

    if (options.returnType === 'all') {
      return result
    }

    return result.then((data) => (Array.isArray(data) ? data[0] : null))
  }

  async fetchContent(urn: string, options: FetchContentOptions): Promise<any> {
    if (!urn.includes('/')) {
      throw new Error('URN must be of form: {contentType}/{content}')
    }

    const [ contentType, content ] = urn.split('/')
    const params = { content, contentType, ...options }

    const response = await this.makeHttpRequest(fetchContentRequest, params)
    return response?.fetchContent
  }
}

export default Client
export type { ClientParams }
