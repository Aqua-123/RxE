// ==UserScript==
// @name        New script - emeraldchat.com
// @namespace   Violentmonkey Scripts
// @match       https://www.emeraldchat.com/app
// @grant       none
// @version     1.0
// @author      -
// @grant GM_setValue
// @grant GM_getValue
// @run-at document-end
// @description 6/18/2021, 12:48:48 AM
// ==/UserScript==

const window = unsafeWindow;
const crel = (elt, obj={}) => Object.assign(document.createElement(elt), obj);

// #1. Overriding builtin behaviors

function overrideDumbSettings() {
  if (hacks.disableNags) {
    App.user.karma = 31337;
    App.user.temp = false;
    App.user.gold = true;
    App.user.verified = true;
    UpgradeClient.form = () => {};
    Cookies.set('goldad', '1');
  }
  if (hacks.enableModUI) {
    App.user.master = true;
    App.user.mod = true;
    ModPanel.prototype.componentDidMount = function() { this.setState({ tab: 'default' }) }
  }
}

// limited usefulness here so far.
$.__ajax = $.ajax;
$.ajax = options => {
  switch (options.url) {
    case "/user_is_temp": return options.success({ status: true, temp: false });
    default:
      const modifiedOptions = {...options, success: e => {
        switch (options.url) {
          // case '/current_user_interests_json':
          //   e.current_user.gold = true;
          //   e.current_user.karma = 31337;
          //   e.current_user.temp = false;
          //   e.current_user.master = true;
          //   e.current_user.mod = true;
          //   e.current_user.verified = true;
          //   break;
          // case '/current_user_json':
          //   e.gold = true;
          //   e.karma = 31337;
          //   e.temp = false;
          //   e.master = true;
          //   e.mod = true;
          //   e.verified = true;
          //   break;
          default:
            if (hacks.universalFriend && options.url.startsWith('/profile_json?')) {
              e.friend = true;
            }
        }
        
        options.success?.(e);
      }}
      $.__ajax(modifiedOptions);
  }
};

// hide dumb console errors
window.DashboardClient = {
  setState: () => {}
};
window.MenuReactMicroStatic = {
  close: () => {}
};

// #2. Themes

const commonCSS = `
/* hide broken search */
.actionicon-mega:last-child {
  display: none;
}

/* theme dialog */
.themes-menu-container li {
  padding: 0.5em;
  color: #aaa;
  cursor: pointer;
}
.themes-menu-container li:hover {
  background: #333;
}
.themes-menu-container li.selected {
  color: white;
}

/* hacks dialog */
.hacks-menu-container li {
  padding: 0.5em;
  font-weight: normal;
  cursor: pointer;
}
.hacks-menu-container li:hover {
  background: #333;
}
.hacks-warning {
  margin: 5em;
  text-align: center;
  color: #E33;
}

/* picture overlay button */
.room-component-message-picture-container {
  position: relative;
}
.picture-control {
  display: none;
  position: absolute;
  top: 0;
  padding: .5em;
  border: 1px solid black;
  border-radius: 2px;
  background: #333;
  color: red;
  font-size: 2em;
  font-weight: 900;
}
.room-component-message-picture:hover + .picture-control, .picture-control:hover {
  display: block;
}
`;

// incomplete. "default" should probably stay empty. fix/flesh out themes here.
const themes = {
  default: ``,
  dark: `
.ui-menu.ui-menu {
  background: #111;
}

.notification-unit.notification-unit {
  background: #111;
}

.navigation-notification-unit.navigation-notification-unit:hover {
  color: purple;
}

.notification-unit.notification-unit:hover {
  background: #333;
}
.navigation-dropdown-content.navigation-dropdown-content {
  background: #111;
  color: #fea;
}
/*
.side-panel.side-panel { 
  background: pink;
}
.actionicon-mega.actionicon-mega:hover {
  background: red;
}
body>div>nav {
  background: purple;
}
.room-component-left.room-component-left {
  background: green;
}
.room-component-center.room-component-center {
  background: red;
}
.room-component-right.room-component-right {
  background: blue;
}
*/
.navigation-notification-icons.navigation-notification-icons { 
  background: transparent;
} 
`,
  ritsu: `
body>div>nav {
  background: black;
}
.room-component-left.room-component-left {
  background: black;
}
.room-component-center.room-component-center {
  background: black;
}
.room-component-right.room-component-right {
  background: black;
}
.background-container {
  background: red;
}
.room-component-messages {
  background: black;
}
.room-component-input {
  background: purple;
}
.ui-button-match {
  background: purple;
}
.ui-search
body.navigation-notification-icons {
  background: black;
}
#container.container {
  background: black;
}
.dashboard-button.animated.zoomIn {
  background: purple;
}
.navigation-notification-icons.navigation-notification-icons {
  background: transparent;
}
.ui-search-box {
  background: #0b0b0b
}
.side-panel.side-panel {
  background: black;
}
.actionicon-mega.actionicon-mega:hover {
  background: 0b0b0b;
}
.ui-menu.ui-menu {
  background: black
}
.ui-menu.ui-menu, .notification-unit.notification-unit {
  background: #111;
}
.ui-interests-bg {
  background: grey;
}
.navigation-notification-unit.navigation-notification-unit:hover {
  color: purple;
}
.navigation-notification-unit {
  color: red;
}
`
};

let currentTheme = GM_getValue('theme', 'default');
function applyTheme() {
  currentTheme = GM_getValue('theme', 'default');
  let styleSheet = document.head.querySelector('.custom-theme');
  if (!styleSheet) {
    document.head.append(crel('style', {
      className: 'custom-theme',
      type: 'text/css',
    }));
    styleSheet = document.head.querySelector('.custom-theme');
  }
  styleSheet.textContent = commonCSS + themes[currentTheme];
}

function selectTheme(id) {
  GM_setValue('theme', id);
  applyTheme();
}

class Themes extends React.Component {
  r(f) { f?.(); this.setState({i: Math.random()}) }
  render() {  
    return React.createElement("div", {
        style: {
          marginTop: "5px"
        }
    }, React.createElement("div", {
      className: "m1",
      style: { marginBottom: "2em" }
    }, "Choose your theme"),
    ...Object.keys(themes).map(theme=> React.createElement('li', {
      className: currentTheme === theme ? "selected" : '',
      onMouseDown: () => this.r(()=>selectTheme(theme))  
    }, theme[0].toUpperCase()+theme.slice(1)))
    );
  }
}

function CustomDialog(props) {
  const { title, className, content } = props;
  return React.createElement("div", {
      key: "custom_menu",
      className: className
  }, title, React.createElement(BR), React.createElement(BR), React.createElement(content), React.createElement("div", {
      className: "ui-menu-buttons"
  }, React.createElement("div", {
      onMouseDown: () => MenuReact.close(),
      className: "ui-button-text"
  }, "Close")))

}

function openThemesDialog() {
  const element = React.createElement(Menu, null, React.createElement(CustomDialog, { 
    title: "THEMES", 
    className: "themes-menu-container", 
    content: Themes
  }));
  ReactDOM.render(element, document.getElementById("ui-hatch"))
}

function injectThemesMenu() {
  let themesMenu = document.querySelector('.navigation-dropdown-themes');
  if (!themesMenu) {
    document.querySelector('.navigation-dropdown-content')?.prepend(crel('li', { 
      className: 'navigation-dropdown-themes',
      textContent: 'Themes',
      onmousedown: openThemesDialog
    }))
  }
}

// #3. WTF HAX

let needsReload = false;

let hacks = GM_getValue('hacks', { disableNags: true });
function loadHacks() {
  hacks = GM_getValue('hacks', { disableNags: true });
}

function applyHacks(obj) {
  hacks = { ...hacks, ...obj };
  GM_setValue('hacks', hacks);
  overrideDumbSettings();
  needsReload = true;
}

class Hacks extends React.Component {
  r(f) { f?.(); this.setState({i: Math.random()}) }
  render() {
    const { disableNags, enableModUI, universalFriend } = hacks;
    return React.createElement("div", {
        style: {
          marginTop: "5px"
        }
    }, React.createElement("div", {
      className: "m1",
      style: { marginBottom: "2em" }
    }, "Enable and disable various hacks here"),
    React.createElement('li', {
      onMouseDown: () => this.r(()=>{ applyHacks({disableNags: !disableNags}) })
    }, 
      "Nagging and restrictions on temporary accounts is ",
      React.createElement("em", {}, disableNags?'DISABLED':'ENABLED')
    ),
    React.createElement('li', {
      onMouseDown: () => this.r(()=>{ applyHacks({enableModUI: !enableModUI}) })
    }, 
      "(Useless) access to moderator/master panel is ",
      React.createElement("em", {}, enableModUI?'VISIBLE':'HIDDEN')
    ),
    React.createElement('li', {
      onMouseDown: () => this.r(()=>{ applyHacks({universalFriend: !universalFriend}) })
    }, 
      "Access to any profile is ",
      React.createElement("em", {}, universalFriend?'ENABLED':'DISABLED')
    ),
                               
    needsReload? React.createElement('div', {
      className: 'hacks-warning'
    }, "You may need to reload the app for your changes to take effect."):null
    );
  }
}

function openHacksDialog() {
  const element = React.createElement(Menu, null, React.createElement(CustomDialog, { 
    title: "HACKS", 
    className: "hacks-menu-container", 
    content: Hacks
  }));
  ReactDOM.render(element, document.getElementById("ui-hatch"))
}

function injectHacksMenu() {
  let themesMenu = document.querySelector('.navigation-dropdown-hacks');
  if (!themesMenu) {
    document.querySelector('.navigation-dropdown-content')?.prepend(crel('li', { 
      className: 'navigation-dropdown-hacks',
      textContent: 'Hacks',
      onmousedown: openHacksDialog
    }))
  }
}

// #4. Image control

const knownHashes = {};
const blockedHashes = {};

function initPictures() {
  const hashes = GM_getValue('blockedPictures', []);
  hashes.forEach(hash => blockedHashes[hash] = true);
}

async function getHash(str) {
  if (!knownHashes[str]) {
    const msg = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msg);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); 
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    knownHashes[str] = hashHex;
  }
  return knownHashes[str];
}

async function blockPicture(src) {
  const hash = await getHash(src);
  blockedHashes[hash] = true;
  GM_setValue('blockedPictures', Object.keys(blockedHashes));
  // apply block
  decoratePictures();
}

function decoratePictures() {
  const pics = document.querySelectorAll('.room-component-message-picture-container');
  pics.forEach(async pic => {
    if (!pic.querySelector('.picture-control')) {
      pic.append(crel('div', {
        className: 'picture-control',
        textContent: 'X',
        onmousedown: e=>blockPicture(e.target.parentElement.firstChild.src)
      }))
    }
    const src = pic.firstChild.src;
    const hash = await getHash(src);
    if (blockedHashes[hash]) {
      pic.firstChild.src = '';
    }
  })
}

// #5. Render Script

function decoratePage() {
  // inject custom interactive elements to access script features
  injectHacksMenu();
  injectThemesMenu();
  decoratePictures();
  
  const messages = document.querySelectorAll('.room-component-message-container');
  const msgs = RoomClient?.state?.messages;
  if (msgs?.length) {
    if (msgs.length!==messages.length) {
      console.error('message mismatch!', { messages, msgs });
      return;
    }
    for (let i=0;i<msgs.length;i++) {
      const msgElt = messages[i];
      const msgFlair = msgElt.querySelector('.room-component-flair');
      let msgExtra = msgFlair.querySelector('.user-extra');
      if (!msgExtra) {
        msgExtra = crel('span', { className: 'user-extra' });
        msgFlair.append(msgExtra);
      }
      const { user } = msgs[i];
      const extras = [ user.karma+'', user.gender?.toUpperCase(), (new Date(user.created_at)).toLocaleDateString(), user.gold?'GOLD':null, user.master?'MASTER':null, user.mod?'MOD':null ].filter(v=>!!v).join(' - ');
      msgExtra.textContent = '  ' + extras;
    }
  }
}

function render() {
  let next;
  const observer = new MutationObserver(() => {
    cancelAnimationFrame(next);
    next = requestAnimationFrame(decoratePage);
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
  decoratePage();
}
  
// window.onbeforeunload=()=>"";

// document.body.addEventListener('blur', e => {
//   if (e.target.classList.contains('room-component-input-textarea')) {
//     e.target.focus();
//   }
// }, true);

function init() {
  // override some builtin behavior
  overrideDumbSettings();
  // apply theme
  applyTheme();
  // initialize picture control
  initPictures();
  // start rendering our script
  render();
}

init();