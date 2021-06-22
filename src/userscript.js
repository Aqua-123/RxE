// ==UserScript==
// @name        New script - emeraldchat.com
// @namespace   Violentmonkey Scripts
// @match       https://www.emeraldchat.com/app
// @version     1.0
// @author      -
// @grant GM_setValue
// @grant GM_getValue
// @grant unsafeWindow
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
  setTimeout(overrideDumbSettings, 1000);
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

// fix Audio button so it's persistent as intended
document.body.addEventListener('mouseup', ({target}) => {
  if (target.classList.contains('mute-button')) {
    Cookies.set('muted', MuteButtonClient.state.muted ? 't' : '')
  }
});

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
  font-size: 2em;
  font-weight: 900;
}
.room-component-message-picture:hover + .picture-control, .picture-control:hover {
  display: block;
  cursor: pointer;
}
.picture-button {
  padding: .5em;
  border: 1px solid black;
  border-radius: 2px;
  background: #333;
}
.picture-button.block:hover {
  color: red;
}
.picture-button.save:hover {
  color: green;
}
.image-grid div {
  display: inline-block;
  width: 6em;
  height: 6em;
  margin: 5px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}
.lookup-button {
  float: right;
  background: black;
  padding: 2px;
  margin-top: -4px;
}
`;

const noNagCSS = `
.emerald-jumbotron-message {
  display: none;
}
`;

// incomplete. "default" should probably stay empty. fix/flesh out themes here.
const themes = {
  default: ``,
  light: `
.ui-bg.ui-bg { background: rgba(0,0,0,.5); }
body { background: #ddd; }
body>div>nav { background: #bbb; }
.main-hamburger.main-hamburger { color: #333; }
.navigation-notification-unit.navigation-notification-unit { color: #333; }
.side-panel.side-panel { background: #ccc; color: #222; }
.actionicon-mega.actionicon-mega { color: #333; }
.actionicon-mega.actionicon-mega:hover { background: #aaa; }
.navigation-dropdown-content.navigation-dropdown-content { background: #aaa; color: #333; }
.room-user-label.room-user-label { color: #555; }
.room-component-left.room-component-left { background: #ccc; }
.room-component-center.room-component-center { background: #ddd; }
.room-component-right.room-component-right {  background: #ccc; }
.room-component-container.room-component-container { color: #333; }
.room-notification.room-notification { background: #ccc }
.navigation-notification-icons.navigation-notification-icons { background: #bbb; }
.user-flair.user-flair { text-shadow: 1px 1px 1px black; }
.room-component-input.room-component-input { background: #fff; }
.room-component-input-textarea.room-component-input-textarea { color: #222; }
.ui-menu.ui-menu { background: #ddd; color: #333; }
.picture-upload-button.picture-upload-button+label { background: #ccc; color: #444; }
.ui-button-text.ui-button-text:hover { color: #666; }
.user-profile-menu.user-profile-menu { background: #ddd; color: #333; }
.user-profile-tab.user-profile-tab { color: #444; }
.ui-tab..ui-tab { color: #444; }
.user-micropost-unit.user-micropost-unit { color: #333; }
.picture-button, .lookup-button { background: #eee; }
.themes-menu-container li { color: #666; }
.themes-menu-container li.selected { color: #222; }
.themes-menu-container li:hover { background: #fff; }
`,
  ritsu: `
body>div>nav { background: black; }
.room-component-left.room-component-left { background: black; }
.room-component-center.room-component-center { background: black; }
.room-component-right.room-component-right { background: black; }
.background-container { background: red; }
.room-component-messages { background: black; }
.room-component-input { background: purple; }
.ui-button-match { background: purple; }
.ui-search body.navigation-notification-icons { background: black; }
#container.container { background: black; }
.dashboard-button.animated.zoomIn { background: purple; }
.navigation-notification-icons.navigation-notification-icons {  background: transparent; }
.ui-search-box { background: #0b0b0b }
.side-panel.side-panel { background: black; }
.actionicon-mega.actionicon-mega:hover { background: 0b0b0b; }
.ui-menu.ui-menu { background: black }
.ui-menu.ui-menu, .notification-unit.notification-unit { background: #111; }
.ui-interests-bg { background: grey; }
.navigation-notification-unit.navigation-notification-unit:hover { color: purple; }
.navigation-notification-unit { color: red; }
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
  styleSheet.textContent = commonCSS + themes[currentTheme] + (hacks.disableNags?noNagCSS:'');
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
// note: channel_json

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
    const { disableNags, enableModUI, universalFriend, fancyColors } = hacks;
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
      "Nagging and limits on temp accounts is ",
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
    React.createElement('li', {
      onMouseDown: () => this.r(()=>{ applyHacks({fancyColors: !fancyColors}) })
    }, 
      "Unusual flair colors are ",
      React.createElement("em", {}, fancyColors?'ENABLED':'DISABLED')
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
const savedPictures = [];

function initPictures() {
  const hashes = GM_getValue('blockedPictures', []);
  hashes.forEach(hash => blockedHashes[hash] = true);
  savedPictures.push(...GM_getValue('savedPictures', []));
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

function savePicture(src) {
  savedPictures.push(src);
  GM_setValue('savedPictures', savedPictures);
}

function insertPicture(url) {
  const time = (new Date).toISOString()
  const picture = {
    author_id: App.user.id,
    created_at: time,
    description: null,
    id: 9550000 + ~~(Math.random()*1e6),
    image: {
      thumb: { url },
      url
    },
    image_processing: false,
    image_tmp: null,
    micropost_id: null,
    picture_album_id: null,
    temporary: false,
    title: null,
    updated_at: time,
    url
  };
  console.log(picture);
  RoomClient.send_picture(picture);
  // Still not quite right. picture doesn't show correctly to yourself until you rejoin the chat.
}

function decoratePictures() {
  // add block and save buttons on every image in chat.
  const pics = document.querySelectorAll('.room-component-message-picture-container');
  pics.forEach(async pic => {
    if (!pic.querySelector('.picture-control')) {
      pic.append(crel('div', {
        className: 'picture-control'
      }));
      pic.lastChild.append(crel('div', {
        className: 'picture-button block material-icons',
        textContent: 'delete_forever',
        onmousedown: e=>blockPicture(e.target.parentElement.parentElement.firstChild.src)
      }));
      pic.lastChild.append(crel('div', {
        className: 'picture-button save material-icons',
        textContent: 'bookmark_border',
        onmousedown: e=>savePicture(e.target.parentElement.parentElement.firstChild.src)        
      }));
    }
    const src = pic.firstChild.src;
    const hash = await getHash(src);
    if (blockedHashes[hash]) {
      pic.firstChild.src = '';
    }
  });
  // also look for an Upload Image dialog to populate with saved images
  const uploadForm = document.querySelector('form#picture_upload');
  if (!uploadForm) return;
  const dialog = uploadForm.parentElement;
  const nagText = dialog.querySelector('.ui-menu-text');
  if (nagText?.firstChild?.tagName === 'B') {
    nagText.style.display = 'none';
  } else {
    if (nagText) nagText.style.display = '';
  }

  let imageGrid = dialog.querySelector('.image-grid');
  if (imageGrid) return;
  const buttons = dialog.querySelector('.ui-menu-buttons');
  const closeButton = buttons.firstChild;
  imageGrid= crel('div', {
    className: 'image-grid'
  });
  savedPictures.forEach(src=> {
    imageGrid.append(crel('div', { 
      style: `background-image: url(${encodeURI(src)})`,
      onmousedown: () => {
        insertPicture(src);
        MenuReactMicro.close();
      }
    }));
  });
  dialog.insertBefore(imageGrid, buttons);
}

// #5. Custom Profile fields

function decorateProfileDialog() {
  if (!hacks.fancyColors) return;
  const flairLabel = document.querySelector('label.ui-select[for="flair-select"]');
  if (!flairLabel) return;
  if (flairLabel.firstChild.id ==='flair-select') {
    // not replaced yet.
    const newFlairLabel = flairLabel.cloneNode();
    flairLabel.firstChild.id = 'flair-select-old';
    flairLabel.for='flair-select-old';
    flairLabel.style.display='none';
    const input = crel('input', { 
      id: 'flair-select',
      className: 'alt-flair-select',
      value: App.user.flair.color
    })
    newFlairLabel.append(input);
    flairLabel.parentElement.insertBefore(newFlairLabel, flairLabel.nextSibling);
    const event = new Event('change', { bubbles: true });
    input.oninput = () => flairLabel.firstChild.dispatchEvent(event);
  }
}

// #6. Render Script

function reorderMenu() {
  const gold = document.evaluate("//li[text()='Emerald Gold']", document).iterateNext();
  if (hacks.disableNags) {
    gold?.remove();
  } else {
    if (gold && gold?.parentElement?.firstChild === gold) {
      gold.parentElement.append(gold);
    }
  }
}

function decoratePage() {
  // inject custom interactive elements to access script features
  reorderMenu();
  injectHacksMenu();
  injectThemesMenu();
  decoratePictures();
  decorateProfileDialog();

  const roomUserLabel = document.querySelector('.room-component-right .room-user-label');
  if (roomUserLabel) {
    const anyProfileLink = roomUserLabel.querySelector('button');
    if (!anyProfileLink) {
      const button = crel('button', {
        className: 'lookup-button',
        textContent: 'Lookup',
        onclick: () => {
          if (!window.UserViewReact) {
            alert('open a user profile once first');
            return;
          }
          const id = prompt('Enter a user id', UserViewReact.state.user.id);
          if (id) {
            UserViewReact.state.user.id = id;
            UserViewReact.view_profile();
          }
      }});
      roomUserLabel.append(button);
    }
  }
  
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
      const { messages: lines, user } = msgs[i];
      const extras = [ user.karma+'', user.gender?.toUpperCase(), (new Date(user.created_at)).toLocaleDateString(), user.gold?'GOLD':null, user.master?'MASTER':null, user.mod?'MOD':null ].filter(v=>!!v).join(' - ');
      msgExtra.textContent = '  ' + extras;
      // clean up Facing Ditto's mess
      const divs = msgElt.querySelector('.room-component-message-text').childNodes;
      while (divs.length > lines.length) {
        divs[0].remove();
      }
    }
  }
}

function refreshRooms() {
  // not working right. needs more work to make sort more stable, and keep current room selected
  // setInterval(() => {
  //   $.ajax({
  //     type: "GET",
  //     url: "channels_default",
  //     dataType: "json",
  //     success: e => {
  //       RoomChannelSelectClient.setState({
  //         text_channels: e.text_channels,
  //         voice_channels: e.voice_channels
  //       });
  //       const tmp = RoomChannelSelectClient.join;
  //       RoomChannelSelectClient.join = ()=>{};
  //       RoomChannelSelectClient.joinStartingChannel(e.text_channels);
  //       RoomChannelSelectClient.join = tmp;
  //     }
  //   })
  // }, 60*1000);
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
  //
  refreshRooms();
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