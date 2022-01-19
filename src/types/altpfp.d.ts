declare type Vec2 = [number, number];

declare type RGB = [number, number, number];

// type RGBA = [number, number, number, number];

declare type ImageAccessor = (x: number, y: number) => RGB | null;

declare type ImageInterpolator = (
    accessor: ImageAccessor,
    [x, y]: Vec2,
    [dx, dy]: Vec2
) => RGB | null;

declare type Image = HTMLImageElement;

declare type InterpolationType = "none";

declare interface SamplingOptions {
    width: number;
    height: number;
    interpolator: ImageInterpolator;
}

declare type ColourSpaceType = "colour64" | "colour512";

declare interface ColourSpace<T> {
    map(colour: RGB): RGB,
    serialize(colour: RGB): T,
    deserialize(t: T): RGB | null,
    digits: number
}