import React from "react";
import ReactDOM from "react-dom";
import { P, Preferences } from "~src/preferences";

export function applyOverrides() {
  // avoid filling up the console with sad errors
  if (!MenuReactMicroStatic) {
    (window as any).MenuReactMicroStatic = {
      close: () => MenuReactMicro?.close()
    };
  }
  if (!DashboardClient) {
    (window as any).DashboardClient = {
      setState: () => {}
    };
  }

  function unmountComponent(c: React.Component) {
    if ((c as any).updater.isMounted(c)) {
      const node = ReactDOM.findDOMNode(c);
      if (node) {
        ReactDOM.unmountComponentAtNode(node.parentNode as Element);
      }
    }
  }

  Menu.prototype.close = function () {
    $(".ui-bg").removeClass("animated fadeIn"),
      $(".ui-bg").addClass("animated fadeOut"),
      $(".ui-menu").addClass("animated zoomOut"),
      setTimeout(unmountComponent.bind(null, this), 250);
  };

  MenuMicro.prototype.close = function () {
    $("#menu-micro-bg").removeClass("animated fadeIn"),
      $("#menu-micro-bg").addClass("animated fadeOut"),
      $("#menu-micro").addClass("animated zoomOut"),
      setTimeout(unmountComponent.bind(null, this), 250);
  };
  UserView.prototype.close = function () {
    document.removeEventListener("mousedown", this.exit_click, false);
    unmountComponent(this);
  };
  Popup.prototype.close = function () {
    unmountComponent(this);
  };

  if (FEATURES.HACKS) hackOverrides();
}

function hackOverrides() {
  if (!FEATURES.HACKS) return;
  let user = App.user || {};
  Object.defineProperty(App, "user", {
    set: (e) => (user = e),
    get: () => ({
      ...user,

      ...(Preferences.get(P.superTemp!)
        ? {
            temp: false,
            karma: 31337
          }
        : {}),
      ...(Preferences.get(P.enableModUI!)
        ? {
            master: true,
            mod: true
          }
        : {})
    })
  });

  ModPanel.prototype.componentDidMount = function () {
    this.setState({ tab: "default" });
  };
}
