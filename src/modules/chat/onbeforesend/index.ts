import { links } from "~src/meta";
import { sanitizeURL } from "~src/modules/rendering/richtext/linkutils";
import { wrapMarkdown } from "~src/modules/rendering/richtext/richtext";

const emotes = {
  shrug: "¯\\_(ツ)_/¯",
  tableflip: "(╯°□°）╯︵ ┻━┻",
  tableflip2: "(ノಠ益ಠ)ノ彡┻━┻",
  unflip: "┬──┬ ノ( ゜-゜ノ)"
};

const commands = {
  all: {
    rxemlink: () =>
      RoomClient!.send(
        `Link to RxE extension for Emerald: ${links.repo_minified}`
      ),
    rxelink: () =>
      RoomClient!.send(`Link to RxE extension for Emerald: ${links.repo}`),
    out: () => RoomClient!.send("----------------------> 🚪"),
    rules: () =>
      RoomClient!.send(`For the updated ruleset please see: ${links.rules}`)
  } as Record<string, AnyFunction>,
  on(command: string) {
    return {
      run: (action: AnyFunction) => {
        commands.all[command] = action;
        return commands;
      }
    };
  },
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
    const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
    return email.test(message);
  },
  processMail(message: string) {
    return message.replace(/\./gi, ".\u200b");
  }
};

function addSubstitutions(substitutions: Record<string, string>) {
  Object.entries(substitutions).forEach(([name, result]) =>
    commands.on(name).run(() => RoomClient!.send(result))
  );
}

function addZWSP(message: string) {
  const words = message.split(" ");
  let newMessage = "";
  words.forEach((word: string, index: number) => {
    if (index > 0) newMessage += " "; // Add space between words only
    newMessage += [word.slice(0, 2), "\u200B", word.slice(2)].join("");
  });
  const finalMessage = newMessage;
  return finalMessage;
}

const RXE_SIGNATURE = {
  ZWNJ: "\u200C",
  ZWSP: "\u200B",
  ZWJ: "\u200D",
  get pattern() {
    return `${this.ZWNJ}${this.ZWSP}${this.ZWJ}${this.ZWSP}${this.ZWNJ}`;
  }
};

function addRxESignature(message: string): string {
  const markdownStart =
    /^(\*{1,3}|_{1,2}|~{1,2}|<{1,2}|`|\^\^|,,|\[{2}|\({2}|\{{2})/;
  const needsSpace = markdownStart.test(message);
  return RXE_SIGNATURE.pattern + (needsSpace ? " " : "") + message;
}

export function hasRxESignature(message: string): boolean {
  return message.startsWith(RXE_SIGNATURE.pattern);
}

export function init() {
  addSubstitutions(emotes);

  Room.prototype.send = function send(rawMessage: string) {
    const { mode } = this.state;
    const message = this.process ? this.process(rawMessage) : rawMessage;
    if (message === null) return;
    this.append({
      messages: [message],
      user: App.user
    });
    App.room.client.speak({ message, mode });
    this.scroll();
  };

  Room.prototype.process = function process(message) {
    if (commands.process(message)) return null;
    if (commands.checkMail(message)) return commands.processMail(message);
    const sanitized = sanitizeURL(message);
    const processedMessage =
      sanitized !== message ? sanitized : wrapMarkdown(addZWSP(message));

    // Add RxE signature before the message
    return addRxESignature(processedMessage);
  };
}
