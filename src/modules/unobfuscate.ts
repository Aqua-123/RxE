const COMPONENTS = [
  [Room, "Room"],
  [UserProfile, "UserProfile"],
  [FriendUnit, "FriendUnit"],
  [Micropost, "Micropost"],
  [MessageNotificationUnit, "MessageNotificationUnit"],
  [Message, "Message"],
  [RoomUserUnit, "RoomUserUnit"],
  [UserUnit, "UserUnit"],
  [UserView, "UserView"],
  [Dashboard, "Dashboard"]
] as Array<[any, string]>;

export function init() {
  COMPONENTS.forEach(([component, name]) => {
    component.displayName = name;
  });
}
