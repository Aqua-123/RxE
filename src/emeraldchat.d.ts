// Describes some of the global variables exposed by Emerald Chat
// Flesh out as needed.

// declare const $: JQuery;

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
  };
};

declare const UpgradeClient: {
  form: Function;
};

declare class ModPanel extends React.Component {}

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
      user: {
        temp: boolean;
        karma: number;
        gender: "f" | "m" | "o";
        created_at: string;
        gold: boolean;
        master: boolean;
        mod: boolean;
      };
      picture: EmeraldPicture;
    }[];
  };
  send_picture(picture: EmeraldPicture): void;
  append(e: any): void;
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
