// Describes some of the global variables exposed by Emerald Chat
// Flesh out as needed.

// Some fields are added by our modules, and are commented as such

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
    join(id: string | null): void;
    mute(id: number, name?: string, reason?: string): void;
    unmute(id: number): void;
    leave(Id: string | null): void;
    muted: number[];
    play_sound(url: string): void;
    typing: number | null;
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


declare class ModPanel extends React.Component { }

declare type MessageData = {
  messages: string[];
  picture?: null | EmeraldPicture;
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
    sender: EmeraldUser;
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
declare class MessageNotifications extends React.Component<any, {
  data: {
    read: MessageNotificationProps[],
    unread: MessageNotificationProps[]
  }
}> { }


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
  created_at: string,
  data: {
    user: EmeraldUser,
    sender: EmeraldUser,
    content: string
  },
  id: number,
  seen: boolean,
  sender_id: number,
  tier: "friend_request",
  updated_at: string,
  user_id: number
}

declare type NotificationsStateData = {
  read: NotificationProps[],
  unread: NotificationProps[],
  friend_requests: FriendRequest[]
}

declare class Notifications extends React.Component<any, {
  data: NotificationsStateData
}> {
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
  name: string
}

declare type DetailedUserBadge = {
  name: string,
  html: JSX.Element
}

declare type EmptyUserBadge = {
  name?: string,
  html: null
}

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

declare type EmeraldPicture = {
  author_id: number;
  created_at: string;
  description: string | null;
  id: number;
  image: {
    thumb: {
      url: string;
    };
    url: string;
  };
  image_processing: boolean;
  image_tmp: null;
  micropost_id: number | null;
  picture_album_id: number | null;
  temporary: boolean;
  title: string | null;
  updated_at: string;
  url: string;
};

declare const PictureUploader: {
  success: (e: EmeraldPicture) => void;
  onUploaded: (e: EmeraldPicture) => void;
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
    pictures: EmeraldPicture[];
    pictures_count: number;
  }
> {
  load_pictures(): void;
  load_more_button(): JSX.Element | null;
}

declare const RoomClient: null | Room;


declare class Room extends React.Component {
  state: {
    messages_count: number;
    messages: MessageData[];
    id: null | number | string;
    mode: "private" | "channel";
    print: JSX.Element | null;
    print_append: JSX.Element | null;
    typing: string | null;
  };
  switch(e: { id: null | number | string; mode: "private" | "channel" }): void;
  send_picture(picture: EmeraldPicture): void;
  print(elt?: JSX.Element): void;
  print_append(elt?: JSX.Element): void;
  append(e: MessageData, doTyping?: boolean): void; // NOTE: doTyping is our own field
  trim_messages(): void;
  room_input(): JSX.Element;
  scroll(e?: { lock: boolean }): void;
  input(e: KeyboardEvent): void;
  upload_picture(): void;
  received(e: MessageData): void;
  room_messages(className: string): JSX.Element;
  load_messages(r: number): void;
  start_typing(e: EmeraldUser): void;
  stop_typing(): void;
  send(message: string): void;
  process?: (message: string) => string | null;
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
  members: EmeraldUser[];
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
  join(e: any): void;
  body(): JSX.Element;
  channel_button(e: ChannelJsonResponse): JSX.Element;
}
declare const RoomChannelSelectClient: RoomChannelSelect;

declare class RoomChannelMembers extends React.Component<
  any,
  { members: (EmeraldUser | null)[] }
> {
  add_member(e: EmeraldUser): void;
  remove_member(e: EmeraldUser): void;
  body(): JSX.Element | null;
}

declare const RoomChannelMembersClient: {} | RoomChannelMembers;

declare class RoomUserUnit extends React.Component<{ data: EmeraldUser }> {
  body(): JSX.Element;
}

declare class RoomPrivate extends React.Component<
  unknown,
  {
    online: EmeraldUser[];
    offline: EmeraldUser[];
    search: any[];
  }
> { }

declare class Message extends React.Component<{ data: MessageData }> {
  render(): JSX.Element;
  content(): JSX.Element | JSX.Element[];
  process(text: string): JSX.Element | (JSX.Element | string)[] | string;
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
    jumbotron: boolean,
    user: { display_picture: string }
  }
> { }

declare const DashboardClient: null | {
  setState: Function;
};

declare const UserViewGenerator: {
  generate(e: {
    event: { clientX: number, clientY: number, preventDefault(): void }
    user: { karma: number, id: number }
  }): void;
};

declare class UserView extends React.Component<
  any,
  {
    muted: boolean,
    permamuted: boolean | undefined,
    user: EmeraldUser;
  }
> {
  componentDidMount: () => void;
  close: Function;
  view_profile: Function;
  exit_click: (e: MouseEvent) => void;
  bottom: () => JSX.Element;
  top: () => JSX.Element;
  unmute: Function;
  mute: Function;
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

declare class UserProfile extends React.Component<
  any,
  {
    data: {
      friend: boolean;
      // NOTE: This is our own field
      actualFriend: boolean;
      user: EmeraldUser;
      current_user: EmeraldUser;
    };
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
}

declare let UserProfileReact: null | UserProfile;

declare module PushNotifications {
  const idle: Function;
  const send: (name: string, data: { icon: string; body: string }) => void;
}

// yeah. conflicts
declare class __Comment extends React.Component<
  any,
  {
    compact: boolean;
    micropost_data: unknown;
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
> { }

declare class Micropost extends React.Component<any,
  {
    compact: boolean;
    reply: boolean;
    data?: {
      comments: number[];
      liked: boolean;
      likes: unknown[];
      comments_count: number;
      likes_count: number;
      micropost: WallPost;
      wall: unknown; // Wall
      author: EmeraldUser;
      current_user: EmeraldUser,
      subscribed: boolean,
      muted: boolean,
      picture: unknown
    }
  }> { }

declare type FlairProps = {
  data: {
    flair: { color: string },
    string: string
  },
  onClick?(e: _MouseEvent): void
}

declare class Flair extends React.Component<FlairProps> { }

declare class MessagePicture extends React.Component<{
  picture: EmeraldPicture
}> { open_picture(): void; }



declare class Badge extends React.Component<
  { key?: number, badge: UserBadge | null },
  { badge: EmptyUserBadge | DetailedUserBadge | null }
> {
  badges: DetailedUserBadge[]
}