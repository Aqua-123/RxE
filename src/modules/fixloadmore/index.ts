export function initLoadMore() {
  function prepend(this: Room, messageArray: MessageData[]) {
    RoomClient?.trim_messages();
    const currentState = RoomClient?.state.messages;
    if (!currentState) return;
    messageArray.forEach((messageObj) => {
      const lastElement = currentState.at(-1);
      if (!lastElement) return;
      const firstElement = currentState[0];
      if (
        firstElement &&
        firstElement.user.id === messageObj.user.id &&
        !lastElement.picture &&
        !messageObj.picture &&
        firstElement.messages.length < 16
      ) {
        const messagesArray = lastElement.messages;
        const lastEle = messagesArray.at(-1);
        if (messageObj.messages[0] === lastEle) return;
        firstElement.messages.unshift(messageObj.messages[0]);
      } else currentState.unshift(messageObj);
    });
    RoomClient?.setState({
      messages: currentState
    });
  }
  // sending a negetive value for the loaded length and subtracting
  // 20 from it seems to do the trick
  // although response is still weirdly reversed to have to
  // take care of it

  function fixLoadedCount(count: number) {
    if (count + 20 <= RoomClient!.state.messages_count) return -count - 20;
    return -RoomClient!.state.messages_count;
  }
  Room.prototype.load_messages = function loadyboi(loaded) {
    const newLoaded = fixLoadedCount(loaded);
    $.ajax({
      type: "GET",
      url: `/room_load_more?loaded=${newLoaded}&id=${this.state.id}`,
      dataType: "json",
      success(resp: []) {
        const rev = resp.reverse();
        prepend.bind(this)(rev);
      }
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
        resp.messages.forEach((message) => this.append(message));
        this.setState({
          messages_count: resp.messages_count
        });
        this.scroll();
      }
    });
  };
}
