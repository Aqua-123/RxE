const { round } = Math;

export const interpolation: Record<InterpolationType, ImageInterpolator> = {
  none: (accessor, [x, y]) => accessor(round(x), round(y))
};
