declare type RxEEvent = {
  type: string;
  preventDefault(): void;
};
declare type RxERoomEvent = RxEEvent & { room: string };
declare type RxERoomMessageEvent = RxEEvent & MessageData;
declare type RxEUserEvent = RxEEvent & EmeraldUser;

declare type RxEEventMap = {
  "room.join": RxERoomEvent;
  "room.leave": RxERoomEvent;
  "room.received": RxERoomMessageEvent;
  "room.userlist": RxEUserEvent;
  "user.left": RxERoomMessageEvent;
  "user.joined": RxERoomMessageEvent;
  "user.message": RxERoomMessageEvent;
};

type SpamRating = {
  scoreLegacy: number;
  scoreStrikes: number;
  scoreExperimental: number;
  lastMessageTime: number;
  lastMessage: string;
};

declare type RxE = {
  version(): string;
  addEventListener<K extends keyof RxEEventMap>(
    type: K,
    listener: (ev: RxEEventMap[K]) => any
  ): void;
  addEventListener(type: string, listener: (ev: any) => any): void;
  removeEventListener<K extends keyof RxEEventMap>(
    type: K,
    listener: (ev: RxEEventMap[K]) => any
  ): void;
  removeEventListener(type: string, listener: (ev: any) => any): void;
};

declare const RxE: RxE;
