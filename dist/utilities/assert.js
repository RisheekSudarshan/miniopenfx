export function isString(value, options) {
    const allowEmpty = options?.allowEmpty ?? false;
    if (typeof value !== "string")
        return false;
    if (!allowEmpty && value === "")
        return false;
    return true;
}
export function isNumber(value) {
    if (typeof value !== "number")
        return false;
    return true;
}
