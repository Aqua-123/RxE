/* eslint-disable react/button-has-type */
/* eslint-disable camelcase */
import React from "react";
import {
  clearNameModCache,
  nameModFetchHandler,
  setNameModIconCount,
  updateNameRecPref
} from "./utils";
import { CheckmarkButton, getUserData } from "../utils";
// import { sendDataToFirestore } from "../firebase";
import { sendTrialReq } from "../firebase";

interface pictureModerationState {
  display_name_moderations: ModName[];
  selectedElements: number[];
  interval: NodeJS.Timer | undefined;
}

class ModifiedNameModeration extends React.Component<
  {},
  pictureModerationState
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      display_name_moderations: [],
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

  handleFetch = async (modNames: ModName[]) => {
    const filteredNameModeration = await nameModFetchHandler(
      modNames,
      this.approve,
      this.delete
    );
    setNameModIconCount(filteredNameModeration.length);
    this.setState({ display_name_moderations: filteredNameModeration });
  };

  fetch = () => {
    $.ajax({
      type: "GET",
      url: "/display_name_moderations",
      dataType: "json",
      success: this.handleFetch.bind(this)
    });
  };

  stateUpdate = (id: number) => {
    const { display_name_moderations } = this.state;
    const newListofNames = display_name_moderations.filter((t) => t.id !== id);
    const state = { display_name_moderations: newListofNames };
    setNameModIconCount(newListofNames.length);
    this.setState(state);
  };

  findNameObj = (id: number) => {
    const { state } = this;
    return state.display_name_moderations.find((p) => p.id === id);
  };

  approve = (id: number) => {
    const picture = this.findNameObj(id);
    if (!picture) return;
    const newName = picture.new_display_name;
    if (newName) updateNameRecPref(newName, "approve");

    $.ajax({
      type: "POST",
      url: `/display_name_moderations/${id}/approve`,
      dataType: "json",
      success: this.stateUpdate.bind(this, id),
      error: (err) => {
        if (err.status === 404 || err.status === 403)
          this.stateUpdate.bind(this, id);
      }
    });

    const logJson = { nameModeration: newName, action: "approve" };
    // sendDataToFirestore(logJson);
    sendTrialReq(logJson, "name");
  };

  delete = (id: number) => {
    const picture = this.findNameObj(id);
    if (!picture) return;
    const newName = picture.new_display_name;
    if (newName) updateNameRecPref(newName, "reject");
    $.ajax({
      type: "DELETE",
      url: `/display_name_moderations/${id}`,
      dataType: "json",
      success: this.stateUpdate.bind(this, id),
      error: (err) => {
        if (err.status === 404 || err.status === 403)
          this.stateUpdate.bind(this, id);
      }
    });

    const logJson = { nameModeration: newName, action: "reject" };
    // sendDataToFirestore(logJson);
    sendTrialReq(logJson, "name");
  };

  approveSelectedElements = () => {
    const { state } = this;
    const selectedElements = state.selectedElements.slice();
    selectedElements.forEach((id) => {
      // find the element with matching id
      const element = state.display_name_moderations.find((e) => e.id === id);
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
      const elementIndex = state.display_name_moderations.findIndex(
        (e) => e.id === id
      );
      // remove the element from the original array
      state.display_name_moderations.splice(elementIndex, 1);
    });
    // clear the selected elements array
    this.setState({ selectedElements: [] });
  };

  toggleElementSelection(id: number) {
    const { display_name_moderations, selectedElements } = this.state;

    const selectedElementName = display_name_moderations.find(
      (e) => e.id === id
    )?.new_display_name;

    const filteredIds = display_name_moderations
      .filter((element) => element.new_display_name === selectedElementName)
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
    const { display_name_moderations, selectedElements } = this.state;
    const allIds = display_name_moderations.map((element) => element.id);

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
    const { display_name_moderations, selectedElements } = this.state;

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
          Approve Selected Names
        </button>
        <button onClick={deleteSelectedElements} type="button">
          Delete Selected Names
        </button>
        <button onClick={selectAllElements} type="button">
          {!selectedElements.length ||
          display_name_moderations.length !== selectedElements.length
            ? "Select All"
            : "Unselect All"}
        </button>
        <button onClick={clearNameModCache} type="button">
          Clear Cache
        </button>
      </div>
    );
  }

  render() {
    const { display_name_moderations, selectedElements } = this.state;

    const toggleElementSelection = (id: number) => {
      this.toggleElementSelection(id);
    };

    return (
      <div className="dashboard-container">
        {this.actionButtons()}
        <br />
        <div className="meet-cards-container video-moderation">
          {display_name_moderations.map((user) => (
            <div key={user.id} className="checkmark-button-container">
              <CheckmarkButton
                isSelected={selectedElements.includes(user.id)}
                onClick={() => toggleElementSelection(user.id)}
              />
              <DisplayNameModerationUnit
                key={`picture_moderation${user.id}`}
                data={user}
                delete={this.delete}
                approve={this.approve}
              />
            </div>
          ))}
        </div>
        {display_name_moderations.length ? this.actionButtons() : undefined}

        <br />
      </div>
    );
  }
}

export function nameModerationOverride() {
  DisplayNameModeration = ModifiedNameModeration;
  DisplayNameModerationUnit.prototype.render = function dnmuRender() {
    const { data } = this.props;
    return (
      <div
        className="dashboard-button animated"
        style={{ paddingTop: "30px", height: "300px" }}
      >
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
          <h2 style={{ whiteSpace: "normal" }}>New: {data.new_display_name}</h2>
          <h2 style={{ whiteSpace: "normal" }}>Old: {data.old_display_name}</h2>
          <h2>({this.props.data.username})</h2>
        </div>
        <button
          className="ui-button-match-mega gold-button"
          onClick={this.approve}
        >
          Approve
        </button>
        <button
          className="ui-button-match-mega red-button"
          onClick={this.delete}
        >
          Reject
        </button>
      </div>
    );
  };
}
