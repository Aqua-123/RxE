import React from "react";
import { stringGroups, wrapPartitions } from "~src/utils";
import {
  decodeImage,
  picture
} from "~src/modules/chat/chat-image/image-process";
import { urlImageDirectLinkAny } from "./linkutils";
import { wrapLinks } from "./messagelinks";

const str1 = (s: string) => s.split("");
const str2 = (s: string) => stringGroups(s, 2);

// blackboard bold is more complex due to variable-byte glyphs, not included

const textDecoration = {
  none: str1("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
  italic: str2("𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡"),
  bold: str2("𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"),
  boldItalic: str2("𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕"),
  underline: str2(
    "a͟b͟c͟d͟e͟f͟g͟h͟i͟j͟k͟l͟m͟n͟o͟p͟q͟r͟s͟t͟u͟v͟w͟x͟y͟z͟A͟B͟C͟D͟E͟F͟G͟H͟I͟J͟K͟L͟M͟N͟O͟P͟Q͟R͟S͟T͟U͟V͟W͟X͟Y͟Z͟0͟1͟2͟3͟4͟5͟6͟7͟8͟9͟"
  ),
  squared: str2("🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉"),
  squaredFull: str2("🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉"),
  circled: str1(
    "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨"
  ),
  superscript: str1(
    "ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᵠᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹"
  ),
  medieval: str2("𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅"),
  cursive: str2("𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"),
  cursiveBold: str2("𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩"),
  monospace: str1(
    "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９"
  ),
  smallcaps: str1("ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ"),
  hooked: str1("αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ"),
  boldSerif: str2(
    "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
  )
};

type TextDecoration = keyof typeof textDecoration;

function decorateText(decoration: TextDecoration, text: string): string {
  console.log(text);
  return text
    .split("")
    .map((char) => {
      const index = textDecoration.none.indexOf(char);
      return textDecoration[decoration][index] ?? char;
    })
    .join("");
}

type Wrap = StringWrapper<JSXSingleton>;

const id = (rest: string) => rest;

export function processImage(
  text: string,
  restWrapper: Wrap = id
): JSXContent | null {
  if (urlImageDirectLinkAny().test(text)) {
    return wrapPartitions(
      text,
      urlImageDirectLinkAny(),
      (url) => picture({ url: `https://${url}` }),
      // Discard surrounding text to get rid of image placeholder text.
      // TODO: Mark placeholder with invis disappearing markup.
      () => ""
    );
  }

  // Downside: text alongside base imgur.com pictures is not displayed
  const image = decodeImage(text);
  if (image !== null) return picture(image);

  return restWrapper(text);
}

function makeMaterialIcon(match: string): JSXContent {
  const className = "material-icons";
  const title = match.toLocaleLowerCase();
  return <span {...{ className, title }}>{match.slice(2, -1)}</span>;
}

function wrapMaterialIcons(text: string, restWrapper: Wrap = id): JSXContent {
  return wrapPartitions(text, /m:[-_a-z]+:/gi, makeMaterialIcon, restWrapper);
}

function makeLineBreaks({ length }: string): JSXContent {
  return length > 1 ? [<br />, <br />] : <br />;
}

function wrapLineBreaks(text: string, restWrapper: Wrap = id): JSXContent {
  const trimmedText = text.replace(/^[\s\n]+|[\s\n]+$/g, "");
  return wrapPartitions(trimmedText, /\n+/g, makeLineBreaks, restWrapper);
}

const markdownStyles: Record<string, TextDecoration> = {
  "[[": "squaredFull",
  "((": "circled",
  "{{": "medieval",
  "*": "italic",
  "_": "italic",
  "**": "bold",
  "__": "underline",
  "***": "boldItalic",
  "`": "monospace",
  "^^": "superscript",
  ",,": "hooked",
  "<": "cursive",
  "<<": "cursiveBold",
  "~": "smallcaps"
};

const markdownDelimiters = Object.getOwnPropertyNames(markdownStyles) as Array<
  keyof typeof markdownStyles
>;
markdownDelimiters.sort((a, b) => b.length - a.length);
function mirrorDelimiter(delim: string): string {
  if (delim === "[[") return "]]";
  if (delim === "((") return "))";
  if (delim === "{{") return "}}";
  if (delim === "*//") return "//*";
  if (delim === "<<") return ">>";
  if (delim === "<") return ">";

  return delim;
}

function makeMarkdown(text: string): string {
  const delim = markdownDelimiters.find(
    (d) => text.startsWith(d) && text.endsWith(mirrorDelimiter(d))
  );
  if (delim === undefined) return text;
  const contents = text.slice(delim.length, -delim.length);

  const delimLast = delim.slice(-1)[0];
  if (contents.split("").every((char) => char === delimLast)) return text;
  return decorateText(markdownStyles[delim], contents.replace(/[\u200B\u200C\u200D\ufffd\u200b\ufffd]/g, ""));
}

export function wrapMarkdown(
  text: string,
  restWrapper: StringWrapper<string> = id
): string {
  return wrapPartitions<string, string>(
    text,
    /(?<=\s|^|\.,;!\?)(\*{1,3}|_{1,2}|~{1,2}|<{1,2}|`|\^\^|,,|\[{2}|\({2}|\{{2})(?:[\u200B\u200C\u200D\ufffd\U0001f178]*\S)(?:[\u200B\u200C\u200D\ufffd\U0001f178]*(?:.*?[\u200B\u200C\u200D\ufffd\U0001f178]*\S)?)(?:[\u200B\u200C\u200D\ufffd\U0001f178]*(?:\1|\]{2}|\){2}|\}{2}|>{1,2}))(?=\s|$|\.,;!\?)/g,
    makeMarkdown,
    restWrapper
  ).join("");
}

export function wrapRich(text: string, restWrapper: Wrap = id): JSXContent {
  return wrapLineBreaks(text, (line) =>
    wrapMaterialIcons(line, (nonIcon) => wrapLinks(nonIcon, restWrapper))
  );
}
