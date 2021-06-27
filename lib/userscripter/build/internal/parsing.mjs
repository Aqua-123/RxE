export function enumParser(typeGuard) {
    return (input) => (typeGuard(input)
        ? { kind: "valid", value: input }
        : { kind: "invalid", input: input });
}
export function booleanParser(input) {
    return (input === "true"
        ? { kind: "valid", value: true }
        : (input === "false"
            ? { kind: "valid", value: false }
            : { kind: "invalid", input: input }));
}
export function urlParser(input) {
    try {
        return { kind: "valid", value: new URL(input).toString() };
    }
    catch (_) {
        return { kind: "invalid", input: input };
    }
}
