import { Preferences, P } from "~src/preferences";

const cable = ActionCable.createConsumer();

function createSub(id: number | string | null) {
  setTimeout(() => {
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
  }, 230);
}

async function hideUser() {
  if (!App.user.mod && !App.user.master) return;
  const arJoin = App.room.join;
  App.room.join = function newArJoin(id) {
    arJoin(id);
    createSub(id);
    // we need to redefine this everytime we join cause... problems
    App.room.client.speak = function newArcSpeak(e) {
      this.perform("speak", {
        message: e.message,
        id,
        mode: e.mode,
        picture: e.picture
      });
      createSub(id);
    };

    App.room.client.typing = function arTyping() {};
  };

  const rpRecon = Room.prototype.room_reconnected;
  Room.prototype.room_reconnected = function newrpRecon() {
    rpRecon.call(this);
    const { id } = App.room;
    createSub(id);
  };
}

export function initHideUser() {
  if (Preferences.get(P.hideFromGc))
    setTimeout(() => {
      hideUser();
    }, 1000);
}
