// Describes some of the global variables exposed by Emerald Chat
// Flesh out as needed.

// Some fields are added by our modules, and are commented as such

declare const Cookies: {
  get(key: string): string;
  set(key: string, value: string): void;
};

declare const MuteButtonClient: {
  state: {
    muted: boolean;
  };
};

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
      received(e: {
        user: EmeraldUser;
        user_connected?: true;
        user_disconnected?: true;
        typing?: true;
        messages?: string[];
        picture?: null | EmeraldPicture;
      }): void;
    };
    join(id: string | null): void;
    mute(id: number): void;
    unmute(id: number): void;
    muted: number[];
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

declare class ModPanel extends React.Component {}

declare type MessageData = {
  messages: string[];
  picture?: null | EmeraldPicture;
  user: EmeraldUser;
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
    unit: {
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
  data: NotificationProps;
}> {
  image(): JSX.Element;
}

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

declare type EmeraldUser = {
  badge: null;
  badges: string[];
  bio: string;
  created_at: string;
  display_name: string;
  display_picture: string;
  email: string;
  flair: {
    color: string;
  };
  gender: "m" | "f" | "o";
  gold: boolean;
  id: number;
  interests: string[];
  karma: number;
  master: boolean;
  mod: boolean;
  online: boolean;
  username: string;
  verified: boolean;
  temp?: boolean;
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

declare const RoomClient: Room;

declare class Room extends React.Component {
  state: {
    messages: MessageData[];
    id: null | number | string;
    mode: "private" | "channel";
  };
  switch(e: { id: null | number | string; mode: "private" | "channel" }): void;
  send_picture(picture: EmeraldPicture): void;
  print(elt?: JSX.Element): void;
  print_append(elt?: JSX.Element): void;
  append(e: MessageData): void;
  trim_messages(): void;
}

declare class RoomChannelSelect {
  join(e: any): void;
}
declare const RoomChannelSelectClient: RoomChannelSelect;

declare class RoomChannelMembers extends React.Component<
  any,
  { members: EmeraldUser[] }
> {
  add_member(e: EmeraldUser): void;
  remove_member(e: EmeraldUser): void;
}

declare const RoomChannelMembersClient: RoomChannelMembers;

declare class RoomUserUnit extends React.Component<{ data: EmeraldUser }> {
  body(): JSX.Element;
}

declare class Message extends React.Component<{ data: MessageData }> {
  render(): JSX.Element;
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

declare const DashboardClient: null | {
  setState: Function;
};

declare const UserViewGenerator: {
  generate(e: { event: any; user: any }): void;
};

declare class UserView extends React.Component<
  any,
  {
    user: {
      id: number;
    };
  }
> {
  close: Function;
  view_profile: Function;
  exit_click: EventListenerObject;
}

declare let UserViewReact: undefined | UserView;

declare class Popup extends React.Component {
  close: Function;
}
declare class Picture extends React.Component {
  close: Function;
}

declare class UserProfile extends React.Component<
  any,
  {
    data: {
      friend: boolean;
      // NOTE: This is our own field
      actualFriend: boolean;
    };
  }
> {
  profile_buttons: Function;
  switch(id: number): void;
}

declare let UserProfileReact: null | UserProfile;
