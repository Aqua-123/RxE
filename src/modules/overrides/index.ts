import { generalOverrides } from "./general";
import { hackOverrides } from "./hack";
import { menuOverrides } from "./menu";
import { profileOverrides } from "./profile";
import { roomclientOverrides } from "./roomclient";
import { windowOverrides } from "./window";

// TODO: is this even used?
export function domOverrides() {
  // things you should never do go here.

  // try to survive the app's poor usage of React
  const rChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(
    node: T
  ): T {
    if (node.parentElement !== this) return node;
    return (rChild as any).call(this, node);
  };
  // potentially add more DOM methods liable to crap out in the web app
}

export function applyOverrides() {
  windowOverrides();
  menuOverrides();
  generalOverrides();
  profileOverrides();
  roomclientOverrides();
  hackOverrides();
}
