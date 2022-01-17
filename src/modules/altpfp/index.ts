/* eslint-disable prettier/prettier */
import browserWindow from '~src/browserWindow';
import { wrapMethod } from '~src/utils';
import * as format0 from './format0';
import { interpolation } from './interpolation';

type ImageFormatType = "0";

interface ImageFormat {
    unpack(compressed: string): string | null;
    compress(url: string, options: SamplingOptions): Promise<string>;
}

function extractBioImage(s: string) {
    return s?.match(/pfp:([A-Za-z0-9+/=]+)/)?.[1];
}

const imageFormats: Record<ImageFormatType, ImageFormat> = {
    "0": format0
};


function compressImage(png64: string, format: ImageFormatType, options: SamplingOptions) {
    if (!(format in imageFormats)) return null;
    return imageFormats[format].compress(png64, options).then(data => format + data);
}


function unpackImage(compressed: string) {
    const format = compressed[0];
    if (!(format in imageFormats)) return null;
    return imageFormats[format as ImageFormatType].unpack(compressed.slice(1));
}

function getDisplayPicture(user: EmeraldUser): string {
    const imageCompressed = extractBioImage(user.bio);
    if (imageCompressed) {
        const imageUnpacked = unpackImage(imageCompressed);
        if (imageUnpacked) {
            console.info(
                `Loaded custom image (${imageCompressed}) as (${imageUnpacked})`
            );
            return imageUnpacked;
        }
        console.error(`Could not unpack image: ${imageCompressed}`);
    }
    return user.display_picture;
}

function interceptUser<T, K extends FunctionKeys<T>>(
    obj: T,
    method: K,
    getUser: PrependParam<ReplaceMethodReturn<T, K, EmeraldUser | undefined>, T>,
    before = true
) {
    if (typeof obj[method] !== "function" || typeof getUser !== "function") return;
    wrapMethod(obj, method, function wrapper(...params) {
        const user = getUser(this, ...params);
        if (user) user.display_picture = getDisplayPicture(user);
    }, before);
}

export function init() {
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
        this.state.user.display_picture = getDisplayPicture(App.user);
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
                ?.then((image) => a(image))
                ?.catch((error) => error instanceof Error ? a(`${error.message}\n${error.stack}`) : a(error));
            if (!promise) a('got null');
        };
}
