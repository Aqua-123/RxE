declare type ImgurResponse = {
  data: {
    id: string;
    title: string | null;
    description: string | null;
    datetime: number;
    type: string; // mimetype
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    bandwith: number;
    vote: null;
    favorite: boolean;
    nsfw: null;
    section: null;
    account_url: null;
    account_id: number;
    is_ad: boolean;
    in_most_viral: boolean;
    tags: unknown[];
    ad_type: number;
    ad_url: string;
    in_gallery: boolean;
    deletehash: string;
    name: string;
    link: string;
  };
  success: boolean;
  status: number;
};

declare type ImgurImage = {
  /** Imgur image ID. */
  id: string;

  /** Encoded reference to image, as found in message or created. */
  payload: string;
};

declare type RitsuChatImage = {
  /** Link to image resource. */
  url: string;

  /** Encoded reference to image, as found in message or created. */
  payload: string;

  /** First version supporting format used, for placeholder info. */
  version: string;
};
