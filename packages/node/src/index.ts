import DashXClient from './DashXClient'

type Params = {
  baseUri: string,
  publicKey: string,
  privateKey: string
}

export default {
  createClient: (params: Params): DashXClient => new DashXClient(params)
}
