const maxUndos = 50;

class actionExecutor {
  editor;

  constructor(editor) {
    this.editor = editor;
  }

  selectionAdd(data, reverse) {
    if (!reverse) {
      this.editor.selection.push(data);
      return {
        action: "selectionAdd",
      };
    }

    data = this.editor.selection.pop();
    return {
      action: "selectionAdd",
      data,
    };
  }

  selectionReplace(data) {
    let remember = {
      action: "selectionReplace",
      data: this.editor.selection.slice(),
    };
    this.editor.selection = data;
    return remember;
  }
  selectionRemoveAtIndex(data, reverse) {
    if (!reverse) {
      return {
        action: "selectionRemoveAtIndex",
        data: {
          index: data,
          item: this.editor.selection.splice(data, 1)[0],
        },
      };
    }
    this.editor.selection.splice(data.index, 0, data.item);
    return {
      action: "selectionRemoveAtIndex",
      data: data.index,
    };
  }

  linkWayPointsToggle(data) {
    let wptA = data[0];
    let wptB = data[1];

    if (
      wptA.links[wptB.index] === undefined &&
      wptB.links[wptA.index] === undefined
    ) {
      // add a -> b
      wptA.links[wptB.index] = true;
      wptB.links[wptA.index] = false;
    } else if (
      wptA.links[wptB.index] === true &&
      wptB.links[wptA.index] === false
    ) {
      // remove a -> b
      delete wptA.links[wptB.index];
      delete wptB.links[wptA.index];
    } else if (
      wptA.links[wptB.index] === false &&
      wptB.links[wptA.index] === true
    ) {
      // switch to bidirectional
      wptA.links[wptB.index] = null;
      wptB.links[wptA.index] = null;
    } else {
      // bidirectional to b -> a
      wptA.links[wptB.index] = false;
      wptB.links[wptA.index] = true;
    }

    this.editor.map.buildPaths();

    return {
      action: "linkWayPointsToggle",
      data,
    };
  }
}

export default class Editor {
  executor;
  actions;
  redoables;
  map;
  selection;

  constructor(map) {
    this.executor = new actionExecutor(this);
    this.actions = [];
    this.redoables = [];
    this.map = map;
    this.selection = [];
  }

  undo() {
    if (!this.actions.length) {
      return;
    }

    let undo = this.actions.pop();

    this.redoables.push({
      label: undo.label,
      actions: undo.actions
        .slice(0)
        .reverse()
        .map(({ action, data }) => this.executor[action](data, true)),
    });
  }

  redo() {
    if (!this.redoables.length) {
      return;
    }
    let redo = this.redoables.pop();

    this.actions.push({
      label: redo.label,
      actions: redo.actions.map(({ action, data }) =>
        this.executor[action](data, false)
      ),
    });
  }

  doneaction(action) {
    this.redoables = [];
    this.actions.push(action);
    if (this.actions.length > maxUndos) {
      this.actions.splice(0, 1);
    }
  }

  wptClick({ event, waypoint }) {
    let item = {
      waypoint: waypoint,
    };

    let action;

    if (
      this.selection.length &&
      event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      let selectionIndex = this.selection.findIndex(
        (selection) => selection.waypoint === waypoint
      );
      if (selectionIndex !== -1) {
        if (this.selection.length === 1) {
          action = {
            label: "Empty selection",
            actions: [this.executor.selectionReplace([])],
          };
        } else {
          action = {
            label: "Remove waypoint # " + waypoint.index + " from selection",
            actions: [this.executor.selectionRemoveAtIndex(selectionIndex)],
          };
        }
      } else {
        action = {
          label: "Add waypoint # " + waypoint.index + " to selection",
          actions: [this.executor.selectionAdd(item)],
        };
      }
    } else if (
      (!this.selection.length || !event.ctrlKey) &&
      !event.shiftKey &&
      !event.altKey
    ) {
      action = {
        label: "Set waypoint # " + waypoint.index + " as selection",
        actions: [this.executor.selectionReplace([item])],
      };
    } else if (
      this.selection.length === 1 &&
      this.selection.slice(0)[0].waypoint &&
      this.selection.slice(0)[0].waypoint.index !== waypoint.index &&
      !event.ctrlKey &&
      event.shiftKey &&
      !event.altKey
    ) {
      let origin = this.selection.slice(0)[0].waypoint;
      action = {
        label: "Toggle Link # " + origin.index + " -> # " + waypoint.index,
        actions: [
          this.executor.linkWayPointsToggle([origin, waypoint]),
          // this.executor.selectionReplace([]),
        ],
      };
    }

    if (action) {
      this.doneaction(action);
      return;
    }
    console.debug(event, waypoint);
  }
}
