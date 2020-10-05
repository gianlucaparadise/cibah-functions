import { NowRequest, NowResponse } from '@vercel/node'
import { allowCors } from '../utils'

export default allowCors(
  function (req: NowRequest, res: NowResponse) {
    const { name = 'World' } = req.query
    res.send(`Hello ${name}!`)
  }
)