import React from "react";
import { onClickOrKeyUp } from "~src/utils";
import {
  bioWithoutImage,
  extractBioImage,
  saveBio
} from "~src/modules/altpfp/bio-image";
import { wrapRich } from "./richtext";
import { formatName } from "../altpfp/formats";

type BioImageProps = {
  raw: string;
  onRemove: null | (() => void);
};

const confirmRemoval = () =>
  // eslint-disable-next-line no-alert
  confirm("Are you sure you want to remove your profile picture?");

function BioImage({ raw, onRemove }: BioImageProps) {
  const remove =
    onRemove &&
    (() => {
      if (confirmRemoval()) onRemove();
    });
  return (
    <div title={raw} className="bio-image">
      Profile picture ({formatName(raw[0])}, {raw.length} chars)
      {!!remove && [" ", <b {...onClickOrKeyUp(remove)}>×</b>]}
    </div>
  );
}

export function init() {
  UserProfile.prototype.bio = function bio() {
    const {
      compact_bio: compactBio,
      data: { user }
    } = this.state;
    const isCompact = compactBio && user.bio.length > 202;
    const bioImageRaw = extractBioImage(user.bio);
    const bioStripped = bioWithoutImage(user.bio);
    const bioImage = bioImageRaw && (
      <BioImage
        raw={bioImageRaw}
        onRemove={
          user.id === App.user.id ? () => saveBio(user, bioStripped) : null
        }
      />
    );
    // some icons may be cut off
    const bioCompact = `${bioStripped.slice(0, 202)}... `;
    const bioRaw = isCompact ? bioCompact : bioStripped;
    return (
      <span>
        {wrapRich(bioRaw)}
        {isCompact && (
          <span
            role="button"
            tabIndex={0}
            onMouseDown={() => this.bio_expand()}
            className="bio-expand"
          >
            Show More
          </span>
        )}
        {!isCompact && bioImage}
      </span>
    );
  };
}
