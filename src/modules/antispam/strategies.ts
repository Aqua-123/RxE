import {
  timeSince,
  MINUTE,
  textEntropy,
  getUserId,
  isRepeating,
  notNum
} from "~src/utils";

export function getMessageMetrics(messages: string | string[]) {
  const message = messages instanceof Array ? messages.join("") : messages;
  return {
    message,
    uppercase: message.split("").filter((x) => x.toLowerCase() !== x),
    entropySplit: textEntropy(message, /\s+/),
    entropy: textEntropy(message),
    repeating: isRepeating(message),
    noLowerCase: message.toUpperCase() === message
  };
}

export function getUserInfo(user: EmeraldUser | number | null) {
  const createdAt = notNum(user)?.created_at;
  return {
    accountCreated: createdAt ? new Date(createdAt) : new Date(),
    id: getUserId(user),
    displayName: notNum(user)?.display_name ?? ""
  };
}

export namespace strategy {
  export function legacy(rating: SpamRating, { messages }: MessageData) {
    const now = Date.now();
    const { message, uppercase } = getMessageMetrics(messages);
    // original anti-spam logic - effective, but prone to false positives
    rating.scoreLegacy +=
      (1e3 / (timeSince(rating.lastMessageTime) || now)) ** 0.2;
    rating.scoreLegacy /= Math.max(
      1 / Math.E,
      Math.E - Math.log(10 + message.length + uppercase.length) / 4
    );
  }

  export function strikeBased(rating: SpamRating, data: MessageData) {
    // dumber anti-spam logic - 3 fast messages, you're out.
    const { max, log10 } = Math;
    const now = Date.now();
    const { accountCreated } = getUserInfo(data.user);
    const {
      message,
      entropySplit: entropy,
      noLowerCase,
      repeating
    } = getMessageMetrics(data.messages);

    const delay = now - rating.lastMessageTime || 1500;

    if (delay <= 1000) rating.scoreStrikes += 1;
    else if (delay > 2000)
      rating.scoreStrikes = max(0, rating.scoreStrikes - log10(delay));

    // mean anti-new account additional penalty
    if (timeSince(accountCreated) < 10 * MINUTE) {
      const longMessage = message.length > 200;
      if ((entropy < 2 || repeating > 3) && longMessage)
        rating.scoreStrikes += 1;
      rating.scoreStrikes *= noLowerCase ? 3 : 2;
    }
  }

  /**
   * @experimental
   */
  export function v11(rating: SpamRating, data: MessageData) {
    const { max, abs, exp } = Math;
    const { accountCreated } = getUserInfo(data.user);
    // const allMessages = RoomClient?.state.messages ?? [];
    const metrics = getMessageMetrics(data.messages);
    const { entropy, uppercase } = metrics;
    const newMessage = metrics.message.trim();
    const { length } = newMessage;

    const lengthFactor = exp(-length / 500);
    const caseFactor = length ? length / (uppercase.length + length) : 1;
    const acAgeFactor = timeSince(accountCreated || new Date()) ** 0.01;
    const value = entropy * caseFactor * lengthFactor * acAgeFactor;

    function valueAddedTo(messages: string[] | string) {
      const { message } = getMessageMetrics(messages);
      const messageLower = message.toLowerCase();
      const relativeAddedValue =
        textEntropy(messageLower) - textEntropy(messageLower + newMessage);
      return abs(relativeAddedValue);
    }
    /* const addedValues = allMessages
      .slice(0, -20)
      .map(({ messages, user }, messageIndex, { length: messagesTotal }) => {
        const importance = getUserId(user) === getUserId(data.user) ? 1 : 0.5;
        // weights add up to 1
        const weight =
          (messageIndex + 1) / (messagesTotal * (messagesTotal + 1));
        const valueAdded = valueAddedTo(messages) ** importance * weight;
        if (Number.isNaN(valueAdded))
          console.log("NaN at", messages.join(""), importance, weight);
        return valueAdded;
      });
    const addedValue = addedValues.length ? sum(addedValues) : value;
    const worth = (addedValue + valueAddedTo(rating.lastMessage) * value) / 2; */
    const worth = (value + valueAddedTo(rating.lastMessage) * value) / 2;
    const delay = max(
      timeSince(rating.lastMessageTime || accountCreated || new Date()),
      500
    );
    rating.scoreV11 /= delay / 2e3;
    rating.scoreV11 += 1 - worth;
    rating.scoreV11 = max(0, rating.scoreV11);
    console.log(`${JSON.stringify(newMessage)} \
has own value ${value.toFixed(5)}, \
worth ${worth.toFixed(5)},
score ${rating.scoreV11.toFixed(5)}`);
  }
}
