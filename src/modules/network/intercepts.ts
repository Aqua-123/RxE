import { existing, oneOrMore } from "~src/utils";

export type AjaxOpts = JQuery.AjaxSettings<any>;

export type SuccessTransform<T> = (
  t: T,
  txt: JQuery.Ajax.SuccessTextStatus,
  xhr: JQueryXHR
) => Promise<T>;

export type ErrorTransform<T> = (
  xhr: JQueryXHR,
  txt: JQuery.Ajax.ErrorTextStatus,
  message: string
) => Promise<T>;

export type ResponseAlterCallbacks<T> = {
  success: SuccessTransform<T>;
  error: ErrorTransform<T>;
};

function alteredSuccess<T>(
  settings: AjaxOpts,
  { success }: ResponseAlterCallbacks<T>
): JQuery.Ajax.SuccessCallback<any> {
  const successCallbacks = existing(oneOrMore(settings.success));
  const failureCallbacks = existing(oneOrMore(settings.error));

  return (data: T, ...reqctx) => {
    (async () => {
      try {
        const newData = await success(data, ...reqctx);
        successCallbacks.forEach((callback) => callback(newData, ...reqctx));
      } catch (err) {
        const xhr = reqctx[1];
        const message = err instanceof Error ? err.message : "";
        failureCallbacks.forEach((callback) => callback(xhr, "error", message));
      }
    })();
  };
}

function alteredFailure<T>(
  settings: AjaxOpts,
  { error }: ResponseAlterCallbacks<T>
): JQuery.Ajax.ErrorCallback<any> {
  const successCallbacks = existing(oneOrMore(settings.success));
  const failureCallbacks = existing(oneOrMore(settings.error));

  return (xhr, ...errctx) => {
    (async () => {
      try {
        const data = await error(xhr, ...errctx);
        successCallbacks.forEach((callback) => callback(data, "success", xhr));
      } catch (err) {
        if (err instanceof Error) errctx[1] = err.message;
        failureCallbacks.forEach((callback) => callback(xhr, ...errctx));
      }
    })();
  };
}

export function alterResponse<T>(
  settings: AjaxOpts,
  callbacks: Partial<ResponseAlterCallbacks<T>>
) {
  const callbacksComplete: ResponseAlterCallbacks<T> = {
    success: async (data) => data,
    error: async (_, __, message) => {
      throw new Error(message);
    },
    ...callbacks
  };

  settings.success = alteredSuccess(settings, callbacksComplete);
  settings.error = alteredFailure(settings, callbacksComplete);
}

export async function shortCircuit<T>(
  settings: AjaxOpts,
  callback: () => Promise<T>
) {
  const nullXHR = null as any as JQueryXHR;
  try {
    const data = await callback();
    existing(oneOrMore(settings.success)).forEach((success) =>
      success(data, "success", nullXHR)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    // might be missing expected error code properties etc.
    existing(oneOrMore(settings.error)).forEach((error) =>
      error(nullXHR, "error", message)
    );
  }
}
