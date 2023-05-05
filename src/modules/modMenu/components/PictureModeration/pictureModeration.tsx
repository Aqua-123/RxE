/* eslint-disable camelcase */
import React from "react";
import {
  picModFetchHandler,
  setModIconCount,
  getUserData,
  clearPicModCache,
  updatePicHashListPref
} from "./utils";

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

interface pictureModerationState {
  picture_moderations: ModPicture[];
  selectedElements: number[];
  interval: NodeJS.Timer | undefined;
  selectAllLabel: string;
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
      interval: undefined,
      selectAllLabel: "Select All"
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

  selectAllElements() {
    const { picture_moderations, selectedElements } = this.state;
    const allIds = picture_moderations.map((element) => element.id);

    // Check if all elements are already selected
    const allSelected = allIds.every((id) => selectedElements.includes(id));

    // If all elements are already selected, unselect all elements
    // Otherwise, select all elements
    if (allSelected) {
      this.setState({ selectedElements: [] });
      this.setState({ selectAllLabel: "Select All" });
    } else {
      this.setState({ selectedElements: allIds });
      this.setState({ selectAllLabel: "Unselect All" });
    }
  }

  render() {
    const { picture_moderations, selectedElements, selectAllLabel } =
      this.state;

    const deleteSelectedElements = () => {
      this.deleteSelectedElements();
    };

    const approveSelectedElements = () => {
      this.approveSelectedElements();
    };

    const toggleElementSelection = (id: number) => {
      this.toggleElementSelection(id);
    };

    const selectAllElements = () => {
      this.selectAllElements();
    };

    return (
      <div className="dashboard-container">
        <button onClick={approveSelectedElements} type="button">
          Approve Selected Images
        </button>
        <button onClick={deleteSelectedElements} type="button">
          Delete Selected Images
        </button>
        <button onClick={selectAllElements} type="button">
          {selectAllLabel}
        </button>
        <button onClick={clearPicModCache} type="button">
          Clear Cache
        </button>
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