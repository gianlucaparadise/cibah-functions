import { LatLon } from "../types/LatLon";
import { log, logError } from "../utils";
import fetch from "node-fetch";
import { BadRequestError, EmptyResponseError, InternalError } from "../types/Errors";

export class GeocodeErrors {
    public static readonly BadAddress = "GEOCODE-BAD-ADDRESS";
    public static readonly OpenCageData = "GEOCODE-OPENCAGEDATA-ERROR";
    public static readonly LocationNotFound = "GEOCODE-LOCATION-NOT-FOUND";
    public static readonly GenericError = "GEOCODE-GENERIC-ERROR";
    public static readonly GenericUnmappedError = "GEOCODE-GENERIC";
}

/**
 * Tries to get the location for the input address
 * @param {String} address String containing the address
 * @returns {Promise<LatLon>} Coordinates of the input address or null when address is not found
 */
export async function getLocationFromAddress(address: string): Promise<LatLon> {
    if (address == null || address.trim().length == 0) {
        throw new BadRequestError(GeocodeErrors.BadAddress, "Address is empty");
    }

    try {
        let myAddress = decodeURIComponent(address);
        while (myAddress != null && myAddress.trim().length > 0) {

            const encodedAddress = encodeURIComponent(myAddress);
            const apiKey = process.env.opencagedata_apikey;
            const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?&key=${apiKey}&limit=1&no_annotations=1&countrycode=it&q=${encodedAddress}`;

            log(() => `Retrieving location for "${address}" using "${myAddress}"`);
            const response = await fetch(geocodingUrl);

            if (!response.ok) {
                throw new InternalError(GeocodeErrors.OpenCageData, `Network response was not ok: ${response.status} - ${response.statusText}`);
            }

            const responseBody = await response.json();

            if (responseBody.results.length > 0) {
                // The address is correct, a location is found!
                const firstResult = responseBody.results[0];

                const result: LatLon = { latitude: firstResult.geometry.lat, longitude: firstResult.geometry.lng };
                return result;
            }

            // This will remove the first word from the address. On Immobiliare, usually it is not part of the address
            myAddress = myAddress.split(" ").slice(1).join(" ");
        }

        throw new EmptyResponseError(GeocodeErrors.LocationNotFound, "Can't find a location for address")
    }
    catch (error) {
        if (error instanceof EmptyResponseError || error instanceof InternalError) {
            throw error;
        }

        logError(() => `Error while Retrieving location for: ${address}`, error);
        throw new InternalError(GeocodeErrors.GenericError, `Error while Retrieving location for: ${address}`)
    }
}