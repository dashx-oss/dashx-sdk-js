import crypto from 'crypto'
import http from 'got'
import uuid from 'uuid-random'
import type { Response } from 'got'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import { deliverRequest, identifyAccountRequest, trackEventRequest, addContentRequest, editContentRequest, fetchContentRequest, searchContentRequest } from './graphql'
import { parseFilterOrderObject } from './utils'
import type { ContentOptions, FetchContentOptions } from './ContentOptionsBuilder'

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

class Client {
  publicKey?: string

  privateKey?: string

  targetInstallation?: string

  targetEnvironment?: string

  baseUri: string

  constructor({
    baseUri = process.env.DASHX_BASE_URI || 'https://api.dashx.com/graphql',
    publicKey = process.env.DASHX_PUBLIC_KEY,
    privateKey = process.env.DASHX_PRIVATE_KEY,
    targetInstallation = process.env.DASHX_TARGET_INSTALLATION,
    targetEnvironment = process.env.DASHX_TARGET_ENVIRONMENT
  } = {}) {
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.targetEnvironment = targetEnvironment
    this.targetInstallation = targetInstallation
  }

  private makeHttpRequest(request: string, params: any): Promise<any> {
    return http(this.baseUri, {
      body: JSON.stringify({
        query: request,
        variables: { input: params }
      }),
      method: 'POST',
      headers: {
        'User-Agent': 'dashx-node',
        'X-Public-Key': this.publicKey,
        'X-Private-Key': this.privateKey,
        'X-Target-Installation': this.targetInstallation,
        'X-Target-Environment': this.targetEnvironment,
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
      .json()
      .then((response: any) => new Promise((resolve, reject) => {
        if (response.data) {
          return resolve(response.data)
        } else {
          return reject(response.errors)
        }
      }))
  }

  deliver(parcel: Parcel): Promise<Response> {
    return this.makeHttpRequest(deliverRequest, { parcel })
  }

  identify(uid: string, options?: IdentifyParams): Promise<Response>
  identify(options?: IdentifyParams): Promise<Response>
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

    return this.makeHttpRequest(identifyAccountRequest, params)
  }

  generateIdentityToken(uid: string): string {
    if (!this.privateKey) {
      throw new Error('Private key not set')
    }

    const nonce = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.privateKey), nonce, {
      authTagLength: 16
    })
    const encrypted = Buffer.concat([ cipher.update(uid), cipher.final() ])
    const encryptedToken = Buffer.concat([ nonce, encrypted, cipher.getAuthTag() ])

    // Base64.urlsafe_encode64
    return encryptedToken.toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
  }

  track(event: string, uid: string, data: Record<string, any>): Promise<Response> {
    return this.makeHttpRequest(trackEventRequest, { event, uid, data })
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

  searchContent(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<any> {
    if (options) {
      let filter = parseFilterOrderObject(options.filter)
      let order = parseFilterOrderObject(options.order)
      
      let response = this.makeHttpRequest(
        searchContentRequest,
        { ...options, contentType, filter, order }
      ).then(response => response?.searchContent)

      if (options.returnType == 'all') {
        return response
      }

      return response.then(data => Array.isArray(data) ? data[0] : null)
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest(
        searchContentRequest,
        { ...wrappedOptions, contentType }
      ).then(response => response?.searchContent)
    )
  }

  fetchContent(urn: string, options: FetchContentOptions): Promise<any> {
    if (!urn.includes('/')) {
      throw new Error('URN must be of form: {contentType}/{content}')
    }
    const [ contentType, content ] = urn.split('/')
    const params = { content, contentType, ...options }

    return this.makeHttpRequest(fetchContentRequest, params).then(response => response?.fetchContent)
  }
}

export default Client
