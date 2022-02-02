import React from "react";
import { log } from "~userscripter";
import { wrapPartitions } from "~src/utils";
import {
  parseURL,
  getNonAscii,
  linkConfirmation,
  nonAsciiAlert,
  urlOneSlash,
  urlTwoDots,
  urlCommonDomains,
  urlEmeraldRequest,
  urlFull,
  desanitizeURL
} from "./linkutils";

class MessageAnchor extends React.Component<{ href: string }> {
  render() {
    const { href } = this.props;
    const url = parseURL(href);
    try {
      const urlObj = new URL(url);
      const unusualCharacters = getNonAscii(urlObj.host);
      const disableLink = unusualCharacters.length > 0;
      const confirmation =
        linkConfirmation(urlObj.host) + nonAsciiAlert(unusualCharacters);
      return (
        // we want this to be an actual anchor (with a disclaimer)
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          className="ritsu-message-anchor"
          href={disableLink ? "#" : urlObj.href}
          target="_blank"
          onClick={(event) => {
            if (!confirm(confirmation) || disableLink)
              event.nativeEvent.preventDefault();
          }}
          rel="noreferrer"
        >
          {url}
        </a>
      );
    } catch (error) {
      if (error instanceof Error) log.error(error.message);
      return href;
    }
  }
}

const extraTests = () => [urlOneSlash(), urlTwoDots(), urlCommonDomains()];
const extraFilters = () => [urlEmeraldRequest()];

export function wrapLinks<T>(text: string, restWrapper: StringWrapper<T>) {
  return wrapPartitions(
    text,
    urlFull(),
    (urlMatch) => {
      const url = desanitizeURL(urlMatch);
      if (
        extraTests().some((test) => test.test(url)) &&
        extraFilters().every((test) => !test.test(url))
      )
        return <MessageAnchor href={url} />;
      return urlMatch || null;
    },
    restWrapper
  );
}
