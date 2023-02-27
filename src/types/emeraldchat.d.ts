// Describes some of the global variables exposed by Emerald Chat
// Flesh out as needed.

// Some fields are added by our modules, and are commented as such

type JSXSingleton = string | JSX.Element;
type JSXContent = JSXSingleton | JSXSingleton[];
type JSXOpt = JSX.Element | null;
type JSXSingletonOpt = JSXSingleton | null;
type JSXContentOpt = JSXContent | null;

declare const Cookies: {
  get(key: string): string;
  set(key: string, value: string): void;
};

declare class MuteButton extends React.Component<any, { muted: boolean }> {
  //
}

declare const MuteButtonClient: MuteButton;

declare type EventData = {
  notification_update: boolean;
  message_notification: boolean;
  ban: boolean;
};

declare type EventAction = {
  action: "clear_notifications" | "clear_messages" | string;
};

declare type KarmaRangeFlair = {
  range: [number, number];
  rank: string;
  style: { color: string; background: string };
};
declare interface AppInterface {
  user: EmeraldUser;
  room: {
    id: string;
    client: {
      identifier: string;
      connected(): void;
      disconnected(): void;
      received(e: MessageData): void;
      speak(e: { message?: string; picture?: EmeraldPicture }): void;
      typing(): void;
    };
    join(id: string | number | null): void;
    mute(id: number, name?: string, reason?: string): void;
    unmute(id: number): void;
    leave(Id: string | null): void;
    muted: number[];
    play_sound(url: string): void;
    typing: number | null;
  };
  karma: {
    awards: {};
    data: KarmaRangeFlair[];
    get(id: number): number;
  };
  events: {
    connected: () => void;
    disconnected: () => void;
    received: (e: EventData) => void;
    action: (e: EventAction) => void;
  };
  temp: {
    check: Function;
  };
  params: any;
  webrtc: {
    client: null;
  };
}

declare const App: AppInterface;

declare module ActionCable {
  class Subscriptions {
    reject(id: string): void;
  }
}

declare const UpgradeClient: {
  form: Function;
};

declare class UpgradeAccount {
  signup: Function;
}

declare class ModPanel extends React.Component {}

declare type MessageData = {
  isMine?: Boolean;
  messages: string[];
  picture?: null | string;
  user: EmeraldUser;
  user_connected?: true;
  user_disconnected?: true;
  typing?: true;
  // NOTE: this is our own field
  key?: string;
};

declare type MessageNotificationProps = {
  created_at: string;
  data: {
    user: EmeraldUser;
    sender: null | EmeraldUser;
    message: {
      messages: string[];
      picture: null | EmeraldPicture;
      user: number;
    };
  };
  id: number;
  seen: boolean;
  sender_id: number;
  updated_at: string;
  user_id: number;
};

declare class MessageNotificationUnit extends React.Component<{
  data: MessageNotificationProps;
}> {
  image(): JSX.Element;
}
declare class MessageNotifications extends React.Component<
  any,
  {
    data: {
      read: MessageNotificationProps[];
      unread: MessageNotificationProps[];
    };
  }
> {}

declare type WallPost = {
  author_id: number;
  content: string;
  created_at: string;
  id: number;
  muted: boolean;
  picture_id: null | string;
  pinned: boolean;
  reference_id: null;
  updated_at: string;
  user_id: number;
  wall_id: number;
};

declare type WallComment = {
  author_id: number;
  content: string;
  created_at: string;
  id: number;
  micropost_id: number;
  updated_at: string;
  user_id: null | number;
};

declare type NotificationProps = {
  created_at: string;
  data: {
    unit?: {
      post: WallPost;
      author: EmeraldUser;
      comment: WallComment;
    };
    user: EmeraldUser;
    sender: EmeraldUser;
    content: string;
  };
  id: number;
  seen: boolean;
  sender_id: number;
  tier: "default";
  updated_at: string;
  user_id: number;
};

declare class NotificationUnit extends React.Component<{
  data: NotificationProps | FriendRequest;
}> {
  image(): JSX.Element;
  content(): JSX.Element;
  action(e: _MouseEvent): void;
  friend_request_accept(e: _MouseEvent): void;
  friend_request_reject(e: _MouseEvent): void;
}

declare type FriendRequest = {
  created_at: string;
  data: {
    user: EmeraldUser;
    sender: EmeraldUser;
    content: string;
  };
  id: number;
  seen: boolean;
  sender_id: number;
  tier: "friend_request";
  updated_at: string;
  user_id: number;
};

declare type NotificationsStateData = {
  read: NotificationProps[];
  unread: NotificationProps[];
  friend_requests: FriendRequest[];
};

declare class Notifications extends React.Component<
  any,
  {
    data: NotificationsStateData;
  }
> {
  update(): string;
  click(): void;
  badge(): JSX.Element | null;
}

declare const NotificationsReact: Notifications;

declare type Friend = {
  created_at: string;
  data: EmeraldUser;
};
declare class FriendUnit extends React.Component<Friend> {
  body(): JSX.Element;
}

declare class SearchUnit extends React.Component<{ data: EmeraldUser }> {
  body(): JSX.Element;
}

declare class UserUnit extends React.Component<{ data: EmeraldUser }> {
  body(): JSX.Element;
}

declare type UserBadge = {
  name: string;
};

declare type DetailedUserBadge = {
  name: string;
  html: JSX.Element;
};

declare type EmptyUserBadge = {
  name?: string;
  html: null;
};

declare type BadgeStore = DetailedUserBadge[];

declare type EmeraldUser = {
  badge: UserBadge | null;
  badges: string[];
  bio: string;
  created_at: string;
  display_name: string;
  display_picture: string;
  email?: string;
  flair: {
    color: string;
  };
  gender: string;
  gold: boolean;
  id: number;
  interests: string[];
  karma: number;
  // NOTE: This is our own field
  _karma: number;
  master: boolean;
  mod: boolean;
  online: boolean;
  username: string;
  verified: boolean;
  temp?: boolean;
  // NOTE: This is our own field
  proxy?: boolean;
  // NOTE: This is our own field
  delta: number;
};

declare type ProfileData = {
  friend: boolean;
  // NOTE: This is our own field
  actualFriend: boolean;
  user: EmeraldUser;
  current_user: EmeraldUser;
  friend_request_sent: boolean;
  wall_id: number;
};

declare type ProileJson = {
  user: EmeraldUser;
  friend_request_sent: boolean;
  friend: boolean;
  current_user: EmeraldUser;
  subscribed: boolean;
  room_id: number;
  wall_id: number;
};

declare type EmeraldPicture =
  | {
      url: string;
    }
  | string;

declare type EmeraldPictureDetailed = {
  author_id: number; // unused
  created_at: string; // unused
  description: string | null; // unused
  id: number; // likely unused
  image: {
    thumb: {
      url: string;
    };
    url: string;
  };
  // unused
  image_processing: boolean; // unused
  image_tmp: null; // unused
  micropost_id: number | null; // unused
  picture_album_id: number | null; // unused
  temporary: boolean; // unused
  title: string | null; // unused
  updated_at: string; // unused
  url: string;
};

declare const PictureUploader: {
  success: (e: EmeraldPictureDetailed) => void;
  onUploaded: (e: EmeraldPictureDetailed) => void;
};

declare class PictureAlbum extends React.Component<
  { data: { current_user: EmeraldUser; id: number } },
  {
    album: {
      created_at: string;
      id: number;
      party_id: null | number;
      updated_at: string;
      user_id: number;
    };
    edit: boolean;
    loaded: boolean;
    pictures: EmeraldPictureDetailed[];
    pictures_count: number;
  }
> {
  load_pictures(): void;
  load_more_button(): JSX.Element | null;
  pictures(): JSX.Element[];
  picture_settings(t: EmeraldPictureDetailed): JSX.Element | null;
  set_display_picture(t: EmeraldPictureDetailed): void;
  delete_picture(t: EmeraldPictureDetailed): void;
  add_to_album(): void;
  upload_picture(): void;
}

declare class PictureUpload extends React.Component<
  {},
  { failureReason?: string }
> {
  uploadImage?(): void; // custom
  body(): void;
  close(): void;
}
declare const RoomClient: null | Room;
declare class MessagePictureUpload extends React.Component<{}> {
  handleSubmit(e: { preventDefault: () => void }): void;
  body(): JSX.Element;
  uploadImage?(): void; // custom
}

declare class ActionTray extends React.Component<{}> {
  pictureModeration(): void;
}
declare class Room extends React.Component<// add props
{
  data: { id: number };
}> {
  state: {
    messages_count: number;
    messages: MessageData[];
    id: null | number | string;
    mode: "private" | "channel" | "match" | "match_video" | "match_voice";
    print: JSX.Element | null;
    print_append: JSX.Element | null;
    typing: string | null;
    last_message: string | null;
  };
  componentDidMount(): void;
  switch(e: { id: null | number | string; mode: "private" | "channel" }): void;
  send_picture(picture: EmeraldPicture): void;
  sendRitsuPicture?(id: RitsuChatImage): void; // custom
  print(elt?: JSX.Element): void;
  print_append(elt?: JSX.Element): void;
  append(e: MessageData, doTyping?: boolean): void; // NOTE: doTyping is our own field
  prepend(e: MessageData): void; // NOTE: doTyping is our own field
  trim_messages(): void;
  room_input(): JSX.Element;
  scroll(e?: { lock?: boolean }): void;
  input(e: React.KeyboardEvent<HTMLTextAreaElement>): void;
  upload_picture(): void;
  received(e: MessageData): void;
  room_messages(className: string): JSX.Element;
  load_messages(r: number): void;
  start_typing(e: EmeraldUser): void;
  stop_typing(): void;
  send(message: string): void;
  process?: (message: string) => string | null;
  updated(e: ChannelJsonResponse): void;
  clear_print(): void;
  voice_connect(e: ChannelJsonResponse): void;
  voice_disconnect(): void;
  expand(e: boolean): void;
  disconnected(e: AppInterface): void;
  clear_messages(): void;
}

declare class MatchMenu extends React.Component<{
  data: {
    queue: string;
  };
}> {
  body(): JSX.Element;
}
declare type EmeraldChannel = {
  capacity: number;
  channel_type: "text" | "voice";
  created_at: string;
  description: string;
  id: number;
  messages: MessageData[];
  min_karma: null | number;
  name: string;
  owner_id: null | number;
  private: null | boolean;
  rules: string;
  updated_at: string;
};

declare type ChannelJsonResponse = {
  channel: EmeraldChannel;
  members: (EmeraldUser | null)[];
  messages: MessageData[];
};

declare class RoomChannelSelect extends React.Component<
  any,
  {
    cached_messages: Record<any, any>;
    current_channel: EmeraldChannel;
    expanded: boolean;
    text_channels: Array<ChannelJsonResponse>;
    voice_channels: Array<ChannelJsonResponse>;
  }
> {
  join(e: ChannelJsonResponse): void;
  body(): JSX.Element;
  channel_button(e: ChannelJsonResponse): JSX.Element;
  voice_disconnect(): void;
  expand(): void;
}
declare const RoomChannelSelectClient: RoomChannelSelect;

declare class RoomChannelMembers extends React.Component<
  any,
  {
    members: (EmeraldUser | null)[];
    members_persistent: (EmeraldUser | null)[];
  }
> {
  add_member(e: EmeraldUser): void;
  remove_member(e: EmeraldUser): void;
  body(): JSX.Element | null;
}

declare const RoomChannelMembersClient: RoomChannelMembers;

declare class RoomUserUnit extends React.Component<{ data: EmeraldUser }> {
  body(): JSX.Element;
}

declare class RoomPrivate extends React.Component<
  unknown,
  {
    online: (EmeraldUser | null)[];
    offline: (EmeraldUser | null)[];
    search: any[];
  }
> {}

declare class Message extends React.Component<{ data: MessageData }> {
  content(): JSXContent;
  showImage(): JSXContent;
  process(text: string): JSXContentOpt;
}

declare class MenuMicro extends React.Component {
  close(): void;
}

declare class MenuMicroStatic extends React.Component {
  close(): void;
}

declare const MenuReactMicro: MenuMicro;

declare const MenuReactMicroStatic: null | MenuMicro;

declare class Menu extends React.Component {
  close: Function;
}

declare const MenuReact: Menu;

declare class Dashboard extends React.Component<
  any,
  {
    jumbotron: boolean;
    user: { display_picture: string };
  }
> {
  ads(): JSX.Element;
}

declare const DashboardClient: null | {
  setState: Function;
};

declare const UserViewGenerator: {
  generate(e: {
    event: { clientX: number; clientY: number; preventDefault(): void };
    user: EmeraldUser;
  }): void;
};

declare class UserView extends React.Component<
  any,
  {
    muted: boolean;
    permamuted: boolean | undefined;
    user: EmeraldUser;
  }
> {
  componentDidMount: () => void;
  close(): void;
  report_user(): void;
  view_profile: Function;
  exit_click: (e: MouseEvent) => void;
  bottom: () => JSX.Element;
  top: () => JSX.Element;
  unmute: Function;
  mute: Function;
  switch: Function;
  message: Function;
  mod_button: Function;
  permamute: Function;
  permaunmute: Function;
}

declare let UserViewReact: undefined | UserView;

declare class Popup extends React.Component {
  close: Function;
}
declare class Picture extends React.Component<{ data: { src: string } }> {
  close: Function;
}

declare class FriendsMenu extends React.Component<
  any,
  {
    friends: EmeraldUser[];
    count: number;
    skippedMissing?: number; // custom field
  }
> {
  componentDidMount(): void;
  load_friends(): void;
  scroll(): void;
}

declare type FriendsJson = {
  friends: EmeraldUser[];
  count: number;
};

declare class UserProfile extends React.Component<
  any,
  {
    data: ProfileData;
    compact_bio: boolean;
    tab: "feed" | "info" | "pictures";
  }
> {
  profile_buttons: Function;
  switch(id: number): void;
  close(): void;
  update_profile_picture(): void;
  profile_picture(): JSX.Element;
  load(id: number): void;
  top(): JSX.Element;
  bottom(): JSX.Element;
  bio(): JSX.Element;
  bio_expand(): void;
  tabs(): JSX.Element;
  switch_tab(tab_name: string): void;
  online_icon(): JSX.Element;
  profile_settings(): JSX.Element;
}

declare let UserProfileReact: null | UserProfile;

declare module PushNotifications {
  const idle: Function;
  const send: (name: string, data: { icon: string; body: string }) => void;
  var request_permission: Function;
}

// yeah. conflicts
declare class __Comment extends React.Component<
  any,
  {
    compact: boolean;
    micropost_data: MicropostData;
    comment_data?: {
      user: EmeraldUser;
      likes_count: number;
      liked: boolean;
      comment: WallComment;
    };
    deleted: boolean;
    reply: boolean;
    sub_comments: unknown[];
  }
> {
  content(): JSX.Element | null;
  more(): void;
  youtube_process(text: string): JSX.Element;
  write_comment(): void;
  comment_input(): JSX.Element;
}

declare class Microposts extends React.Component<
  {
    data: ProfileData;
  },
  {
    initialized: boolean;
    // microposts
    data: {
      microposts: number[];
    } | null;
  }
> {
  micropost_input(event: React.KeyboardEvent<HTMLInputElement>): void;
  scroll_bottom(): void;
}

declare type MicropostData = {
  comments: number[];
  liked: boolean;
  likes: unknown[];
  comments_count: number;
  likes_count: number;
  micropost: WallPost;
  wall: WallComment; // Wall
  author: EmeraldUser;
  current_user: EmeraldUser;
  subscribed: boolean;
  muted: boolean;
  picture: unknown;
};

declare class Micropost extends React.Component<
  {
    key: number;
    data: {
      id: number;
      wall_id?: number;
    };
  },
  {
    compact: boolean;
    reply: boolean;
    deleted: boolean;
    error: boolean;
    data?: {
      comments: number[];
      liked: boolean;
      likes: unknown[];
      comments_count: number;
      likes_count: number;
      micropost: WallPost;
      wall: unknown; // Wall
      author: EmeraldUser;
      current_user: EmeraldUser;
      subscribed: boolean;
      muted: boolean;
      picture: unknown;
    };
    micropost_data: MicropostData;
    comment_data: {
      comment: WallComment;
      user: EmeraldUser;
      liked: boolean;
      likes_count: number;
    };
  }
> {
  show_comment_input: Function;
  write_comment: Function;
  content(): JSX.Element | null;
  more(): void;
  youtube_process(text: string): JSX.Element;
  comment_input(event: React.KeyboardEvent<HTMLInputElement>): void;
  // micropost_input(event: React.KeyboardEvent<HTMLInputElement>): void;
}

declare type FlairProps = {
  data: {
    flair: { color: string };
    string: string;
  };
  onClick?(e: _MouseEvent): void;
};

declare class Flair extends React.Component<FlairProps> {}

declare class MessagePicture extends React.Component<{
  picture: EmeraldPicture;
}> {
  open_picture(): void;
}

declare class Badge extends React.Component<
  { key?: number; badge: UserBadge | null },
  { badge: EmptyUserBadge | DetailedUserBadge | null }
> {
  badges: DetailedUserBadge[];
}

declare type EmeraldComment = {
  comment: {
    id: number;
    content: string;
    micropost_id: number;
    user_id?: number;
    author_id: number;
    created_at: string;
    updated_at: string;
  };
};

declare type EmeraldMicropost = {
  micropost: {
    id: number;
    content: string;
    user_id: number;
    wall_id: number;
    created_at: string;
    updated_at: string;
    author_id: number;
    muted: boolean;
    picture_id: number;
    reference_id: number;
    pinned: boolean;
  };
};

declare type PrivateMessageArray = {
  user: EmeraldUser;
  picture: string | null;
  messages: string[];
};
declare type PrivateMessage = {
  messages: MessageData[];
  messages_count: number;
};

declare class LikeButton extends React.Component<{
  data: { liked: boolean; value: number; id: number; class?: string };
}> {}
declare class BR extends React.Component<{
  children: React.ReactNode;
}> {}

declare type UserWall = {
  id: number;
  user_id: number;
  app_id: number;
  party_id: number;
  picture_id: number;
  created_at: string;
  updated_at: string;
};

declare type MicropostJson = {
  comments: [];
  liked: boolean;
  likes: [];
  comments_count: 0;
  likes_count: 1;
  micropost: WallPost;
  wall: UserWall;
  author: EmeraldUser;
  current_user: EmeraldUser;
  subscribed: boolean;
  muted: boolean;
  picture: boolean;
};

declare class CommentSettings extends React.Component<{ parent: __Comment }> {
  close(): void;
  authorized(): boolean;
  delete(): void;
  open(): void;
}
