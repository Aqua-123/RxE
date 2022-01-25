/* eslint-disable prettier/prettier */
import React from "react";
import { bioWithoutImage, extractBioImage } from "../altpfp";
import { wrapLinks } from "../messagelinks";
import { wrapMaterialIcons } from "../messagestyles";

function BioImage({ raw }: { raw: string }) {
    return <div style={{
        padding: "0.3em",
        margin: "0.5em",
        backgroundColor: "var(--ritsu-hair-color)",
        color: "black",
        display: "inline-block",
        userSelect: "none",
        borderRadius: "0.3em",
        fontSize: "0.8em"
    }}
        title={raw}>
        Profile picture ({raw.length} chars)
    </div>
}

function wrapBio(bio: string) {
    return wrapMaterialIcons(bio,
        (nonIcon) =>
            wrapLinks(nonIcon, (rest) => rest)
        , true);
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
        const bioImage = bioImageRaw && <BioImage raw={bioImageRaw} />;
        // some icons may be cut off
        const bioCompact = `${bioStripped.slice(0, 202)}... `;
        const bioRaw = isCompact ? bioCompact : bioStripped;
        return (
            <span>
                {wrapBio(bioRaw)}
                {isCompact && (
                    <span
                        role="button"
                        tabIndex={0}
                        onMouseDown={() => this.bio_expand()}
                        style={{
                            color: '#00abf3',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Show More
                    </span>
                )}
                {!isCompact && bioImage}
            </span>
        );
    };
}
