import { NowRequest, NowResponse } from '@vercel/node'
import { GeocodeErrors, getLocationFromAddress } from '../core/Geocode';
import { BadRequestError, EmptyResponseError, InternalError } from '../types/Errors';
import { allowCors } from '../utils';


const handler = async (req: NowRequest, res: NowResponse) => {
    const inputAddress = req.query.address;
    const address = inputAddress as string;

    try {
        let result = await getLocationFromAddress(address);
        res.json(result);
    } catch (error) {
        if (error instanceof EmptyResponseError) {
            res.status(404);
            res.json({ errorCode: error.code, errorMessage: error.message });
        }
        else if (error instanceof InternalError) {
            res.status(500);
            res.json({ errorCode: error.code, errorMessage: error.message });
        }
        else if (error instanceof BadRequestError) {
            res.status(400);
            res.json({ errorCode: error.code, errorMessage: error.message });
        }
        else {
            // this should never happen
            res.status(500);
            res.json({ errorCode: GeocodeErrors.GenericUnmappedError, errorMessage: "Generic error while geocoding" });
        }
    }
}

export default allowCors(handler)