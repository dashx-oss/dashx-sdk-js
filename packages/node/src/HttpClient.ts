import http from 'got'
import Keyv from 'keyv'
import os from 'os'
import type { Response } from 'got'

import { snakeCaseKeys } from './utils'

class HttpClient {
  private getCache: (cacheTimeout:number) => Keyv

  private cacheTimeout?: number

  private publicKey?: string

  private privateKey?: string

  private baseUri: string

  constructor(baseUri: string, publicKey?: string, privateKey?: string) {
    this.getCache = (cacheTimeout: number) => new Keyv(
      `sqlite://${os.tmpdir}/dashx-response-cache`, { ttl: cacheTimeout }
    )
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  create(): HttpClient {
    return new HttpClient(this.baseUri, this.publicKey, this.privateKey)
  }

  setCacheTimeout(to?: number): HttpClient {
    this.cacheTimeout = to
    return this
  }

  makeRequest<T>(uri: string, body: T): Promise<Response> {
    return http(uri, {
      json: snakeCaseKeys(body),
      method: 'POST',
      prefixUrl: this.baseUri,
      cache: this.cacheTimeout ? this.getCache(this.cacheTimeout) : false,
      headers: {
        'User-Agent': 'dashx-node',
        'X-Public-Key': this.publicKey,
        'X-Private-Key': this.privateKey,
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
  }
}

export default HttpClient
