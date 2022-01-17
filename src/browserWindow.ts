/* eslint-disable camelcase */
/**
 * Having a userscript ask for API grants has unintended consequences on some environments:
 * - the timing of the script being loaded changes
 * - the script not longer has access to global variables on `window` and must use
 *   the `unsafeWindow` object instead.
 *
 * This attempts to smooth over those. See main.ts "until()" check to solve the timing issue
 */

type AppWindow = Window & {
  MenuReactMicroStatic: typeof MenuReactMicroStatic;
  DashboardClient: typeof DashboardClient;
  App: typeof App;
  RxE: any; // FIXME,
  Comment: typeof __Comment;
};

const browserWindow: AppWindow = <any>(
  /* eslint-disable-next-line no-restricted-globals */
  (typeof unsafeWindow !== "undefined" ? unsafeWindow : window)
);

export default browserWindow;
