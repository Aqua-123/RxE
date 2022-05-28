import { generalOverrides } from "./general";
import { hackOverrides } from "./hack";
import { menuOverrides } from "./menu";
import { profileOverrides } from "./profile";
import { roomclientOverrides } from "./roomclient";
import { windowOverrides } from "./window";

export function applyOverrides() {
  windowOverrides();
  menuOverrides();
  generalOverrides();
  profileOverrides();
  roomclientOverrides();
  hackOverrides();
}
