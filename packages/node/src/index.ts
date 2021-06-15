import Client from './Client'

type Params = {
  baseUri?: string,
  publicKey?: string,
  privateKey?: string
}

export default {
  createClient: (params: Params): Client => new Client(params)
}
