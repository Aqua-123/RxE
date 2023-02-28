import { P, Preferences, RequestBlockMode } from "~src/preferences";
import { DAY, timeSince } from "~src/utils";

function filterNotifications(data: NotificationsStateData) {
  const blockMode = Preferences.get(P.blockReqs);
  data.friend_requests = data.friend_requests.filter(
    (request: FriendRequest) => {
      const joinDate = new Date(request.data.sender.created_at);
      const blockNew =
        blockMode !== RequestBlockMode.None && timeSince(joinDate) < DAY;
      const hide = App
        ? App.room.muted.includes(request.sender_id)
        : request.seen;
      if (!blockNew && !hide) return true;
      if (blockMode !== RequestBlockMode.Reject) return false;
      $.ajax({
        type: "GET",
        url: `/friends_decline?friend_id=${request.sender_id}&notification_id=${request.id}`,
        dataType: "json"
      });
      return false;
    }
  );
}

function update() {
  $.ajax({
    type: "GET",
    url: "/notifications_json",
    dataType: "json",
    // eslint-disable-next-line no-shadow
    success: function success(data: NotificationsStateData) {
      filterNotifications(data);
      NotificationsReact.setState({ data });
    }
  });
  return "updated";
}

export async function early() {
  Notifications.prototype.update = update;
  if (!NotificationsReact) return;
  NotificationsReact.update = update;
  if (NotificationsReact.state && NotificationsReact.state.data)
    filterNotifications(NotificationsReact.state.data);
  else console.warn("failed to filter friend requests early");
}
