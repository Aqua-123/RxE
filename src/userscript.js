// ==UserScript==
// @name        Ritsu x Emerald
// @namespace   Emerald Bot - Ritsu Project
// @match       http*://emeraldchat.com/app
// @match       http*://www.emeraldchat.com/app
// @version     0.2.3
// @description Custom Emerald Chat themes and fixes.
// @icon        https://static.emeraldchat.com/uploads/picture/image/9529291/Ritsu_Icon.png
// @grant GM_setValue
// @grant GM_getValue
// @grant unsafeWindow
// @run-at document-end
// @description 6/18/2021, 12:48:48 AM
// ==/UserScript==

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
const crel = (elt, obj={}) => Object.assign(document.createElement(elt), obj);
const rel = React.createElement;

// #1. Overriding builtin behaviors

function overrideDumbSettings() {
  if (hacks.disableNags) {
    App.user.karma = 31337;
    App.user.temp = false;
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

// network request middleware
$.__ajax = $.ajax;
$.ajax = options => {
  switch (options.url) {
    case "/user_is_temp": return options.success({ status: false, temp: false });
    default:
      const modifiedOptions = {...options, success: e => {
        if (hacks.universalFriend && options.url.startsWith('/profile_json?')) {
          e.friend = true;
        }
        options.success?.(e);
      }}
      $.__ajax(modifiedOptions);
  }
};

// websocket middleware -- inert
function ws_middleware() {
  // problems: breaks on reconnect and needs async mitm capability to be useful
  // potential uses:
  // - userlist in WFAF
  App.cable.connection.webSocket.onmessage_old = App.cable.connection.webSocket.onmessage;
  App.cable.connection.webSocket.onmessage = function (e) {
    let data = JSON.parse(e.data);
    wsMsg = new CustomEvent("wsMsg", {
      detail: {
        data: data
      }
    });
    document.dispatchEvent(wsMsg);
    return App.cable.connection.webSocket.onmessage_old(e);
  }
}

// hide dumb console errors
win.DashboardClient = {
  setState: () => {}
};
win.MenuReactMicroStatic = {
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

/* settings dialog */
.ritsu-menu-container li {
  padding: 0.5em;
  color: #aaa;
  font-weight: normal;
  cursor: pointer;
}
.ritsu-menu-container li:hover {
  background: #333;
}
.ritsu-menu-container li.selected {
  color: white;
}
.hacks-warning {
  margin: 2em;
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
  border: 1px solid var(--app-fg-color);
  border-radius: 2px;
  background: var(--app-bg-color);
  color: var(--app-fg-color);
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
  padding: 2px;
  margin-top: -4px;
}
.disable-after::after {
  content: '';
  display: none;
}
.picker-flair-select {
  height: 3em !important;
  vertical-align: bottom;
}
.navigation-dropdown-ritsu {
  color: #f965fec4;
}
.main-logo-text {
  display: inline-block;
  line-height: 14px;
  height: 32px;
  vertical-align: middle;
  font-size: 1.3em;
  padding-left: .5em;
}
.user-extra { padding-left: 5em; }
`;

const noNagCSS = `
.emerald-jumbotron-message {
  display: none;
}
`;

const themeScaffold = `
body>div>nav { background: var(--header-bg-color); }
.room-component-left.room-component-left { background: var(--roomlist-bg-color); }
.room-component-center.room-component-center { background: var(--chat-bg-color); }
.room-component-right.room-component-right { background: var(--userlist-bg-color); }
.room-component-messages { background: var(--chat-bg-color); }
.room-notification.room-notification { background: var(--chat-bg-color); }
.room-component-input { background: var(--input-bg-color); }
.room-component-input-textarea.room-component-input-textarea { color: var(--input-fg-color); }
.ui-button-match { background: var(--input-bg-color); }
#container { background: var(--app-bg-color); }
.room-component-container.room-component-container { color: var(--app-fg-color); }
.dashboard-button.animated.zoomIn { background: var(--dashboard-button-bg-color); }
.navigation-notification-icons.navigation-notification-icons { background: transparent; }
.ui-search-box { background: var(--search-bg-color); }
.side-panel.side-panel { background: var(--panel-bg-color); }
.actionicon-mega.actionicon-mega { color: var(--panel-fg-color); }
.actionicon-mega.actionicon-mega:hover { background: var(--item-hover-bg-color); }
.ui-bg.ui-bg { background: var(--dialog-overlay-bg-color); }
.ui-menu.ui-menu, .notification-unit.notification-unit { background: var(--dialog-bg-color); color: var(--dialog-fg-color); }
.ui-interests-bg.ui-interests-bg { background: var(--interests-bg-color) !important; }
.navigation-notification-unit.navigation-notification-unit:hover { background: var(--header-hover-bg-color); color: var(--header-hover-fg-color); }
.navigation-notification-unit { color: var(--header-fg-color); }
.navigation-dropdown-content.navigation-dropdown-content { background: var(--menu-bg-color); color: var(--menu-fg-color); }
.dashboard-icon.dashboard-icon { color: var(--dashboard-icon-fg-color); }
.dashboard-button.dashboard-button:hover { color: var(--dashboard-hover-fg-color); background: var(--dashboard-hover-bg-color); }
.actionicon-icon.actionicon-icon { color: var(--dashboard-icon-fg-color); }
.main-hamburger.main-hamburger { color: var(--header-fg-color); }
.main-hamburger.main-hamburger:hover, .main-logo.main-logo:hover { background: var(--header-hover-bg-color) !important; color: var(--header-hover-fg-color); }
.user-profile-menu.user-profile-menu { background: var(--dialog-bg-color); }
.user-micropost-input-background.user-micropost-input-background { background: var(--dialog-input-bg-color); }
.ui-button-micro.ui-button-micro { background: var(--dialog-button-bg-color); }
.user-profile-tab.user-profile-tab, .ui-tab.ui-tab { color: var(--tab-fg-color); }
.user-profile-tab-active.user-profile-tab-active, .ui-tab-active.ui-tab-active { color: var(--tab-active-fg-color); }
.ui-button-mega.ui-button-mega:hover { background: var(--dialog-button-hover-bg-color); color: var(--dialog-button-hover-fg-color); }
.ui-button-mega.ui-button-mega { background: var(--dialog-button-bg-color); }
.ui-input.ui-input { background: var(--dialog-input-bg-color) !important; }
.dashboard-card-image.dashboard-card-image { border-color: var(--dashboard-icon-fg-color); }
.user-comment-input-background.user-comment-input-background { background: var(--dialog-input-bg-color); }
.room-component-left .room-user-label { color: var(--roomlist-title-fg-color); }
.room-component-right .room-user-label { color: var(--userlist-title-fg-color); }
.picture-upload-button.picture-upload-button+label { background: var(--upload-button-bg-color); color: var(--upload-button-fg-color); }


.main-logo-text { color: var(--menu-fg-color); }
.navigation-dropdown-ritsu { color: var(--ritsu-menu-fg-color); }
.navigation-dropdown-ritsu:hover { color: var(--ritsu-menu-hover-fb-color); }
`;

// a set of all CSS variables we're using. Themes must update the ones they care about
const baseVars=`
:root {
  --ritsu-hair-color: #f965fec4;
  --ritsu-hair-dark-color: #b821bd;
  

  --header-bg-color: #100f10;
  --header-hover-bg-color: #3d4046;
  --app-bg-color: black;
  --dialog-bg-color: #111;
  --dialog-overlay-bg-color: rgba(0,0,0,.93);
  --dialog-button-bg-color: #17191b;
  --dialog-button-hover-bg-color: #151515;
  --dialog-input-bg-color: #17191b;
  --dashboard-button-bg-color: #100f10;
  --dashboard-hover-bg-color: #33323270;
  --roomlist-bg-color: black;
  --chat-bg-color: black
  --userlist-bg-color: black;
  --input-bg-color: #211f21;
  --search-bg-color: #0b0b0b;
  --panel-bg-color: #0c0c0c;
  --item-hover-bg-color: #35383e;
  --interests-bg-color: #2c2f35;
  --menu-bg-color: #0a0a0a;
  --upload-button-bg-color: #41444a;
  
  
  --header-fg-color: white;
  --header-hover-fg-color: var(--ritsu-hair-color);
  --app-fg-color: #bebfc5;
  --dialog-fg-color: #f1f1f2;
  --dialog-button-hover-fg-color: var(--ritsu-hair-color);
  --dashboard-icon-fg-color: var(--ritsu-hair-color);
  --dashboard-hover-fg-color: var(--ritsu-hair-color);
  --roomlist-title-fg-color: #99a3b4;
  --userlist-title-fg-color: #99a3b4;
  --tab-fg-color: #c2c8d6;
  --tab-active-fg-color: var(--ritsu-hair-color);
  --input-fg-color: #caccd0;
  --panel-fg-color: white;
  --menu-fg-color: white;
  --upload-button-fg-color: #b4bccc
  
  --ritsu-menu-fg-color: var(--ritsu-hair-color);
  --ritsu-menu-hover-fb-color: var(--ritsu-hair-color);
}
`;

// incomplete. "default" should probably stay empty. fix/flesh out themes here.
const themes = {
  default: ``,
  ritsu: ``,
  light: `  
:root {
/* TODO: we should set ALL the variables here since this is a dark->light switch */
  --header-bg-color: #bbb;
  --header-hover-bg-color: #aaa;
  --app-bg-color: #ddd;
  --dialog-bg-color: #ddd;
  --dialog-overlay-bg-color: rgba(0,0,0,.5);
  --roomlist-bg-color: #ccc;
  --chat-bg-color: #ddd;
  --userlist-bg-color: #ccc;
  --input-bg-color: #fff;
  --panel-bg-color: #ccc;
  --menu-bg-color: #aaa;
  --upload-button-bg-color: #ccc;
  
  
  --header-fg-color: #333;
  --header-hover-fg-color: var(--ritsu-hair-dark-color);
  --app-fg-color: #333;
  --dialog-fg-color: #333;
  --menu-fg-color: #222;
  --roomlist-title-fg-color: #555;
  --userlist-title-fg-color: #555;
  --tab-fg-color: #444;
  --input-fg-color: #222;
  --panel-fg-color: #333;
  --menu-fg-color: #333;
  --upload-button-fg-color: #444;
  
  
  --ritsu-menu-fg-color: var(--ritsu-hair-dark-color);
}
.user-flair.user-flair,.user-extra-gender { text-shadow: 1px 1px 1px black; }

/* TODO: Merge the rules below into the scaffold */
.actionicon-mega.actionicon-mega:hover { background: #aaa; }
.ui-button-text.ui-button-text:hover { color: #666; }
.user-profile-menu.user-profile-menu { background: #ddd; color: #333; }
.user-micropost-unit.user-micropost-unit { color: #333; }

.ritsu-menu-container li { color: #666; }
.ritsu-menu-container li.selected { color: #222; }
.ritsu-menu-container li:hover { background: #fff; }
`,
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
  let css = commonCSS + (hacks.disableNags?noNagCSS:'');
  if (currentTheme !== 'default') {
    css += baseVars + themeScaffold + themes[currentTheme];
  }
  styleSheet.textContent = css;
}

function selectTheme(id) {
  GM_setValue('theme', id);
  applyTheme();
}

class Themes extends React.Component {
  r(f) { f?.(); this.setState({i: Math.random()}) }
  render() {  
    return rel("div", {
        style: {
          margin: "1em 0"
        }
    }, rel("div", {
      className: "m1",
      style: { marginBottom: "2em" }
    }, "Choose your theme"),
    ...Object.keys(themes).map(theme=> rel('li', {
      className: currentTheme === theme ? "selected" : '',
      onMouseDown: () => this.r(()=>selectTheme(theme))  
    }, theme[0].toUpperCase()+theme.slice(1)))
    );
  }
}

// #3. WTF HAX 

let needsReload = false;

let hacks = GM_getValue('hacks', { disableNags: true, fancyColors: true });

function applyHacks(obj) {
  hacks = { ...hacks, ...obj };
  GM_setValue('hacks', hacks);
  overrideDumbSettings();
  needsReload = true;
}

class Hacks extends React.Component {
  render() {
    const { disableNags, enableModUI, universalFriend, fancyColors } = hacks;
    return rel("div", {
        style: {
          marginTop: "5px"
        }
    }, rel("div", {
      className: "m1",
      style: { marginBottom: "1em" }
    }, "Enable and disable various hacks here"),
    rel('li', {
      onMouseDown: () => this.props.refresh(()=>{ applyHacks({disableNags: !disableNags}) })
    }, 
      "Nagging and limits on temp accounts is ",
      rel("em", {}, disableNags?'DISABLED':'ENABLED')
    ),
    rel('li', {
      onMouseDown: () => this.props.refresh(()=>{ applyHacks({enableModUI: !enableModUI}) })
    }, 
      "(Useless) access to moderator/master panel is ",
      rel("em", {}, enableModUI?'VISIBLE':'HIDDEN')
    ),
    rel('li', {
      onMouseDown: () => this.props.refresh(()=>{ applyHacks({universalFriend: !universalFriend}) })
    }, 
      "Access to any profile is ",
      rel("em", {}, universalFriend?'ENABLED':'DISABLED')
    ),
    // rel('li', {
    //   onMouseDown: () => this.props.refresh(()=>{ applyHacks({fancyColors: !fancyColors}) })
    // }, 
    //   "Unusual flair colors are ",
    //   rel("em", {}, fancyColors?'ENABLED':'DISABLED')
    // ),                        
    needsReload? rel('div', {
      className: 'hacks-warning'
    }, "You may need to reload the app for your changes to take effect."):null
    );
  }
}

// #3.5 GOTO 3

let settings = GM_getValue('settings', { imgControl: true, imgProtect: true, showInfo: false });

function applySettings(obj) {
  settings = { ...settings, ...obj };
  GM_setValue('settings', settings);
  needsReload = true;  
}

class Settings extends React.Component {
  render() {
    const { imgControl, imgProtect, showInfo } = settings;
    return rel("div", {
      style: { margin: "1em 0"}
    }, rel("div", {
        className: "m1",
        style: { marginBottom: "1em" }      
      }, "Image Settings"),
      rel('li', {
        onMouseDown: () => this.props.refresh(()=>{ applySettings({imgControl: !imgControl}) })
      },
         "Overlay controls to block and favorite images: ",
         rel("em", {}, imgControl?"ON":"OFF")
      ),
      rel('li', {
        onMouseDown: () => this.props.refresh(()=>{ applySettings({imgProtect: !imgProtect}) })
      },
         "Hide images from low karma accounts: ",
         rel("em", {}, imgProtect?"ON":"OFF")
      ),
      rel("div", {
        className: "m1",
        style: { marginBottom: "1em" }      
      }, "Message Settings"),
      rel('li', {
        onMouseDown: () => this.props.refresh(()=>{ applySettings({showInfo: !showInfo}) })
      },
         "Show user info (karma,gender,since) on messages: ",
         rel("em", {}, showInfo?"ON":"OFF")
      ),
    );
  }
}

// #4. Unified settings dialog

function CustomDialog(props) {
  const { title, className, content } = props;
  return rel("div", {
      key: "custom_menu",
      className: className
  }, title, rel(BR), rel(BR), rel(content), rel("div", {
      className: "ui-menu-buttons"
  }, rel("div", {
      onMouseDown: () => MenuReact.close(),
      className: "ui-button-text"
  }, "Close")))
}

class RitsuSettings extends React.Component {
  r= f => { f?.(); this.setState({i: Math.random()}) }
  render() {
    return rel("div", {},
      rel(Settings, {refresh:this.r}),
      rel(Themes, {refresh:this.r}),
      rel(Hacks, {refresh:this.r})
    );
  }
}

function openRitsuDialog() {
  const element = rel(Menu, null, rel(CustomDialog, { 
    title: "Ritsu Settings", 
    className: "ritsu-menu-container", 
    content: RitsuSettings
  }));
  ReactDOM.render(element, document.getElementById("ui-hatch"))
}


function injectRitsuMenu() {
  let ritsuMenu = document.querySelector('.navigation-dropdown-ritsu');
  if (!ritsuMenu) {
    document.querySelector('.navigation-dropdown-content')?.prepend(crel('li', { 
      className: 'navigation-dropdown-ritsu',
      textContent: 'Ritsu Menu',
      onmousedown: openRitsuDialog
    }))
  }  
}

// #5. Image control

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
}

function decoratePictures() {
  // add block and save buttons on every image in chat.
  const pics = document.querySelectorAll('.room-component-message-picture-container');
  pics.forEach(async pic => {
    if (settings.imgControl && !pic.querySelector('.picture-control')) {
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

// #6. Custom Profile fields

function decorateProfileDialog() {
  if (!hacks.fancyColors) return;
  const flairLabel = document.querySelector('label.ui-select[for="flair-select"]');
  if (!flairLabel) return;
  flairLabel.for='flair-select-old';
  if (flairLabel.firstChild.id ==='flair-select') {
    // not replaced yet.
    const newFlairLabel = flairLabel.cloneNode();
    newFlairLabel.classList.add('disable-after');
    flairLabel.firstChild.id = 'flair-select-old';
    flairLabel.style.display='none';
    const input = crel('input', { 
      id: 'flair-select',
      className: 'alt-flair-select',
      value: App.user.flair.color,
      onchange: ()=> colorInput.value=input.value
    });
    const colorInput = crel('input', {
      id: 'flair-select',
      type: 'color',
      className: 'picker-flair-select',
      value: App.user.flair.color,
      onchange: ()=>{
        input.value=colorInput.value;
        input.oninput();
      }
    });
    newFlairLabel.append(input, colorInput);
    flairLabel.parentElement.insertBefore(newFlairLabel, flairLabel.nextSibling);
    const event = new Event('change', { bubbles: true });
    input.oninput = () => flairLabel.firstChild.dispatchEvent(event);
  }
}

// #7. Arbitrary account lookup (Ritsu claims this is buggy. He lies. Maybe.)

function addLookupButton() {
  const roomUserLabel = document.querySelector('.room-component-right .room-user-label');
  if (roomUserLabel) {
    const anyProfileLink = roomUserLabel.querySelector('.lookup-button');
    if (!anyProfileLink) {
      const button = crel('div', {
        className: 'material-icons navigation-notification-unit lookup-button',
        textContent: 'face',
        onclick: () => {
          if (!win.UserViewReact) {
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
}

// #8. Messages

function decorateMessages() {
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
      const { messages: lines, user, picture } = msgs[i];
      if (settings.imgProtect && picture) {
        const img = msgElt.querySelector('.room-component-message-text')?.firstChild?.firstChild;
        if (img instanceof Image && (user.temp || user.karma < 10)) {
          img.remove();
        }
      }
      if (settings.showInfo) {
        let msgExtra = msgFlair.querySelector('.user-extra');
        if (!msgExtra) {
          msgExtra = crel('span', { className: 'user-extra' });
          msgExtra.append(crel('b', { textContent: '\xa0Karma:\xa0' }));
          msgExtra.append(crel('span', { textContent: user.karma }));
          msgExtra.append(crel('b', { textContent: '\xa0Gender:\xa0' }));
          msgExtra.append(crel('span', {
            className: 'user-extra-gender',
            style: `color: ${user.gender=='f'?'pink':user.gender=='m'?'lightblue':'green'}`,
            textContent: user.gender?.toUpperCase()
          }));
          msgExtra.append(crel('b', { textContent: '\xa0Since:\xa0' }));
          msgExtra.append(crel('span', { textContent: (new Date(user.created_at)).toLocaleDateString() }));
          if (user.gold) {
            msgExtra.append(crel('b', { style: 'color: rgb(255,202,0)', textContent: '\xa0GOLD' }));
          }
          if (user.master) {
            msgExtra.append(crel('b', { style: 'color: rgb(255,0,0)', textContent: '\xa0CALLAN' }));
          }
          if (user.mod) {
            msgExtra.append(crel('b', { style: 'color: rgb(255,0,0)', textContent: '\xa0MOD' }));
          }
          msgFlair.append(msgExtra);
        }
      } else {
        msgExtra.innerHTML='';
      }
      // clean up Facing Ditto's mess
      const divs = msgElt.querySelector('.room-component-message-text').childNodes;
      while (divs.length > lines.length) {
        divs[0].remove();
      }
    }
  }

}

// #9. Decorate Header

function decorateHeader() {
  // replace logo
  const logo = document.querySelector('.main-logo');
  if (logo && logo.src != GM_info.script.icon) {
    logo.src = GM_info.script.icon;
  }
  // add text next to logo
  const logoText = document.querySelector('.main-logo-text');
  if (!logoText) {
    const { name, version } = GM_info.script;
    const text = crel('div', {
      className: 'main-logo-text',
      textContent: `${name} ${version}`
    });
    logo?.parentElement.insertBefore(text, logo?.nextSibling);
  }
  // add fullscreen button
  const iconsHolder = document.querySelector('.navigation-notification-icons');
  if (document.fullscreenEnabled && iconsHolder?.firstChild?.textContent?.indexOf('full')===-1) {
    const fullscreenIcon = crel('span', {
      className: 'material-icons navigation-notification-unit',
      textContent: 'open_in_full',
      onmousedown: async () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          fullscreenIcon.textContent = 'open_in_full';
        } else {
          await document.body.requestFullscreen();
          fullscreenIcon.textContent = 'close_fullscreen';
        }
      }
    });
    iconsHolder.prepend(crel('span'));
    iconsHolder.firstChild.append(fullscreenIcon);
  }
}

// #A. Render Script

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
  injectRitsuMenu();
  decorateHeader();
  decoratePictures();
  decorateProfileDialog();
  addLookupButton();
  decorateMessages();

  // ad block
  document.querySelectorAll('iframe:not([src*="captcha"])').forEach(iframe=>iframe.remove());
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
  
// win.onbeforeunload=()=>"";

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