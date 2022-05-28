import window from "~src/browserWindow";

/**
 * Overrides for the whole window,
 * prevent console from filling with sad React errors
 */
export function windowOverrides() {
  if (!window.MenuReactMicroStatic) {
    window.MenuReactMicroStatic = {
      close: () => MenuReactMicro?.close()
    } as MenuMicro;
  }
  if (!window.DashboardClient) {
    window.DashboardClient = {
      setState: () => {}
    };
  }

  $(window)
    .off("resize")
    .on("resize", () => {
      const resp = document.getElementById("messages");
      if (resp) resp.scrollTop = resp.scrollHeight;
    });

  // non-hack: "Sign up to continue" only shows once at start
  App.temp.check = () => {};
}
