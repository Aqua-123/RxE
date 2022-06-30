import { getUserId } from "~src/utils";
import { fasterAppend } from "~src/modules/chat/messages";

export function initLoadMore() {
  function prepend(this: Room, newMessages: MessageData[]) {
    RoomClient?.trim_messages();
    const messagesStored = RoomClient?.state.messages;
    if (!messagesStored) return;
    newMessages.forEach((newMessage /* singleton */) => {
      if (messagesStored.length === 0) messagesStored.unshift(newMessage);

      const followingMessageBlk = messagesStored[0];

      const messageFromSameUser =
        getUserId(followingMessageBlk.user) === getUserId(newMessage.user);

      const picturePreventsAppending =
        followingMessageBlk.picture || newMessage.picture;

      const oldBlockTooLong = followingMessageBlk.messages.length >= 16;

      if (!messageFromSameUser || picturePreventsAppending || oldBlockTooLong) {
        messagesStored.unshift(newMessage);
        return;
      }

      const messageText = newMessage.messages[0];

      const duplicateMessage = followingMessageBlk.messages[0] === messageText;

      if (duplicateMessage) return;
      followingMessageBlk.messages.unshift(newMessage.messages[0]);
    });

    RoomClient?.setState({ messages: messagesStored });
  }
  // sending a negetive value for the loaded length and subtracting
  // 20 from it seems to do the trick
  // although response is still weirdly reversed to have to
  // take care of it

  const fixLoadedCount = (count: number) =>
    count + 20 <= RoomClient!.state.messages_count
      ? -count - 20
      : -RoomClient!.state.messages_count;

  Room.prototype.load_messages = function loadyboi(loaded) {
    const newLoaded = fixLoadedCount(loaded);
    $.ajax({
      type: "GET",
      url: `/room_load_more?loaded=${newLoaded}&id=${this.state.id}`,
      dataType: "json",
      success: (resp: []) => prepend.call(this, resp.reverse())
    });
  };
  Room.prototype.switch = function fixmessageCount(this: any, roomObj: any) {
    this.clear_print();
    const { id } = roomObj;
    App.room.join(id);
    this.state.last_message = null;
    this.setState({
      id,
      messages: [],
      messages_count: 0,
      typing: null,
      mode: roomObj.mode || "default"
    });
    if (roomObj.mode !== "private") return;
    $.ajax({
      type: "GET",
      url: `/default_private_messages?id=${id}`,
      dataType: "json",
      success: (resp: PrivateMessage) => {
        fasterAppend.call(this, resp.messages);
        this.setState({ messages_count: resp.messages_count });
        this.scroll();
      }
    });
  };
}
