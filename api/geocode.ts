import { NowRequest, NowResponse } from '@vercel/node'
import { getLocationFromAddress } from '../core/Geocode';

export default async function (req: NowRequest, res: NowResponse) {
    const inputAddress = req.query.address;
    const address = inputAddress as string;

    let result = await getLocationFromAddress(address);
    res.json(result);
}