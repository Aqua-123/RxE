import { Preferences } from "~src/preferences";
import { alterResponse, shortCircuit, AjaxOpts } from "./intercepts";
import { PX } from "~src/x/preferences";
import { expectResponse, networkStatusAlert, responseReceived } from "./status";

// eslint-disable-next-line no-shadow
enum DoSendRequest {
  AbortRequest,
  SendRequest
}

function interceptAjax(url: string, settings: AjaxOpts): DoSendRequest {
  const { SendRequest, AbortRequest } = DoSendRequest;
  if (!FEATURES.HACKS) return SendRequest;

  if (url === "/user_is_temp") {
    shortCircuit(settings, async () => ({ status: false, temp: false }));
    return AbortRequest;
  }

  if (
    Preferences.get(PX?.universalFriend!) &&
    url.startsWith("/profile_json?")
  ) {
    alterResponse<ProfileData>(settings, {
      async success(user) {
        user.actualFriend = user.friend;
        user.friend = true;
        return user;
      }
    });
  }

  return SendRequest;
}

function addNetworkMonitor(settings: AjaxOpts) {
  expectResponse();
  alterResponse(settings, {
    async success(data) {
      responseReceived();
      return data;
    },
    async error(_, __, message) {
      responseReceived();
      throw new Error(message);
    }
  });
}

export function initNetwork() {
  const $ajax = $.ajax;
  function ajax(
    arg1: AjaxOpts | undefined | string,
    arg2: AjaxOpts | undefined
  ) {
    const settings = typeof arg1 === "string" ? { ...arg2, url: arg1 } : arg1;
    if (settings?.url === undefined) return $ajax(settings);
    if (interceptAjax(settings.url, settings) !== DoSendRequest.SendRequest)
      return undefined;
    addNetworkMonitor(settings);
    return $ajax({
      ...settings
    });
  }
  $.ajax = ajax as any;

  networkStatusAlert.addEventListener("connected", () => {
    document.documentElement.classList.remove("network-unavail");
  });

  networkStatusAlert.addEventListener("disconnected", () => {
    document.documentElement.classList.add("network-unavail");
  });
}

// export function addAjaxRequestMiddleware(
//   fn: (settings: AjaxOpts) => any | void
// ) {
//   $(document).ajaxSend((event, xhr, options) => {
//     const action = fn(options);
//     if (action) {
//       xhr.abort();
//       if (options.success) {
//         const success =
//           typeof options.success === "function"
//             ? [options.success]
//             : options.success;
//         success.forEach(f => f(action, "success", xhr));
//       }
//     }
//   });
// }

// export function addAjaxResponseMiddleware(
//   fn: (
//     event: JQuery.TriggeredEvent,
//     xhr: JQuery.jqXHR,
//     settings: JQuery.AjaxSettings
//   ) => void
// ) {
//   $(document).ajaxSuccess(fn);
// }

// export function initNetwork() {
//   addAjaxRequestMiddleware(settings => {
//     if (settings.url === "/user_is_temp") {
//       return { status: false, temp: false };
//     }
//   });

//   addAjaxResponseMiddleware((event, xhr, settings) => {
//     if (settings.url?.startsWith("/profile_json?")) {
//       xhr.responseJSON.friend = true;
//     }
//   });
// }
