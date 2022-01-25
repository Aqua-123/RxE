import { links } from "~src/meta";

const commands = {
  all: {
    rxelink: () =>
      RoomClient!.send(
        `Link to RxE extension for Emerald: ${links.repo_minified}`
      )
  } as Record<string, AnyFunction>,
  prefix: ".",
  process(message: string) {
    if (!message.startsWith(commands.prefix)) return false;
    const argv = message.slice(commands.prefix.length).split(" ");
    const command = commands.findCommand(argv[0]);
    command?.(...argv.slice(1));
    return !!command;
  },
  findCommand(argv0: string) {
    const commandName = Object.getOwnPropertyNames(commands.all).find(
      (candidate) => candidate === argv0
    );
    return commandName ? commands.all[commandName] : undefined;
  }
};

function linkSanitize(message: string) {
  return message
    .replace(/(\w)\.(\w)/g, "$1.\u200b$2")
    .replace(/https?:\/\//, "");
}

export function init() {
  Room.prototype.send = function send(rawMessage: string) {
    const message = this.process ? this.process(rawMessage) : rawMessage;
    if (message === null) return;
    this.append({
      messages: [message],
      user: App.user
    });
    App.room.client.speak({ message });
    this.scroll();
  };
  Room.prototype.process = function process(messageRaw) {
    if (commands.process(messageRaw)) return null;
    const message = linkSanitize(messageRaw);
    return message;
  };
}
