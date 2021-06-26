declare module "*.module.scss" {
  const styles: Record<string, string>;
  export default styles;
}

declare module "*.scss" {
  const content: any;
  export default content;
}
