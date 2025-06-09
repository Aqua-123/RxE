import { P, Preferences, RequestBlockMode } from "~src/preferences";
import { DAY, timeSince } from "~src/utils";

function processRequest(request: FriendRequest, action: "accept" | "decline") {
  const endpoint = action === "accept" ? "friends_accept" : "friends_decline";
  $.ajax({
    type: "GET",
    url: `/${endpoint}?friend_id=${request.sender_id}&notification_id=${request.id}`,
    dataType: "json"
  });
}

function shouldKeepRequest(
  request: FriendRequest,
  blockMode: RequestBlockMode
): boolean {
  const joinDate = new Date(request.data.sender.created_at);
  const isNewUser =
    blockMode !== RequestBlockMode.None && timeSince(joinDate) < DAY;
  const isHidden = App
    ? App.room.muted.includes(request.sender_id)
    : request.seen;

  return !isNewUser && !isHidden;
}

function filterNotifications(data: NotificationsStateData) {
  const blockMode = Preferences.get(P.blockReqs);
  const approveAll = Preferences.get(P.approveAllReqs);

  console.log(blockMode, approveAll);

  data.friend_requests = data.friend_requests.filter(
    (request: FriendRequest) => {
      if (approveAll) {
        processRequest(request, "accept");
        return false;
      }
      // Keep requests that aren't blocked or hidden
      if (shouldKeepRequest(request, blockMode)) {
        return true;
      }

      // Only decline if block mode is set to reject
      if (blockMode === RequestBlockMode.Reject) {
        processRequest(request, "decline");
      }

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
