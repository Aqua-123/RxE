/* eslint-disable */
export function initLoadMore() {
    Room.prototype.load_messages = function loadmore(e: number) {
        $.ajax({
            type: "GET",
            url: "/room_load_more?loaded=" + String(e) + "&id=" + this.state.id,
            dataType: "json",
            success: function (this: any, e: any) {
                e.reverse()
                for (var t = 0; t < e.length; t++) this.prepend(e[t])
            }.bind(this)
        })
    }
    Room.prototype.switch = function fixmessage_count(this: any, e: any) {
        this.clear_print(), App.room.join(e.id), this.setState({
            id: e.id,
            messages: [],
            messages_count: 0,
            typing: null,
            mode: e.mode || "default"
        }), "private" == e.mode && ($.ajax({
            type: "GET",
            url: "/default_private_messages?id=" + e.id,
            dataType: "json",
            success: function (this: any, e: any) {
                let t = 0;
                for (t = 0; t < e.messages.length; t++) this.append(e.messages[t]);
                this.setState({
                    messages_count: e.messages_count
                }),
                    this.scroll()
            }.bind(this)
        }), this.setState({
            left_panel: !0,
            right_panel: !0
        }))
    }
}
