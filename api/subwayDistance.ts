import { NowRequest, NowResponse } from '@vercel/node'
import { getSubwaysDistance, WalkMeterErrors } from '../core/WalkMeter';
import { EmptyResponseError, InternalError, BadRequestError } from '../types/Errors';
import { ErrorResponse, MyResponse } from '../types/GenericResponse';
import { allowCors } from '../utils';


const handler = async (req: NowRequest, res: NowResponse) => {
    const inputLatitude = req.query.latitude as string;
    const inputLongitude = req.query.longitude as string;
    const latitude = parseFloat(inputLatitude);
    const longitude = parseFloat(inputLongitude);

    try {
        let result = await getSubwaysDistance(latitude, longitude);
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
            res.json(new ErrorResponse(WalkMeterErrors.GenericUnmappedError, "Generic error while geocoding"));
        }
    }
}

export default allowCors(handler)