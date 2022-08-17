import { P, Preferences } from "~src/preferences";
import { getUserId, wrapMethod } from "~src/utils";
import { extractBioImage } from "./bio-image";
import { unpackImage } from "./formats";

const GEM_AVICON = "https://emeraldchat.com/avicons_strict/1.png";
const ROBOHASH_URL = (id: number | undefined) =>
  `https://robohash.org/yay${id}.png?set=set4`;
export function getDisplayPicture(user: Partial<EmeraldUser>): string {
  const lowKarma = (user._karma ?? user.karma ?? 0) < 10;
  const isEmeUpload = user?.display_picture?.includes(
    "emeraldchat.com/uploads"
  );
  const fallback =
    !isEmeUpload || lowKarma ? ROBOHASH_URL(user.id) : user.display_picture!;
  const isSelf = getUserId(App.user) === getUserId(user as EmeraldUser);
  if (lowKarma && !isSelf && Preferences.get(P.imgProtect)) return GEM_AVICON;
  if (user.bio === undefined) {
    console.warn("user.bio is undefined");
    return fallback;
  }
  const imageCompressed = extractBioImage(user.bio);
  if (!imageCompressed) return fallback;
  const imageUnpacked = unpackImage(imageCompressed);
  return imageUnpacked || fallback;
}

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
