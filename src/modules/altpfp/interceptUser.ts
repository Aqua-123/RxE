import { wrapMethod } from "~src/utils";
import { getDisplayPicture } from "./index";

function necessaryUserProps(user: any): boolean {
  return (
    user &&
    typeof user === "object" &&
    "display_picture" in user &&
    user.display_picture !== undefined &&
    user.bio !== undefined
  );
}

function interceptDebug(target: any, method: any, user: any) {
  const name = target?.constructor?.displayName ?? target?.construct?.name;
  const instance = name ? `${name}.prototype` : `(???)`;
  const methodName = `${method}()`;
  console.warn(`[interceptDebug] ${instance}.${methodName} got user = `, user);
}

export function interceptUsers<T, K extends FunctionKeys<T>>(
  cls: Constructor<T>,
  method: K,
  getUsers: UsersExfil<T, K>
) {
  const target = cls.prototype;

  function wrapper(this: T, ...params: ParametersQ<T[K]>) {
    const users = getUsers(this, ...params);
    users.forEach((user) => {
      if (user === undefined) return;
      if (necessaryUserProps(user))
        user.display_picture = getDisplayPicture(user);
      else interceptDebug(target, method, user);
    });
  }

  wrapMethod(target, method, wrapper, true);
}
