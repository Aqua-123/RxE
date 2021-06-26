export const crel = <T extends string>(elt: T, obj = {}) => {
  return Object.assign(document.createElement(elt), obj);
};
