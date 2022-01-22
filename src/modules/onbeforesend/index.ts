import { links } from "~src/meta";

const commands = {
    all: {
        "rxelink": () =>
            RoomClient!.send(`Link to RxE extension for Emerald: ${links.repo_minified}`)
    } as Record<string, AnyFunction>,
    prefix: ".",
    process(message: string) {
        if (!message.startsWith(commands.prefix)) return false;
        const command = message.slice(commands.prefix.length);
        const argv = command.split(' ');
        for (const commandName in commands.all) {
            if (commandName !== argv[0]) continue;
            commands.all[commandName](...argv.slice(1));
            return true;
        }
        return false;
    }
}

function linkSanitize(message: string) {
    return message.replace(/(\w)\.(\w)/g, "$1(.)$2")
        .replace(/https?:\/\//, "");
}

export function init() {
    Room.prototype.send = function (rawMessage: string) {
        const message = this.process ? this.process(rawMessage) : rawMessage;
        if (message === null) return;
        this.append({
            messages: [
                message
            ],
            user: App.user
        }),
            App.room.client.speak({ message }),
            this.scroll()
    }
    Room.prototype.process = function (messageRaw) {
        if (commands.process(messageRaw)) return null;
        const message = linkSanitize(messageRaw);
        return message;
    }
}
