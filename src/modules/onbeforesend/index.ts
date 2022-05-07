import { links } from "~src/meta";
import { sanitizeURL } from "../richtext/linkutils";
import { emotes, processEmotes } from "../emotes";

const commands = {
  all: {
    rxelink: () =>
      RoomClient!.send(`Link to RxE extension for Emerald: ${links.repo}`)
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
  },
  checkMail(message: string) {
    const email = message.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi);
    if (email) return true;
    return false;
  },
  processMail(message: string) {
    return message.replace(/\./gi, ".\u200b");
  },
  // match if emote is present
  // if so, replace with emote
  checkEmotes(message: string) {
    const emote = Object.getOwnPropertyNames(emotes).find((candidate) =>
      message.includes(candidate)
    );
    if (emote) return true;
    return false;
  }
};

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
    let processedMessage = messageRaw;
    if (commands.checkEmotes(messageRaw))
      processedMessage = processEmotes(messageRaw);
    if (commands.process(processedMessage)) return null;
    if (commands.checkMail(processedMessage))
      return commands.processMail(processedMessage);
    const message = sanitizeURL(processedMessage);
    return message;
  };
}
