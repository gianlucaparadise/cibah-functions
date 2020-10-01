import { LatLon } from "./LatLon";

/** An object describing a subway */
export class Subway {
    /** Subway Name */
    name: String;
    /** Latitude value */
    latitude: number;
    /** Longitude value */
    longitude: number;
}

/** An object describing the walking distance to a subway */
export class SubwayDistance {
    /** The Subway */
    subway: Subway;
    /** The coordinates of the starting point */
    start: LatLon;
    /** The distance in meters */
    distanceMeters: number;
    /** The distance in minutes (walking) */
    distanceMinutes: number;
}