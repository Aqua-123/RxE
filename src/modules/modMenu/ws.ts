const cable = ActionCable.createConsumer();

function createSub(id: number | string | null) {
  const newConnection = cable.subscriptions.create(
    {
      channel: "RoomChannel",
      room_id: id
    },
    {
      connected() {
        console.log(`# client connected to room[${id}] #`);
        newConnection.unsubscribe();
      },
      disconnected() {
        return console.log(`# client disconnected from room[${id}] #`);
      }
    }
  );
}

export function hideUser() {
  const arJoin = App.room.join;
  App.room.join = async function newArJoin(id) {
    arJoin(id);
    createSub(id);
  };

  const arcSpeak = App.room.client.speak;
  App.room.client.speak = async function newArcSpeak(e) {
    arcSpeak(e);
    const { id } = App.room;
    createSub(id);
  };

  App.room.client.typing = function arTyping() {};
}
