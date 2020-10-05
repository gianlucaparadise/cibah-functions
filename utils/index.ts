import { NowApiHandler, NowRequest, NowResponse } from '@vercel/node'

const debug = true;

export function log(obj: () => String) {
    if (debug) {
        console.log(obj());
    }
}

export function allowCors(fn: NowApiHandler) {
    return async (req: NowRequest, res: NowResponse) => {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Allow-Origin', '*')
        // another common pattern
        // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
        if (req.method === 'OPTIONS') {
            res.status(200).end()
            return
        }
        return await fn(req, res)
    }
}

// const handler = (req, res) => {
//     const d = new Date()
//     res.end(d.toString())
// }

// module.exports = allowCors(handler)