import { NowRequest, NowResponse } from '@vercel/node'
import { GeocodeErrors, getLocationFromAddress } from '../core/Geocode';
import { BadRequestError, EmptyResponseError, InternalError } from '../types/Errors';
import { ErrorResponse, MyResponse } from '../types/GenericResponse';
import { allowCors } from '../utils';


const handler = async (req: NowRequest, res: NowResponse) => {
    const inputAddress = req.query.address;
    const address = inputAddress as string;

    try {
        let result = await getLocationFromAddress(address);
        res.json(new MyResponse(result));
    } catch (error) {
        if (error instanceof EmptyResponseError) {
            res.status(404);
            res.json(new ErrorResponse(error.code, error.message));
        }
        else if (error instanceof InternalError) {
            res.status(500);
            res.json(new ErrorResponse(error.code, error.message));
        }
        else if (error instanceof BadRequestError) {
            res.status(400);
            res.json(new ErrorResponse(error.code, error.message));
        }
        else {
            // this should never happen
            res.status(500);
            res.json(new ErrorResponse(GeocodeErrors.GenericUnmappedError, "Generic error while geocoding"));
        }
    }
}

export default allowCors(handler)