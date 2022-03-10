export function initLoadMore() {
  Room.prototype.load_messages = function loadmore(
      this: any, e = this.state.messages.length) {
    $.ajax({
      type : "GET",
      url : `/room_load_more?loaded=${e}&id=${this.state.id}`,
      dataType : "json",
      success : (messages: []) => {
        this.trim_messages();
        while (messages.length) {
          this.state.messages.unshift(messages.pop());
        }
      }
    });
  };
  Room.prototype.switch = function fixmessageCount(this: any, e: any) {
    this.clear_print();
    App.room.join(e.id);
    this.setState({
      id : e.id,
      messages : [],
      messages_count : 0,
      typing : null,
      mode : e.mode || "default"
    });
    if (e.mode === "private") {
      $.ajax({
        type : "GET",
        url : `/default_private_messages?id=${e.id}`,
        dataType : "json",
        success : (e2: any) => {
          for (let t = 0; t < e2.messages.length; t += 1) {
            console.log(e2.messages[t]);
            this.append(e2.messages[t]);
          }
          this.setState({messages_count : e2.messages_count});
          this.scroll();
        }
      });
      this.setState({left_panel : !0, right_panel : !0});
    }
  };
}
