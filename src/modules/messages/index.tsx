/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";
import { P, Preferences } from "~src/preferences";
import {
  accountAgeScaled as userExperience,
  existing,
  formatSignedAmount,
  loadCSS,
  notNum,
  getUserId
} from "~src/utils";
import { wrapLinks } from "~src/modules/richtext/messagelinks";
import css from "./style.scss";

function getRoomMember(id: number) {
  if (!("state" in RoomChannelMembersClient)) return undefined;
  return existing(RoomChannelMembersClient.state.members).find(
    (user) => user.id === id
  );
}

export function initMessages() {
  loadCSS(css);
  Message.prototype.content = function content() {
    const { picture, messages, user } = this.props.data;
    const isSelf = getUserId(this.props.data.user) === getUserId(App.user);
    const imgProtect = Preferences.get(P.imgProtect);
    const lowKarma = notNum(user)?.temp || (notNum(user)?.karma ?? 0) < 10;
    const pictureBlocked = !isSelf && lowKarma && imgProtect;
    if (picture && !pictureBlocked) return <MessagePicture picture={picture} />;
    if (picture) return [<div>(Image blocked) {wrapLinks(picture.url, rest => rest)}</div>]
    return messages.map((text) => (
      <div key={JSON.stringify(text)}>{this.process(text)}</div>
    ));
  };

  Message.prototype.render = function render() {
    if (!this.props.data.user)
      console.warn("this.props.data.user may be falsy despite declaration");
    const user =
      (getRoomMember(getUserId(this.props.data.user)) ||
        notNum(this.props.data.user)) ??
      null;
    const isSelf = getUserId(this.props.data.user) === getUserId(App.user);
    let muted = false;
    if (App.room.muted.includes(getUserId(user))) muted = true;
    try {
      const regexSource = Preferences.get(P.muteRegexes)[0];
      if (regexSource && user?.display_name) {
        const { source, flags } = regexSource;
        const muteRegex = new RegExp(source, flags);
        const emptyRegex = ["", "(?:)"].includes(source);
        if (muteRegex.test(user.display_name) && !emptyRegex) muted = true;
      }
    } catch (_) {
      /* Do nothing */
    }
    const flair = {
      string: user?.display_name?.trim() || "(no name)",
      flair: user?.flair ?? { color: "" }
    };
    const karmaNumeric = user?._karma ?? user?.karma ?? 0;
    const karmaLow = karmaNumeric < 10;
    const karma = formatSignedAmount(karmaNumeric);
    const experience = user ? userExperience(user) : 0;
    const createdAt = user?.created_at && new Date(user?.created_at);
    const timeago =
      createdAt && !Number.isNaN(createdAt.getTime())
        ? $.timeago(createdAt)
        : null;
    const color = `hsl(${experience * 256}, 50%, 50%)`;
    const textShadow = "0.005em 0.005em #FFF5";
    const contentClasses = ["room-component-message-text"];
    const picture = this.props.data.picture;
    if (picture) contentClasses.push("ritsu-would-blur-heavy");
    if (muted) contentClasses.push("ritsu-message-hidden");
    const safeDisplayPic = user?.display_picture?.startsWith("https://robohash.org/") ||
      user?.display_picture?.startsWith("https://emeraldchat.com/avicons_strict/") ||
      isSelf;
    const displayPicClasses = ["room-component-message-avatar"];
    if (!safeDisplayPic) displayPicClasses.push("ritsu-would-blur");
    return (
      <div className="room-component-message-container" data-id={user?.id}>
        <div className="room-component-message-left">
          <img
            className={displayPicClasses.join(" ")}
            alt="User display avatar"
            src={user?.display_picture}
            onMouseDown={(event) =>
              user && UserViewGenerator.generate({ event, user })
            }
          />
        </div>
        <div className="room-component-message-right">
          <div className="room-component-flair">
            <Flair data={flair} />
          </div>
          <Badge badge={user?.badge ?? null} />
          {Preferences.get(P.showInfo) && !!user && (
            <span className="user-extra">
              {karmaLow && isSelf ? (
                <b title="Your profile picture and images might not be visible to others due to low karma.">
                  (<span style={{ color: "#f66" }}>{karma}</span>)
                </b>
              ) : (
                <b>({karma})</b>
              )}

              {" / "}
              <span style={{ color, textShadow, whiteSpace: "nowrap" }}>
                {timeago!}
              </span>
              {user.master && !user.proxy && (
                <b style={{ color: "#f00" }}> CALLAN </b>
              )}
              {user.mod && !user.proxy && (
                <b style={{ color: "#f00" }}> MOD </b>
              )}
            </span>
          )}
          <div className={contentClasses.join(" ")}>
            {muted ? <i>Blocked message</i> : this.content()}
          </div>
        </div>
      </div>
    );
  };
  Room.prototype.received = function received(e) {
    if (getUserId(e.user) !== App.user.id && e.messages) {
      App.room.play_sound("/sfx/simple_alert.wav");
      this.append(e, true);
      if (PushNotifications.idle()) {
        PushNotifications.send(notNum(e.user)?.display_name ?? "", {
          icon: notNum(e.user)?.display_picture ?? "",
          body: e.messages[0]
        });
      }
    } else if (e.typing) {
      if (getUserId(e.user) !== App.user.id) {
        this.setState({ typing: notNum(e.user)?.display_name });
        setTimeout(() => this.stop_typing(), 1e4);
      }
    }
  };
}

/**
 * Keeping this to clean up a bug where the react tree ends up with
 * leftover <div> that don't go away.
 */
export function decorateMessages() {
  const messageBlocks = document.querySelectorAll(
    ".room-component-message-container"
  );
  const messageBlocksState = RoomClient?.state?.messages;
  if (messageBlocksState?.length) {
    for (let i = 0; i < messageBlocksState.length; i += 1) {
      const messageBlock = messageBlocks[i]?.querySelector(
        ".room-component-message-text"
      );

      if (
        !messageBlock ||
        messageBlock.classList.contains("ritsu-message-hidden")
      )
        // eslint-disable-next-line no-continue
        continue;

      const { messages } = messageBlocksState[i];
      const messageLines = messageBlock.childNodes;

      // Remove extra messages.
      while (messageLines && messageLines.length > messages.length) {
        messageLines[0].remove();
      }

      // If we removed all of them, don't bother decorating.
      // eslint-disable-next-line no-continue
      if (!messageLines) continue;

      // Mark as jumbo emoji in limited circumstances.
      if (
        Preferences.get(P.bigEmoji) &&
        messages.length === 1 &&
        /^\p{Extended_Pictographic}{1,5}$/u.test(messages[0])
      ) {
        (messageLines[0] as HTMLElement).classList.add("jumbo-message");
      } else {
        (messageLines[0] as HTMLElement).classList.remove("jumbo-message");
      }
    }
  }
}

const makeKey = (() => {
  let i = 0;
  // eslint-disable-next-line no-plusplus
  return () => `key-${++i}`;
})();

export function betterMessageRendering() {
  // message rendering is weird and slow.
  // trying to select text in the chat breaks whenever a new message appears.
  // 3 forced layout and repaints happen per messages.

  Room.prototype.room_messages = function roomMessages(
    className = "room-component-messages"
  ) {
    let loadMore = null;
    let emptyMessage: JSX.Element | "" = "";
    let r = 0;
    for (let a = 0; a < this.state.messages.length; a += 1) {
      r += this.state.messages[a].messages.length;
    }
    if (this.state.messages_count > r && this.state.messages.length > 0) {
      loadMore = (
        <div
          role="button"
          tabIndex={0}
          onMouseDown={() => this.load_messages(r)}
          className="room-component-load-button"
        >
          Load More ({r} of {this.state.messages_count})
        </div>
      );
    }
    if (this.state.mode === "private" && this.state.messages.length < 1) {
      emptyMessage = (
        <div className="room-notification">
          No messages here yet. Start a conversation!
        </div>
      );
    }
    if (
      RoomChannelSelectClient.state &&
      this.state.mode === "channel" &&
      this.state.messages.length < 1
    ) {
      emptyMessage = (
        <div className="room-notification">No messages here yet!</div>
      );
    }
    return (
      <div id="messages" className={className}>
        <MuteButton />
        {this.state.print}
        {emptyMessage}
        {loadMore}
        {this.state.messages.map((data) => {
          if (!data.key) {
            data.key = makeKey();
          }
          return <Message data={data} key={data.key} />;
        })}
        {this.state.print_append}
      </div>
    );
  };

  Room.prototype.append = function append(e, doTyping) {
    // For some reason, pictures we send don't render for ourselves initially.
    // Setting e.messages to [""] fixes that, although I don't know why yet.
    if (e.messages.length === 0) e.messages.push("");
    // inline trim_message and append here to avoid extra .setState()/renders
    const max = this.state.mode === "channel" ? 50 : 5000; // original= 50: 5000
    const { messages } = this.state;
    if (messages.length > max) messages.shift();
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      getUserId(lastMessage.user) === getUserId(e.user) &&
      !lastMessage.picture &&
      !e.picture &&
      lastMessage.messages.length < 16
    ) {
      const n = lastMessage.messages;
      const r = n[n.length - 1];
      if (e.messages[0] === r) return;
      lastMessage.messages.push(e.messages[0]);
    } else messages.push(e);
    // inline typing check here.
    let { typing } = this.state;
    if (doTyping) {
      if (e.typing) {
        if (getUserId(e.user) !== App.user.id) {
          typing = notNum(e.user)?.display_name || "";
          setTimeout(() => this.stop_typing(), 1e4);
        }
      } else {
        typing = null;
        App.room.typing = null;
      }
    }
    this.setState({
      messages,
      typing
    });
  };
}
