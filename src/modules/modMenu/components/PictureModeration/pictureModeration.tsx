/* eslint-disable camelcase */
import React from "react";
import ReactDOM from "react-dom";
import {
  picModFetchHandler,
  setPicModIconCount,
  clearPicModCache,
  updatePicHashListPref,
  getPredictions
} from "./utils";
import { CheckmarkButton, getUserData } from "../utils";
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

    const picModPred = await getPredictions(filteredPictureModerations);
    this.setState({ picture_moderations: picModPred });
    setPicModIconCount(picModPred.length);
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
    const logJson = { action: "reject", pictureBase64: picture?.base64Image };
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
          {picture_moderations.map((pic) => (
            <div key={pic.id} className="checkmark-button-container">
              <CheckmarkButton
                isSelected={selectedElements.includes(pic.id)}
                onClick={() => toggleElementSelection(pic.id)}
              />
              <PictureModerationUnit
                key={`picture_moderation${pic.id}`}
                data={pic}
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
  PictureModerationUnit.prototype.feedback = async function fb(
    agreement: boolean
  ) {
    const { data } = this.props;
    const selectedLabel =
      this.state && this.state.selectedLabel
        ? this.state.selectedLabel
        : data.prediction; // Assuming you fetch or set this from your state or props
    console.log(selectedLabel);
    const correct_checkbox = agreement; // true for Agree, false for Disagree

    const setFeedbackState = (status: boolean) => {
      this.setState({ feedbackDone: status });
    };
    try {
      const response = await fetch("https://class2.emeraldchat.com/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: data.base64Image, // Make sure this contains the base64 encoded image
          correctCheckbox: correct_checkbox,
          label: selectedLabel,
          prediction: data.prediction
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      setFeedbackState(true);
      console.log(responseData); // Handle the response data as needed
    } catch (error) {
      console.error("There was an error sending the feedback:", error);
    }
  };

  PictureModerationUnit.prototype.render = function pmuRender() {
    const { data } = this.props;

    const open_picture = function op() {
      const element = React.createElement(Picture, {
        data: {
          src: data.image_url
        }
      });
      ReactDOM.render(element, document.getElementById("ui-hatch-2"));
    };

    const handleLabelChange = (event: any) => {
      this.setState({ selectedLabel: event.target.value });
    };

    const feedbackDone = this.state ? this.state.feedbackDone : false;

    return (
      <div
        className="dashboard-button animated"
        style={{ paddingTop: "30px", height: "530px" }}
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
            if (!this.state || !this.state.user) {
              const userData = await getUserData(data.user_id);
              user = userData.user;
            } else user = this.state.user;
            this.setState({ user });
            UserViewGenerator.generate({ event: e, user });
          }}
        >
          <h2>{`${data.display_name}`}</h2>
        </div>
        <h2>{`Prediction: ${data.prediction}`}</h2>
        <div>
          {!feedbackDone ? (
            <div>
              {/* Dropdown and buttons */}
              <div>
                <select
                  value={this.state?.selectedLabel}
                  onChange={handleLabelChange}
                  defaultValue=""
                  style={{ backgroundColor: "#100f10", display: "block" }}
                >
                  {/* Dropdown options */}
                  <option value="option1">Not_NSFW</option>
                  <option value="option2">Suggestive_NSFW</option>
                  <option value="option3">General_NSFW</option>
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center"
                }}
              >
                <button
                  className="ui-button-match-mega"
                  onClick={() => this.feedback(true)}
                  type="button"
                >
                  Agree
                </button>
                <button
                  className="ui-button-match-mega"
                  onClick={() => this.feedback(false)}
                  type="button"
                >
                  Disagree
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Feedback received message */}
              <h2>Feedback Received</h2>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
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
      </div>
    );
  };
}
