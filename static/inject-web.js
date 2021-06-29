const script = document.createElement("script");
script.src = chrome.runtime.getURL("ritsu-emerald.user.js");
script.onload = () => script.remove();
document.head.append(script);
