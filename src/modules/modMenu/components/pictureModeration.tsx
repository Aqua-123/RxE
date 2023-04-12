/* eslint-disable camelcase */
import React from "react";
import md5 from "md5";
import { ListPreferenceMap } from "~src/listprefcache";
import { P, Preferences } from "~src/preferences";

export function setModIconCount(count: number) {
  const countOverlay = document.querySelector(
    ".notification-count-overlay"
  ) as HTMLElement;
  if (countOverlay) countOverlay.textContent = String(count);
  if (count > 0) {
    countOverlay.style.display = "inline";
  } else {
    countOverlay.style.display = "none";
  }
}

async function getUserData(id: number) {
  const response = await fetch(`https://emeraldchat.com/profile_json?id=${id}`);
  const data = (await response.json()) as ProfileData;
  return data;
}

interface CheckmarkButtonProps {
  isSelected: boolean;
  onClick: () => void;
}

function CheckmarkButton(props: CheckmarkButtonProps): JSX.Element {
  const { isSelected, onClick } = props;
  const checkMark = (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ fill: "#fff" }}>
      <path d="M6 11.776l-3.88-3.888-1.12 1.152 5 5 10-10-1.12-1.152-8.88 8.888z" />
    </svg>
  );
  return (
    <button
      className={`checkmark-button${isSelected ? " selected" : ""} `}
      onClick={onClick}
      type="button"
    >
      {isSelected && checkMark}
    </button>
  );
}

export async function getImageData(url: string) {
  const response = await fetch(url);
  return response.blob();
}

export function hashBlob(blob: Blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onload = () => {
      const data = fileReader.result as string;
      const hash = md5(data);
      resolve(hash);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

function updatePicHashListPref(hash: string, action: string) {
  ListPreferenceMap.addItem({ key: hash, item: action }, P.picModHashes);
}

export async function picModFetchHandler(
  modPictures: ModPicture[],
  approveFunc: (arg0: number) => void,
  deleteFunc: (arg0: number) => void
) {
  const pictureModerations = await Promise.all(
    modPictures.map(async (modPicture) => {
      const imageData = await getImageData(modPicture.image_url);
      const imageHash = (await hashBlob(imageData)) as string;
      return { ...modPicture, imageHash };
    })
  );

  const recordedHashes = Preferences.get(P.picModHashes);

  const filteredElements = pictureModerations.filter((elem) =>
    recordedHashes.some((recordedHash) => recordedHash[0] === elem.imageHash)
  );

  filteredElements.forEach((filteredElem) => {
    const action = recordedHashes.find(
      (recordedHash) => recordedHash[0] === filteredElem.imageHash
    )?.[1];

    if (action === "approve") {
      approveFunc(filteredElem.id);
    } else if (action === "delete") {
      deleteFunc(filteredElem.id);
    }
  });

  const filteredPictureModerations = pictureModerations.filter((modPicture) => {
    const hash = modPicture.imageHash;
    return recordedHashes.every(([recordedHash, _]) => recordedHash !== hash);
  });

  return filteredPictureModerations;
}

interface pictureModerationState {
  picture_moderations: ModPicture[];
  selectedElements: number[];
  interval: NodeJS.Timer | undefined;
}

class ModifiedPictureModeration extends React.Component<
  {},
  pictureModerationState
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      picture_moderations: [],
      selectedElements: [],
      interval: undefined
    };
  }

  componentDidMount() {
    document.body.classList.add("picModMounted");
    this.fetch();
    this.update();
  }

  componentWillUnmount() {
    const { interval } = this.state;
    if (interval) clearInterval(interval);
    document.body.classList.remove("picModMounted");
  }

  update = () => {
    const interval = setInterval(() => {
      if (!document.body.classList.contains("picModMounted")) return;
      this.fetch();
    }, 15000);
    this.setState({ interval });
  };

  handleFetch = async (modPictures: ModPicture[]) => {
    /* const pictureModerations = await Promise.all(
      modPictures.map(async (modPicture) => {
        const imageData = await getImageData(modPicture.image_url);
        const imageHash = (await hashBlob(imageData)) as string;
        return { ...modPicture, imageHash };
      })
    );

    const recordedHashes = Preferences.get(P.picModHashes);

    const filteredElements = pictureModerations.filter((elem) =>
      recordedHashes.some((recordedHash) => recordedHash[0] === elem.imageHash)
    );

    filteredElements.forEach((filteredElem) => {
      const action = recordedHashes.find(
        (recordedHash) => recordedHash[0] === filteredElem.imageHash
      )?.[1];

      if (action === "approve") {
        this.approve(filteredElem.id);
      } else if (action === "delete") {
        this.delete(filteredElem.id);
      }
    });

    const filteredPictureModerations = pictureModerations.filter(
      (modPicture) => {
        const hash = modPicture.imageHash;
        return recordedHashes.every(
          ([recordedHash, _]) => recordedHash !== hash
        );
      }
    ); */

    const filteredPictureModerations = await picModFetchHandler(
      modPictures,
      this.approve,
      this.delete
    );

    this.setState({ picture_moderations: filteredPictureModerations });
    setModIconCount(filteredPictureModerations.length);
  };

  fetch = () => {
    $.ajax({
      type: "GET",
      url: "/picture_moderations",
      dataType: "json",
      success: this.handleFetch.bind(this)
    });
  };

  stateUpdate = (id: number) => {
    const { picture_moderations } = this.state;
    const newListOfPics = picture_moderations.filter((t) => t.id !== id);
    const state = {
      picture_moderations: newListOfPics
    };
    setModIconCount(newListOfPics.length);
    this.setState(state);
  };

  approve = (id: number) => {
    const { state } = this;
    const picture = state.picture_moderations.find((p) => p.id === id);
    const hash = picture?.imageHash;
    if (hash) updatePicHashListPref(hash, "approve");
    $.ajax({
      type: "POST",
      url: `/picture_moderations/${id}/approve`,
      dataType: "json",
      success: this.stateUpdate.bind(this, id),
      error: (err) => {
        if (err.status === 404 || err.status === 403)
          this.stateUpdate.bind(this, id);
      }
    });
  };

  delete = (id: number) => {
    const { state } = this;
    const picture = state.picture_moderations.find((p) => p.id === id);
    const hash = picture?.imageHash;
    if (hash) updatePicHashListPref(hash, "delete");
    $.ajax({
      type: "DELETE",
      url: `/picture_moderations/${id}`,
      dataType: "json",
      success: this.stateUpdate.bind(this, id),
      error: (err) => {
        if (err.status === 404 || err.status === 403)
          this.stateUpdate.bind(this, id);
      }
    });
  };

  approveSelectedElements = () => {
    const { state } = this;
    const selectedElements = state.selectedElements.slice();
    selectedElements.forEach((id) => {
      // find the element with matching id
      const element = state.picture_moderations.find((e) => e.id === id);
      // approve the element
      if (element) this.approve(element.id);
    });
    // clear the selected elements array
    this.setState({ selectedElements: [] });
  };

  deleteSelectedElements = () => {
    const { state } = this;
    const selectedElements = state.selectedElements.slice();
    selectedElements.forEach((id) => {
      // find the element with matching id
      const elementIndex = state.picture_moderations.findIndex(
        (e) => e.id === id
      );
      // remove the element from the original array
      state.picture_moderations.splice(elementIndex, 1);
      this.delete(id);
    });
    // clear the selected elements array
    this.setState({ selectedElements: [] });
  };

  toggleElementSelection(id: number) {
    const { picture_moderations, selectedElements } = this.state;

    const selectedElementHash = picture_moderations.find(
      (e) => e.id === id
    )?.imageHash;

    const filteredIds = picture_moderations
      .filter((element) => element.imageHash === selectedElementHash)
      .map((element) => element.id);

    let newSelectedElements: number[];
    if (selectedElements.includes(id)) {
      newSelectedElements = selectedElements.filter(
        (elementId) => !filteredIds.includes(elementId)
      );
    } else {
      newSelectedElements = [...selectedElements, ...filteredIds];
    }

    this.setState({ selectedElements: newSelectedElements });
  }

  render() {
    const { picture_moderations, selectedElements } = this.state;

    const deleteSelectedElements = () => {
      this.deleteSelectedElements();
    };

    const approveSelectedElements = () => {
      this.approveSelectedElements();
    };

    const toggleElementSelection = (id: number) => {
      this.toggleElementSelection(id);
    };

    return (
      <div className="dashboard-container">
        <button onClick={deleteSelectedElements} type="button">
          Delete Selected Images
        </button>
        <button onClick={approveSelectedElements} type="button">
          Approve Selected Images
        </button>
        <div className="meet-cards-container video-moderation">
          {picture_moderations.map((user) => (
            <div key={user.id} className="checkmark-button-container">
              <CheckmarkButton
                isSelected={selectedElements.includes(user.id)}
                onClick={() => toggleElementSelection(user.id)}
              />
              <PictureModerationUnit
                key={`picture_moderation${user.id}`}
                data={user}
                delete={this.delete}
                approve={this.approve}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export function pictureModerationOverride() {
  PictureModeration = ModifiedPictureModeration;
  PictureModerationUnit.prototype.render = function pmuRender() {
    const { data } = this.props;
    return (
      <div
        className="dashboard-button animated"
        style={{ paddingTop: "30px", height: "400px" }}
      >
        <img src={data.image_url} alt="" className="mod-approval-pic" />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onMouseDown={async (e) => {
            let user;
            if (!this.state) {
              const userData = await getUserData(data.user_id);
              user = userData.user;
            } else user = this.state.user;
            this.setState({ user });
            UserViewGenerator.generate({ event: e, user });
          }}
        >
          <h2>{`${data.display_name}(${data.username})`}</h2>
        </div>
        <button
          className="ui-button-match-mega gold-button"
          onClick={this.approve}
          type="button"
        >
          Approve
        </button>
        <button
          className="ui-button-match-mega red-button"
          onClick={this.delete}
          type="button"
        >
          Reject
        </button>
      </div>
    );
  };
}
