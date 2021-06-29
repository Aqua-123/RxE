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

declare const App: {
  user: {
    id: number;
    karma: number;
    temp: boolean;
    master: boolean;
    mod: boolean;
    flair: {
      color: string;
    };
    display_picture: string;
  };
  room: {
    client: {
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
    join(id: string): void;
    mute(id: number): void;
    unmute(id: number): void;
    muted: number[];
  };
};

declare const UpgradeClient: {
  form: Function;
};

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

declare const RoomClient: Room;

declare class Room {
  state: {
    messages: MessageData[];
    id: null | number | string;
    mode: "private" | "channel";
  };
  switch(e: { id: null | number | string; mode: "private" | "channel" }): void;
  send_picture(picture: EmeraldPicture): void;
  append(e: MessageData): void;
  // NOTE: This is our own field
  _append?: (e: any) => void;
}

declare class RoomUserUnit extends React.Component<{ data: EmeraldUser }> {
  body(): JSX.Element;
}

declare class Message extends React.Component<{ data: MessageData }> {
  render(): JSX.Element;
}

declare const MenuReactMicro: {
  close: Function;
};

declare const MenuReact: {
  close: Function;
};

declare class Menu extends React.Component {}

declare const UserViewGenerator: {
  generate(e: { event: any; user: any }): void;
};

declare const UserViewReact:
  | undefined
  | {
      state: {
        user: {
          id: number;
        };
      };
      view_profile: Function;
    };
