/* eslint-disable camelcase */
import React from "react";
import ReactDOM from "react-dom";
import {
  picModFetchHandler,
  setPicModIconCount,
  clearPicModCache,
  updatePicHashListPref
} from "./utils";
import { CheckmarkButton, getUserData } from "../utils";
// import { sendDataToFirestore } from "../firebase";
import { sendTrialReq } from "../firebase";

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
    const filteredPictureModerations = await picModFetchHandler(
      modPictures,
      this.approve,
      this.delete
    );

    this.setState({ picture_moderations: filteredPictureModerations });
    setPicModIconCount(filteredPictureModerations.length);
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
    setPicModIconCount(newListOfPics.length);
    this.setState(state);
  };

  findPicture = (id: number) => {
    const { state } = this;
    return state.picture_moderations.find((p) => p.id === id);
  };

  approve = (id: number) => {
    const picture = this.findPicture(id);
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
    const logJson = { action: "approve", pictureBase64: picture?.base64Image };
    // sendDataToFirestore(logJson);
    sendTrialReq(logJson, "picture");
  };

  delete = (id: number) => {
    const picture = this.findPicture(id);
    const hash = picture?.imageHash;
    if (hash) updatePicHashListPref(hash, "reject");
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
    const logJson = { action: "approve", pictureBase64: picture?.base64Image };
    // sendDataToFirestore(logJson);
    sendTrialReq(logJson, "picture");
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
      this.delete(id);
      const elementIndex = state.picture_moderations.findIndex(
        (e) => e.id === id
      );
      // remove the element from the original array
      state.picture_moderations.splice(elementIndex, 1);
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

  selectAllElements() {
    const { picture_moderations, selectedElements } = this.state;
    const allIds = picture_moderations.map((element) => element.id);

    // Check if all elements are already selected
    const allSelected = allIds.every((id) => selectedElements.includes(id));

    // If all elements are already selected, unselect all elements
    // Otherwise, select all elements
    if (allSelected) {
      this.setState({ selectedElements: [] });
    } else {
      this.setState({
        selectedElements: allIds
      });
    }
  }

  actionButtons() {
    const { picture_moderations, selectedElements } = this.state;
    const deleteSelectedElements = () => {
      this.deleteSelectedElements();
    };

    const approveSelectedElements = () => {
      this.approveSelectedElements();
    };

    const selectAllElements = () => {
      this.selectAllElements();
    };

    return (
      <div>
        <button onClick={approveSelectedElements} type="button">
          Approve Selected Images
        </button>
        <button onClick={deleteSelectedElements} type="button">
          Delete Selected Images
        </button>
        <button onClick={selectAllElements} type="button">
          {!selectedElements.length ||
          picture_moderations.length !== selectedElements.length
            ? "Select All"
            : "Unselect All"}
        </button>
        <button onClick={clearPicModCache} type="button">
          Clear Cache
        </button>
      </div>
    );
  }

  render() {
    const { picture_moderations, selectedElements } = this.state;

    const toggleElementSelection = (id: number) => {
      this.toggleElementSelection(id);
    };

    return (
      <div className="dashboard-container">
        {this.actionButtons()}
        <br />
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
        {picture_moderations.length ? this.actionButtons() : undefined}
        <br />
      </div>
    );
  }
}

export function pictureModerationOverride() {
  PictureModeration = ModifiedPictureModeration;
  PictureModerationUnit.prototype.render = function pmuRender() {
    const { data } = this.props;
    const open_picture = function () {
      const element = React.createElement(Picture, {
        data: {
          src: data.image_url
        }
      });
      ReactDOM.render(element, document.getElementById("ui-hatch-2"));
    };
    return (
      <div
        className="dashboard-button animated"
        style={{ paddingTop: "30px", height: "400px" }}
      >
        <div>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            src={data.image_url}
            onMouseDown={open_picture}
            alt=""
            className="mod-approval-pic"
          />
        </div>
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
