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
    messages: {
      messages: string[];
      user: EmeraldUser;
      picture: EmeraldPicture;
    }[];
    id: null | number | string;
    mode: "private" | "channel";
  };
  send_picture(picture: EmeraldPicture): void;
  append(e: {
    user: EmeraldUser;
    messages: string[];
    picture?: null | EmeraldPicture;
  }): void;
  // NOTE: This is our own field
  _append?: (e: any) => void;
}

declare const MenuReactMicro: {
  close: Function;
};

declare const MenuReact: {
  close: Function;
};

declare class Menu extends React.Component {}

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
