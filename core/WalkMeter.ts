import { Subway, SubwayDistance } from "../types/Subway";
import { log, logError } from "../utils";
import fetch from "node-fetch";
import { BadRequestError, InternalError } from "../types/Errors"

const radius = 1000; // 1 Km

export class WalkMeterErrors {
    public static readonly BadCoordinates = "WALKMETER-BAD-COORDINATES";
    public static readonly BadDestination = "WALKMETER-BAD-DESTINATION";
    public static readonly Overpass = "WALKMETER-OVERPASS-ERROR";
    public static readonly OpenRouteService = "WALKMETER-OPENROUTESERVICE-ERROR";
    public static readonly GetSubwaysGenericError = "WALKMETER-GETSUBWAYS-GENERIC-ERROR";
    public static readonly GetDistanceToSubwaysGenericError = "WALKMETER-GETDISTANCETOSUBWAYS-GENERIC-ERROR";
    public static readonly GenericUnmappedError = "WALKMETER-GENERIC";
}

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<SubwayDistance[]>} List of subways and their distances
 */
export async function getSubwaysDistance(latitude: number, longitude: number): Promise<SubwayDistance[]> {
    const subways = await getSubways(latitude, longitude);
    const subwayDistances = await getDistanceToSubways(latitude, longitude, subways);

    return subwayDistances;
}

/**
 * Gets the list of subways within a fixed range of 2 Km
 * @param {Number} latitude Latitude for the start location
 * @param {Number} longitude Longitude for the start location
 * @returns {Promise<Subway[]>} List of nearby subways
 */
async function getSubways(latitude: number, longitude: number): Promise<Subway[]> {
    if (latitude == null || longitude == null) {
        throw new BadRequestError(WalkMeterErrors.BadCoordinates, "Input Data is invalid");
    }

    try {
        const request = `
			<osm-script output="json" timeout="10">
				<query type="node">
					<has-kv k="railway" v="station"/>
					<has-kv k="station" v="subway"/>
					<around lat="${latitude}" lon="${longitude}" radius="${radius}"/>
				</query>
				<print/>
			</osm-script>
		`;
        const encodedRequest = encodeURIComponent(request);
        const url = `https://overpass-api.de/api/interpreter?data=${encodedRequest}`;

        log(() => `Retrieving subways for (${latitude},${longitude})`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new InternalError(WalkMeterErrors.Overpass, `Network response was not ok: ${response.status} - ${response.statusText}`);
        }

        const responseBody = await response.json();

        const subways: Subway[] = responseBody.elements.map((el) => {
            const result: Subway = { latitude: el.lat, longitude: el.lon, name: el.tags.name };
            return result;
        });

        return subways;

    } catch (error) {
        if (error instanceof InternalError) {
            throw error;
        }

        logError(() => `Error while Searching for subways for location: (${latitude},${longitude})`, error);

        throw new InternalError(WalkMeterErrors.GetSubwaysGenericError, `Error while Searching for subways for location: (${latitude},${longitude})`)
    }
}

/**
 * Gets the distance for 
 * @param {Number} startLatitude Latitude for the start location
 * @param {Number} startLongitude Longitude for the start location
 * @param {Subway[]} subways Destination points
 * @returns {Promise<SubwayDistance[]>}
 */
async function getDistanceToSubways(startLatitude: number, startLongitude: number, subways: Subway[]): Promise<SubwayDistance[]> {
    if (startLatitude == null || startLongitude == null) {
        throw new BadRequestError(WalkMeterErrors.BadCoordinates, "Input location is invalid");
    }

    if (subways == null) {
        throw new BadRequestError(WalkMeterErrors.BadDestination, "Input destination list is invalid");
    }

    if (subways.length == 0) {
        return null
    }

    try {
        const sourceLocation = `[${startLongitude},${startLatitude}]`;
        const sourceDestinations = subways.map((s) => `[${s.longitude},${s.latitude}]`).join(",");
        const destinationsIndex = range(subways.length, 1).join(",");
        const request = `
		{
			"locations": [${sourceLocation},${sourceDestinations}],
			"destinations": [${destinationsIndex}],
			"metrics": [
				"distance",
				"duration"
			],
			"sources": [0],
			"units": "m"
		}`;
        const url = `https://api.openrouteservice.org/v2/matrix/foot-walking`;

        log(() => `Retrieving distance to subways for (${startLatitude},${startLongitude})`);
        const apiKey = process.env.openrouteservice_apikey;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                "Authorization": apiKey
            },
            body: request
        });

        if (!response.ok) {
            throw new InternalError(WalkMeterErrors.OpenRouteService, `Network response was not ok: ${response.status} - ${response.statusText}`);
        }

        const responseBody = await response.json();

        const result: SubwayDistance[] = subways.map((subway, index) => {
            const distanceToSubway: SubwayDistance = {
                subway: subway,
                start: { latitude: startLatitude, longitude: startLongitude },
                distanceMeters: responseBody.distances[0][index],
                distanceMinutes: responseBody.durations[0][index] / 60.0,
            }

            return distanceToSubway;
        }).sort((a, b) => a.distanceMinutes - b.distanceMinutes);

        return result;

    } catch (error) {
        if (error instanceof InternalError) {
            throw error;
        }

        logError(() => `Error while retrieving distance to subways for location: (${startLatitude},${startLongitude})`, error);

        throw new InternalError(WalkMeterErrors.GetDistanceToSubwaysGenericError, `Error while retrieving distance to subways for location: (${startLatitude},${startLongitude})`)
    }
}

/**
 * Generates an array of "size" numbers from "startAt"
 * @param {Number} size Max number
 * @param {Number} startAt Min number
 * @returns {Number[]} List of numbers
 */
function range(size: number, startAt: number = 0): number[] {
    return [...Array(size).keys()].map(i => i + startAt);
}