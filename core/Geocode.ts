import { LatLon } from "../types/LatLon";
import { log, logError } from "../utils";
import fetch from "node-fetch";
import { BadRequestError, EmptyResponseError, InternalError } from "../types/Errors";

export class GeocodeErrors {
    public static readonly BadAddress = "GEOCODE-BAD-ADDRESS";
    public static readonly OpenRouteService = "GEOCODE-OPENROUTESERVICE-ERROR";
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
            const apiKey = process.env.openrouteservice_apikey;
            const country = "IT"; // TODO: currently I'm stubbing country IT. Somehow this will be parametrized
            const geocodingUrl = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodedAddress}&boundary.country=${country}&layers=address`;

            const response = await fetch(geocodingUrl);

            if (!response.ok) {
                throw new InternalError(GeocodeErrors.OpenRouteService, `Network response was not ok: ${response.status} - ${response.statusText}`);
            }

            const responseBody = await response.json();

            const firstResult = responseBody.features?.find(x => x.properties.confidence > 0.7); // This returns the first element with enough confidence
            if (firstResult) {
                // The address is correct, a location is found!

                const lon = firstResult.geometry.coordinates[0];
                const lat = firstResult.geometry.coordinates[1];
                const result: LatLon = { latitude: lat, longitude: lon };

                log(() => `\nFound location for "${address}" using "${myAddress}" \n Coordinates: ${lat},${lon} - Location name: ${firstResult.properties.name}`);
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