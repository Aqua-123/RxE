/* eslint-disable camelcase */
import React from "react";
import md5 from "md5";

import ReactDOM from "react-dom";

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

function stateUpdate(this: PictureModeration, id: Number) {
  const newListOfPics = this.state.picture_moderations.filter(
    (t) => t.id !== id
  );
  const state = {
    picture_moderations: newListOfPics
  };
  setModIconCount(newListOfPics.length);
  this.setState(state);
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
  return (
    <button
      className={`checkmark-button${isSelected ? " selected" : ""} `}
      onClick={onClick}
      type="button"
    >
      {isSelected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          style={{ fill: "#fff" }}
        >
          <path d="M6 11.776l-3.88-3.888-1.12 1.152 5 5 10-10-1.12-1.152-8.88 8.888z" />
        </svg>
      )}
    </button>
  );
}

class PictureModeration extends React.Component<
  {},
  {
    picture_moderations: ModPicture[];
    selectedElements: number[];
    interval: NodeJS.Timer | undefined;
  }
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

  fetch = () => {
    $.ajax({
      type: "GET",
      url: "/picture_moderations",
      dataType: "json",
      success: function fetchSuccess(this: PictureModeration, e: ModPicture[]) {
        const state = {
          picture_moderations: e.map((modPicture) => {
            const hash = md5(modPicture.image_url);
            return { ...modPicture, imageHash: hash };
          })
        };
        this.setState(state);
        setModIconCount(e.length);
      }.bind(this)
    });
  };

  approve = (id: number) => {
    $.ajax({
      type: "POST",
      url: `/picture_moderations/${id}/approve`,
      dataType: "json",
      success: stateUpdate.bind(this, id)
    });
  };

  delete = (id: number) => {
    $.ajax({
      type: "DELETE",
      url: `/picture_moderations/${id}`,
      dataType: "json",
      success: stateUpdate.bind(this, id)
    });
  };

  approveSelectedElements = () => {
    const { state } = this;
    const selectedElements = state.selectedElements.slice();
    selectedElements.forEach((index) => {
      // approve the element
      const { id } = state.picture_moderations[index];
      this.approve(id);
    });
    // clear the selected elements array
    this.setState({ selectedElements: [] });
  };

  deleteSelectedElements = () => {
    const { state } = this;
    const selectedElements = state.selectedElements.slice();
    // sort the array in descending order to avoid index issues
    selectedElements.sort((a, b) => b - a);
    selectedElements.forEach((index) => {
      // remove the element from the original array
      const { id } = state.picture_moderations[index];
      this.delete(id);
    });
    // clear the selected elements array
    this.setState({ selectedElements: [] });
  };

  toggleElementSelection(index: number) {
    const { state } = this;
    const selectedElements = state.selectedElements.slice();
    if (selectedElements.includes(index)) {
      selectedElements.splice(selectedElements.indexOf(index), 1);
    } else {
      selectedElements.push(index);
      // find all elements with matching image hashes and add them to the selection
      const selectedElementHash = state.picture_moderations[index].imageHash;
      state.picture_moderations.forEach((element, i) => {
        if (i !== index && element.imageHash === selectedElementHash) {
          selectedElements.push(i);
        }
      });
    }
    this.setState({ selectedElements });
  }

  render() {
    const { picture_moderations, selectedElements } = this.state;
    return (
      <div className="dashboard-container">
        <button onClick={() => this.deleteSelectedElements()} type="button">
          Delete Selected Images
        </button>
        <button onClick={() => this.approveSelectedElements()} type="button">
          Approve Selected Images
        </button>
        <div className="meet-cards-container video-moderation">
          {picture_moderations.map((user, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="checkmark-button-container"
            >
              <CheckmarkButton
                isSelected={selectedElements.includes(index)}
                onClick={() => this.toggleElementSelection(index)}
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
  ActionTray.prototype.pictureModeration = function atPM() {
    ReactDOM.render(
      React.createElement(PictureModeration, null),
      document.getElementById("container")
    );
  };

  PictureModerationUnit.prototype.render = function pmuRender() {
    const { data } = this.props;
    console.log(1);
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
