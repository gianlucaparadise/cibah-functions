import { NowRequest, NowResponse } from '@vercel/node'
import { getLocationFromAddress } from '../core/Geocode';
import { allowCors } from '../utils';

export default allowCors(
    async function (req: NowRequest, res: NowResponse) {
        const inputAddress = req.query.address;
        const address = inputAddress as string;

        let result = await getLocationFromAddress(address);
        res.json(result);
    }
)