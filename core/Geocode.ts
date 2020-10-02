import { LatLon } from "../types/LatLon";
import { log } from "../utils";
import fetch from "node-fetch";

/**
 * Tries to get the location for the input address
 * @param {String} address String containing the address
 * @returns {Promise<LatLon>} Coordinates of the input address or null when address is not found
 */
export async function getLocationFromAddress(address: string): Promise<LatLon> {
    try {
        if (address == null || address.trim().length == 0) {
            throw new Error("Address is empty");
        }

        let myAddress = decodeURIComponent(address);
        while (myAddress != null && myAddress.trim().length > 0) {

            const encodedAddress = encodeURIComponent(myAddress);
            const apiKey = process.env.opencagedata_apikey;
            const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?&key=${apiKey}&limit=1&no_annotations=1&countrycode=it&q=${encodedAddress}`;

            log(() => `Retrieving location for "${address}" using "${myAddress}"`);
            const response = await fetch(geocodingUrl);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}`);
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

        throw new Error("Can't find a location for address")
    }
    catch (error) {
        log(() => `Error while Retrieving location for: ${address}, ${error.toString()}`);

        return null;
    }
}