import { NowRequest, NowResponse } from '@vercel/node'
import { getSubwaysDistance } from '../core/WalkMeter';

export default async function (req: NowRequest, res: NowResponse) {
    const inputLatitude = req.query.latitude as string;
    const inputLongitude = req.query.longitude as string;
    const latitude = parseFloat(inputLatitude);
    const longitude = parseFloat(inputLongitude);

    let result = await getSubwaysDistance(latitude, longitude);
    res.json(result);
}