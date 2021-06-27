import { isString } from "ts-type-guards";
export const Mode = {
    production: "production",
    development: "development",
};
export function isMode(x) {
    return isString(x) && Object.values(Mode).includes(x);
}
