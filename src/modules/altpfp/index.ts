/* eslint-disable prettier/prettier */
import React, { Attributes } from 'react';
import ReactDOM from 'react-dom';
import browserWindow from '~src/browserWindow';
import { wrapMethod, expect, timeout } from '~src/utils';
import * as format0 from './format0';
import { interpolation } from './interpolation';

type ImageFormatType = "0";

interface ImageFormat {
    unpack(compressed: string): string | null;
    compress(image: Image, options: SamplingOptions): Promise<string>;
}

const BIO_IMAGE = /rxe-pfp:([A-Za-z0-9+/=]+)/g;
const makeBioImage = (compressed: string) => `rxe-pfp:${compressed}`;

function extractBioImage(bio: string): string | null {
    return Array.from(bio.matchAll(BIO_IMAGE))
        .map((match) => match[1])
        .slice(-1)[0] ?? null;
}

function replaceBioImage(bio: string, compressed: string) {
    const lastIndex = Array.from(bio.matchAll(BIO_IMAGE))
        .map((match) => match.index)
        .filter(index => index !== undefined)
        .slice(-1)[0];
    // intended behaviour if undefined
    return bio.slice(0, lastIndex)
        + (bio[(lastIndex ?? 0) - 1] === "\n" ? "" : "\n")
        + makeBioImage(compressed);
}

async function saveBioImage(user: EmeraldUser, compressed: string) {
    console.log(`compressed: ${compressed.length} chars`)
    return new Promise<void>((resolve, reject) => {
        const params = {
            display_name: user.display_name,
            bio: replaceBioImage(user.bio, compressed),
            flair: { color: user.flair.color },
            gender: user.gender
        };
        $.ajax({
            type: 'GET',
            url: `/update_profile?${$.param(params)}`,
            dataType: 'json',
            success() {
                UserProfileReact?.load(user.id);
                resolve();
            },
            error() { reject() }
        } as JQueryAjaxSettings) // old jQuery moment
    });
}

const imageFormats: Record<ImageFormatType, ImageFormat> = {
    "0": format0
};


async function compressImage(png64: string, format: ImageFormatType, options: SamplingOptions) {
    if (!(format in imageFormats)) throw new Error(`Format '${format}' not implemented`);
    const image = new Image();
    await timeout(expect(image, "load", (img) => { img.src = png64 }), 5000);
    console.time('image-compression');
    const compressed = imageFormats[format].compress(image, options).then(data => format + data);
    console.timeEnd('image-compression')
    return compressed;
}


function unpackImage(compressed: string): string | null {
    const format = compressed[0];
    if (!(format in imageFormats)) {
        console.error(`could not unpack image: ${compressed} (unknown format '${format}')`);
        return null;
    }
    return imageFormats[format as ImageFormatType].unpack(compressed.slice(1));
}

function getDisplayPicture(user: EmeraldUser): string {
    if (user.bio === undefined) {
        console.warn('user.bio is undefined');
        return user.display_picture;
    }
    const imageCompressed = extractBioImage(user.bio);
    if (imageCompressed) {
        const imageUnpacked = unpackImage(imageCompressed);
        if (imageUnpacked) {
            /*
            console.info(
                `Loaded custom image (${imageCompressed}) as (${imageUnpacked})`
            );
            */
            return imageUnpacked;
        }
    }
    return user.display_picture;
}

// lame
interface Prototype {
    constructor: {
        name: string
    }
}

function interceptUser<T, K extends FunctionKeys<T>>(
    obj: T,
    method: K,
    getUser: PrependParam<ReplaceMethodReturn<T, K, EmeraldUser | undefined>, T>,
    before = true
) {
    if (typeof obj[method] !== "function" || typeof getUser !== "function") return;
    const methodName = `${method}()`;
    wrapMethod(obj, method, function wrapper(...params) {
        const user = getUser(this, ...params);
        const name = (obj as Prototype)?.constructor?.name;
        const instance = name ? `'${name}' instance` : `unknown class instance`;
        if (user === undefined) return;
        if (!user || typeof user !== "object"
            || !('display_picture' in user) || user.display_picture === undefined) {

            console.warn(`expected EmeraldUser, in wrapper on ${instance} ${methodName} got: `, user);
            return;
        }
        if (user.bio === undefined) {
            console.warn(`EmeraldUser is missing 'bio' in wrapper on ${instance} ${methodName}`, user);
            return;
        }
        user.display_picture = getDisplayPicture(user);
    }, before);
}

async function uploadPicture(file: File | undefined, user: EmeraldUser) {
    if (!file) { alert('No file uploaded.'); return; }
    if (!file.type.startsWith('image')) { alert('File is not an image or its format is not supported.'); }
    const reader = new FileReader();
    await timeout(expect(reader, 'load', (fileReader) => fileReader.readAsDataURL(file)), 5000);

    if (!reader.result) throw new Error("No result");
    const url = reader.result.toString();
    const options = { width: 48, height: 48 };

    const image = await compressImage(url, "0", { interpolator: interpolation.none, ...options });
    await saveBioImage(user, image);
}


// eslint-disable-next-line camelcase
function profile_picture(this: UserProfile) {
    // eslint-disable-next-line camelcase
    const { user, current_user } = this.state.data;
    if (user.id === current_user.id) {
        const picture = React.createElement('img', {
            // onMouseDown: this.update_profile_picture.bind(this),
            className: 'user-profile-avatar',
            src: user.display_picture
        } as Attributes);
        const cloudIcon = React.createElement('span', {
            style: {
                fontSize: '36px'
            },
            className: 'material-icons'
        }, 'cloud_upload');
        const fileInput = React.createElement('input', {
            type: "file",
            onChange(ev) {
                const { currentTarget: input } = ev;
                const file = input.files?.[0];
                try { uploadPicture(file, user); }
                catch (reason) { alert(`Image loading failed: ${reason}`); }
            },
            id: "ritsu-profile-picture-upload",
            style: {
                display: "none"
            }
        })
        const overlay = React.createElement('label', {
            // onMouseDown: this.update_profile_picture.bind(this),
            className: 'user-profile-picture-hover',
            for: "ritsu-profile-picture-upload"
        }, cloudIcon);
        return React.createElement('span', null, picture, fileInput, overlay);
    }
    // eslint-disable-next-line no-shadow, camelcase
    const open_picture = function open_picture() {
        const element = React.createElement(Picture, {
            data: {
                src: user.display_picture
            }
        });
        ReactDOM.render(element, document.getElementById('ui-hatch-2'));
    };
    return React.createElement('img', {
        onMouseDown: open_picture,
        className: 'user-profile-avatar',
        src: user.display_picture
    });

}



export function init() {
    // eslint-disable-next-line camelcase
    UserProfile.prototype.profile_picture = profile_picture;
    interceptUser(Room.prototype, 'received', (_, messageData) => messageData.user);
    interceptUser(UserProfile.prototype, 'profile_picture', (self) => self.state.data.user);
    interceptUser(FriendUnit.prototype, 'body', (self) => self.props.data);
    interceptUser(browserWindow.Comment.prototype, 'render', (self) => self.state.comment_data?.user);
    interceptUser(Micropost.prototype, 'render', (self) => self.state.data?.author)
    interceptUser(MessageNotificationUnit.prototype, 'image', (self) => self.props.data.data.sender);
    interceptUser(Message.prototype, 'render', (self) => self.props.data.user);
    interceptUser(RoomUserUnit.prototype, 'body', (self) => self.props.data);
    interceptUser(UserUnit.prototype, 'body', (self) => self.props.data);
    interceptUser(UserView.prototype, 'top', (self) => self.state.user);
    wrapMethod(Dashboard.prototype, 'render', function render() {
        // todo: this isn't available immediately
        if (App.user.bio !== undefined)
            this.state.user.display_picture = getDisplayPicture(App.user);
        else console.warn('App.user.bio is undefined');
    })

    // todo (prototype)
    UserProfile.prototype.update_profile_picture =
        // eslint-disable-next-line camelcase
        function update_profile_picture() {
            const p = prompt;
            const a = alert;
            const png = p("Enter image url:", "data:image/png;base64,");
            if (!png) return;
            const size = p("Enter size (8x8 to 64x64)", "8x8")?.split(/\s*x\s*/g);
            if (!size) return;
            if (size.length !== 2) {
                a(`Dimension must be two values: ${size}`);
                return;
            }
            const [width, height] = size.map((dim) => parseInt(dim, 10));
            if (Number.isNaN(width) || Number.isNaN(height)) {
                a('Not a number');
                return;
            }
            const options = { width, height, interpolator: interpolation.none };
            const promise = compressImage(png, "0", options)
                ?.then((image) => saveBioImage(this.state.data.user, image))
                ?.catch((error) => {
                    if (error instanceof Error) a(`${error.message}\n(See console for trace)`)
                    else a(error);
                    throw error;
                }
                );
            if (!promise) a('got null');
        };
}
