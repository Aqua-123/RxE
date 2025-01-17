/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";
import { P, Preferences } from "~src/preferences";
import {
  accountAgeScaled as userExperience,
  formatSignedAmount,
  loadCSS,
  notNum,
  getUserId
} from "~src/utils";
import { maybeEmbed } from "~src/modules/rendering/richtext/embeds/utils";
// import { wrapLinks } from "~src/modules/rendering/richtext/messagelinks";
import css from "./style.scss";
import { willEmbed } from "~src/modules/rendering/richtext/embeds";
import { desanitizeURL } from "~src/modules/rendering/richtext/linkutils";
import { decodeImage } from "../chat-image/imgur";
import { picture as pic } from "~src/modules/chat/chat-image/image-process";

function getRoomMember(id: number) {
  if (!("state" in RoomChannelMembersClient)) return undefined;
  const { members, members_persistent: membersPersistent } =
    RoomChannelMembersClient.state;
  return (members || membersPersistent).find((user) => user?.id === id);
}

export function fasterAppend(this: Room, messageArr: MessageData[]) {
  const max = this.state.mode === "channel" ? 50 : 5000;
  const { messages } = this.state;
  messageArr.forEach((element) => {
    if (element.messages.length === 0) element.messages.push("");
    if (messages.length > max) messages.shift();
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      getUserId(lastMessage.user) === getUserId(element.user) &&
      !lastMessage.picture &&
      !element.picture &&
      lastMessage.messages.length < 16
    ) {
      const n = lastMessage.messages;
      const r = n[n.length - 1];
      if (element.messages[0] === r) return;
      if (maybeEmbed(r)) messages.push(element);
      messages[messages.length - 1].messages.push(element.messages[0]);
    } else messages.push(element);
  });
  this.setState({ messages });
}

const tag = (tagName: string) => <b style={{ color: "#f00" }}> {tagName} </b>;

function specialTag(user: any) {
  if (user.proxy) return undefined;
  if (user.master) return tag("MASTER");
  if (user.mod) return tag("MOD");
  return undefined;
}

function UserInfo(props: any) {
  const { user, karma, colour, textShadow, timeago } = props;
  return (
    <span className="user-extra">
      <b>({karma})</b>
      {" / "}
      <span
        style={{
          color: colour,
          textShadow,
          whiteSpace: "nowrap"
        }}
      >
        {timeago!}
      </span>
      {specialTag(user)}
    </span>
  );
}

function mapText(this: Message, text: string) {
  const placeholderRemoved = desanitizeURL(text).replace("Image: ", "");
  let className = "text-only";
  if (
    willEmbed(placeholderRemoved) ||
    willEmbed(`https://${placeholderRemoved}`) ||
    decodeImage(placeholderRemoved)
  )
    className = "embed";
  return (
    <div className={className} key={JSON.stringify(text)}>
      {this.process(text)}
    </div>
  );
}

// restrict to only allowed urls
function isSafeUrl(picture: string | null | undefined) {
  if (!picture) return picture;
  const regex =
    /^(data:image\/([a-zA-Z]*);base64,)|(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)$/;
  return regex.test(picture);
}

export function initMessages() {
  loadCSS(css);

  Message.prototype.content = function content() {
    const { data } = this.props;
    const { picture, messages, user } = this.props.data;
    const isSelf = data.isMine || getUserId(user) === getUserId(App.user);
    const imgProtect = Preferences.get(P.imgProtect);
    const urlIsSafe = isSafeUrl(picture);

    const lowKarma = notNum(user)?.temp || (notNum(user)?.karma ?? 0) < 10;
    const pictureWarn = !isSelf && lowKarma && imgProtect;
    const pictureBlock = !urlIsSafe;
    if (picture) {
      if (pictureBlock)
        return (
          <div className="blocked-image">
            <div className="warning-text">
              This image was blocked as it was deemed malicious
            </div>
          </div>
        );
      const pictureToDisplay = pic({ url: picture });
      if (!pictureWarn) return pictureToDisplay;
      return React.createElement(
        "div",
        { className: "image-wrap" },
        React.createElement(
          "a",
          {
            className: "image-warning",
            onClick: this.showImage.bind(this)
          },
          "click here to show image"
        ),
        React.createElement("div", { className: "hidden" }, pictureToDisplay)
      );
    }

    return messages.map((text) => mapText.call(this, text));
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
    const karma = formatSignedAmount(karmaNumeric);
    const imgProtect = Preferences.get(P.imgProtect);
    const lowKarma = notNum(user)?.temp || (notNum(user)?.karma ?? 0) < 10;
    const experience = user ? userExperience(user) : 0;
    const createdAt = user?.created_at && new Date(user?.created_at);
    const timeago =
      createdAt && !Number.isNaN(createdAt.getTime())
        ? $.timeago(createdAt)
        : null;
    const color = `hsl(${experience * 256}, 50%, 50%)`;
    const textShadow = "0.005em 0.005em #FFF5";
    const contentClasses = ["room-component-message-text"];
    const { picture } = this.props.data;
    if (picture) contentClasses.push("ritsu-would-blur-heavy");
    if (muted) contentClasses.push("ritsu-message-hidden");
    const safeDisplayPic =
      user?.display_picture?.startsWith("https://robohash.org/") ||
      user?.display_picture?.startsWith(
        "https://emeraldchat.com/avicons_strict/"
      ) ||
      isSelf;
    const displayPicClasses = ["room-component-message-avatar"];
    if (!safeDisplayPic) displayPicClasses.push("ritsu-would-blur");
    const blockPic = !safeDisplayPic && (muted || (lowKarma && imgProtect));

    const userInfo = user ? (
      <UserInfo
        user={user}
        karma={karma}
        timeago={timeago}
        color={color}
        textShadow={textShadow}
      />
    ) : null;

    const showUserView = (event: React.MouseEvent<HTMLElement, MouseEvent>) =>
      user && UserViewGenerator.generate({ event, user });

    const imgBlocked = (
      <div
        className="material-icons room-component-message-avatar ritsu-avatar-hidden"
        title="User avatar hidden due to image settings"
        onMouseDown={showUserView}
        role="button"
        tabIndex={-1}
      >
        visibility_off
      </div>
    );

    const displayPicture = (
      <img
        className={displayPicClasses.join(" ")}
        alt=""
        src={user?.display_picture}
        onMouseDown={showUserView}
      />
    );

    const userFlair = (
      <div
        className="room-component-flair"
        onMouseDown={showUserView}
        role="button"
        tabIndex={-1}
      >
        <Flair data={flair} />
      </div>
    );

    const reportButton = (
      <div
        className="room-component-report"
        onMouseDown={this.report_type.bind(this)}
        role="button"
        tabIndex={-1}
      >
        <i className="fa fa-warning fa-2x social" />
      </div>
    );

    return (
      <div className="room-component-message-container" data-id={user?.id}>
        <div className="room-component-message-left">
          {blockPic ? imgBlocked : displayPicture}
        </div>
        <div className="room-component-message-right">
          {userFlair}
          <Badge badge={user?.badge ?? null} />
          {Preferences.get(P.showInfo) && userInfo}
          <div className={contentClasses.join(" ")}>
            {muted ? <i>Blocked message</i> : this.content()}
          </div>
        </div>
        {reportButton}
      </div>
    );
  };
  Room.prototype.received = function received(messageData) {
    if (getUserId(messageData.user) === App.user.id || !messageData.messages)
      return;

    App.room.play_sound("/sfx/simple_alert.wav");
    this.append(messageData);
    if (!PushNotifications.idle()) return;
    PushNotifications.send(notNum(messageData.user)?.display_name ?? "", {
      icon: notNum(messageData.user)?.display_picture ?? "",
      body: messageData.messages[0]
    });
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
  if (!messageBlocksState?.length) return;
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
    if (messageLines) {
      while (messageLines && messageLines.length > messages.length)
        messageLines[0].remove();

      // If we removed all of them, don't bother decorating.
      // eslint-disable-next-line no-continue
      if (
        !messageLines ||
        messageLines[0] ||
        !(messageLines[0] as HTMLElement).classList
      )
        return;

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

  function overrideName(e: MessageData) {
    const override = RoomChannelMembersClient?.state?.members_persistent;
    if (!override) return e.user;
    override.forEach((member) => {
      if (member?.id === e.user.id) e.user = member;
    });
    return e.user;
  }

  Room.prototype.room_messages = function roomMessages(
    className = "room-component-messages"
  ) {
    let loadMore = null;
    let emptyMessage: JSX.Element | "" = "";
    let r = 0;
    this.state.messages.forEach((e) => {
      r += e.messages.length;
    });
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
          data.user = overrideName(data);
          if (!data.key) data.key = makeKey();
          return <Message data={data} key={data.key} />;
        })}
        {this.state.print_append}
      </div>
    );
  };
  Room.prototype.append = function append(e) {
    fasterAppend.call(this, [e]);
  };
}

// Hide your typing status in chat
// AKA my first attempt at adding something to RxE
export function hideTyping() {
  if (!Preferences.get(P.hideTyping)) return;
  const arJoin = App.room.join;
  App.room.join = function newArJoin(id) {
    arJoin.call(this, id);
    App.room.client.typing = function noTyping() {};
  };
}
