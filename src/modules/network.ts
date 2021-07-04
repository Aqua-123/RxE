import { P, Preferences } from "~src/preferences";

function isFunction<T>(f: Function | T): f is Function {
  return typeof f === "function";
}

export function initNetwork() {
  if (!FEATURES.HACKS) return;
  const $ajax = $.ajax;
  $.ajax = ((settings?: JQuery.AjaxSettings<any> | undefined) => {
    if (!settings) return $ajax(settings);
    const { success } = settings;
    if (!isFunction(success)) return $ajax(settings);
    switch (settings.url) {
      case "/user_is_temp":
        success(
          { status: false, temp: false },
          "success",
          null as unknown as JQuery.jqXHR
        );
        return undefined;
      default: {
        const modifiedOptions = {
          ...settings,
          success: (
            e: any,
            txt: JQuery.Ajax.SuccessTextStatus,
            xhr: JQuery.jqXHR
          ) => {
            if (
              Preferences.get(P.universalFriend!) &&
              settings.url?.startsWith("/profile_json?")
            ) {
              e.actualFriend = e.friend;
              e.friend = true;
            }
            success(e, txt, xhr);
          }
        };
        return $ajax(modifiedOptions);
      }
    }
  }) as any;
}

// export function addAjaxRequestMiddleware(
//   fn: (settings: JQuery.AjaxSettings<any>) => any | void
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
