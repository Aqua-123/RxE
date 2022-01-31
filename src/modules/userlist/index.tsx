// goal:
// - enable various sorts of userlist
// - expose a UI to do that
// - probably move the manual profile open button here.

import React from "react";
import { Preferences, P } from "~src/preferences";
import T from "~src/text";
import browserWindow from "~src/browserWindow";
import { equalsTo, existing, loadCSS, sortBy, sorters } from "~src/utils";
// import { existing, loadCSS } from "~src/utils";
import style from "./style.scss";

function lookup() {
  if (typeof UserViewReact === "undefined") {
    // run a bogus user view to get the right setup
    UserViewGenerator.generate({
      event: {
        preventDefault: () => {
          /* Do nothing */
        },
        clientX: 100,
        clientY: 100
      },
      user: {
        karma: 100,
        id: 2
      }
    });
    if (typeof UserViewReact === "undefined") return;
  }
  /* eslint-disable-next-line no-alert */
  const input = prompt("Enter a user id", `${UserViewReact.state.user.id}`);
  if (input === null) return;
  const id = parseInt(input, 10);
  if (Number.isNaN(id)) return;
  UserViewReact.state.user.id = id;
  UserViewReact.view_profile();
}

function applySort(key: "name.asc" | "name.desc" | "age.asc" | "age.desc") {
  Preferences.set(P.userSort, key);
  if (RoomChannelMembersClient instanceof RoomChannelMembers) {
    RoomChannelMembersClient.setState(RoomChannelMembersClient.state);
  }
}

export function initUserList() {
  RoomChannelMembers.prototype.body = function rcmBody() {
    // eslint-disable-next-line react/no-this-in-sfc
    const { members } = this.state;
    if (!members) return null;

    if (members.length < 1) {
      return (
        <div className="room-component-module">
          <div className="room-user-label">empty</div>
        </div>
      );
    }
    return (
      <div className="room-component-module">
        <div className="room-user-label">
          <button
            className="material-icons navigation-notification-unit lookup-button"
            onClick={lookup}
            type="button"
          >
            face
          </button>
          {`online \u2014 ${members.length}`}
          <div className="navigation-dropdown sort-button">
            <span className="material-icons navigation-notification-unit">
              arrow_drop_down
            </span>
            <div className="navigation-dropdown-content">
              <div>{T.preferences.userSort.label}</div>
              {(["name.asc", "name.desc", "age.asc", "age.desc"] as const).map(
                (key) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                  <li
                    className={
                      Preferences.get(P.userSort) === key ? "selected" : ""
                    }
                    onClick={() => applySort(key)}
                  >
                    {T.preferences.userSort[key]}
                  </li>
                )
              )}
            </div>
          </div>
        </div>
        {existing(members).map((e) =>
          React.createElement(UserUnit, {
            key: e.id,
            data: e
          })
        )}
      </div>
    );
  };
  const rcmSetState = RoomChannelMembers.prototype.setState;

  RoomChannelMembers.prototype.setState = function setState(stateNew) {
    if (!stateNew || !("members" in stateNew)) return;
    if (!this.state.members)
      console.warn("this.state.members is falsy despite declaration");
    const idsPresent = existing(this.state.members ?? []).map(
      (user) => user.id
    );
    const members = existing(stateNew.members);
    const [property, order] = Preferences.get(P.userSort).split(".");
    const sortOrder: SortOrder = order === "asc" ? "asc" : "desc";
    if (property === "age")
      sortBy(members, "id", sorters.numeric, sortOrder, true);
    else sortBy(members, "display_name", sorters.string, sortOrder, true);
    members.forEach((member) => {
      if (!idsPresent.some(equalsTo(member.id)))
        browserWindow.RxE.dispatchEvent("room.userlist", member);
    });
    stateNew.members = members;
    rcmSetState.call(this, stateNew);
  };

  /*
  // Taking reference from previous version of this code cause above one went shwoop my head :)
  RoomChannelMembers.prototype.setState = function setState(e) {
    if (e && "members" in e) {
      const userSort = Preferences.get(P.userSort);
      switch (userSort) {
        default:
        case "name.asc":
          e.members = e.members
            .filter((v) => !!v)
            .sort((a, b) => a!.display_name.localeCompare(b!.display_name));
          break;
        case "name.desc":
          e.members = e.members
            .filter((v) => !!v)
            .sort((a, b) => b!.display_name.localeCompare(a!.display_name));
          break;
        case "age.asc":
          e.members = e.members
            .filter((v) => !!v)
            .sort((a, b) => b!.id - a!.id);
          break;
        case "age.desc":
          e.members = e.members
            .filter((v) => !!v)
            .sort((a, b) => a!.id - b!.id);
          break;
      }
      const previousMembers = this.state.members;
      e.members.forEach((member) => {
        if (
          !previousMembers ||
          !previousMembers.find((pm) => pm!.id === member!.id)
        ) {
          browserWindow.RxE.dispatchEvent("room.userlist", member);
        }
      });
    }
    rcmSetState.call(this, e as any);
  };
  */

  loadCSS(style);
}
