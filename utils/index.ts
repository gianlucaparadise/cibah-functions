const debug = true;

export function log(obj: () => String) {
    if (debug) {
        console.log(obj());
    }
}