import { closestPointToLine } from "./math";

class actionExecutor {
  editor;

  constructor(editor) {
    this.editor = editor;
  }

  addWaypoint(data, reverse) {
    if (!reverse) {
      let newPwt = this.editor.map.addWaypoint({
        x: +data.x.toFixed(3),
        y: +data.y.toFixed(3),
        z: +data.z.toFixed(3),
      });
      return {
        action: "addWaypoint",
        data: newPwt,
      };
    }
    this.editor.map.removeWaypoint(data.index);
    return {
      action: "addWaypoint",
      data: {
        x: data.x,
        y: data.y,
        z: data.z,
      },
    };
  }
  removeWaypoint(data, reverse) {
    if (!reverse) {
      if (!this.editor.map.removeWaypoint(data.index)) {
        return;
      }

      return {
        action: "removeWaypoint",
        data,
      };
    }

    this.editor.map.addWaypoint({ waypoint: data });

    return {
      action: "removeWaypoint",
      data,
    };
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

  movedWaypoint({ waypoint, dragstart, dragend }, reverse) {
    if (!reverse) {
      if (dragend) {
        waypoint.x = dragend.x;
        waypoint.z = dragend.z;
      }

      return {
        action: "movedWaypoint",
        data: { waypoint, dragstart },
      };
    }

    dragend = {
      x: waypoint.x,
      z: waypoint.z,
    };

    waypoint.x = dragstart.x;
    waypoint.z = dragstart.z;

    return {
      action: "movedWaypoint",
      data: { waypoint, dragstart, dragend },
    };
  }

  alignWpts({ wpts, movedWpts }, reverse) {
    if (wpts && !reverse) {
      let start = wpts[0];
      let end = wpts.slice(-1)[0];

      let movedWpts = [];

      wpts.slice(1, -1).forEach((wpt) => {
        let newPos = closestPointToLine(wpt, start, end);
        if (newPos) {
          newPos.x = +newPos.x.toFixed(3);
          newPos.z = +newPos.z.toFixed(3);
          if (newPos.x !== wpt.x || newPos.z !== wpt.z) {
            movedWpts.push({
              wpt,
              original: {
                x: wpt.x,
                z: wpt.z,
              },
            });

            wpt.x = newPos.x;
            wpt.z = newPos.z;
          }
        }
      });

      if (movedWpts.length) {
        return {
          action: "alignWpts",
          data: { movedWpts },
        };
      }
      return;
    }

    let originalwpts = [];

    movedWpts.forEach(({ wpt, original }) => {
      originalwpts.push({
        wpt,
        original: {
          x: wpt.x,
          z: wpt.z,
        },
      });

      wpt.x = original.x;
      wpt.z = original.z;
    });

    return {
      action: "alignWpts",
      data: { movedWpts: originalwpts },
    };
  }

  linkWayPointsToggle(data) {
    let wptA = data[0];
    let wptB = data[1];
    let reverse = data[2];

    let wptALinkType = wptA.linkType(wptB.index);
    let wptBLinkType = wptB.linkType(wptA.index);

    if (wptALinkType === null && wptBLinkType === null) {
      // add a -> b
      wptA.outs.push(wptB.index);
      if (!reverse) {
        wptB.ins.push(wptA.index);
      }
    } else if (
      (wptALinkType === "out" && wptBLinkType === "in") ||
      (wptALinkType === "reverse-out" && wptBLinkType === "reverse-in")
    ) {
      // remove a -> b
      let idxOut = wptA.outs.indexOf(wptB.index);
      if (idxOut !== -1) {
        wptA.outs.splice(idxOut, 1);
      }
      let idxIn = wptB.ins.indexOf(wptA.index);
      if (idxIn !== -1) {
        wptB.ins.splice(idxIn, 1);
      }
    } else if (
      (wptALinkType === "in" && wptBLinkType === "out") ||
      (wptALinkType === "reverse-in" && wptBLinkType === "reverse-out")
    ) {
      // switch to bidirectional
      wptA.outs.push(wptB.index);
      wptB.ins.push(wptA.index);
    } else {
      // bidirectional to b -> a
      let idxOut = wptA.outs.indexOf(wptB.index);
      if (idxOut !== -1) {
        wptA.outs.splice(idxOut, 1);
      }
      let idxIn = wptB.ins.indexOf(wptA.index);
      if (idxIn !== -1) {
        wptB.ins.splice(idxIn, 1);
      }
    }

    return {
      action: "linkWayPointsToggle",
      data,
    };
  }

  togglePathLinkType({ path, option, original }) {
    if (!original) {
      let checkedOption = false;
      if (!option) {
        return;
      }
      if (
        (option === "oneWay" && path.bidirectional) ||
        ((option === "twoWay" || option === "switchDirection") &&
          !path.bidirectional &&
          !path.reverse) ||
        (option === "toggleReverse" && !path.bidirectional)
      ) {
        checkedOption = true;
      }

      if (!checkedOption) {
        return;
      }

      let original = path.wpts.map((wpt) => {
        return {
          wpt,
          ins: wpt.ins.slice(0),
          outs: wpt.outs.slice(0),
        };
      });

      let prevWpt;

      path.wpts.forEach((wpt) => {
        if (prevWpt) {
          if (option === "oneWay") {
            prevWpt.ins.splice(prevWpt.ins.indexOf(wpt.index), 1);
            wpt.outs.splice(wpt.outs.indexOf(prevWpt.index), 1);
          }
          if (option === "twoWay" || option === "switchDirection") {
            prevWpt.ins.push(wpt.index);
            wpt.outs.push(prevWpt.index);
          }
          if (option === "switchDirection") {
            prevWpt.outs.splice(prevWpt.outs.indexOf(wpt.index), 1);
            wpt.ins.splice(wpt.ins.indexOf(prevWpt.index), 1);
          }

          if (option === "toggleReverse") {
            let insIndex = wpt.ins.indexOf(prevWpt.index);
            if (insIndex === -1) {
              wpt.ins.push(prevWpt.index);
            } else {
              wpt.ins.splice(insIndex, 1);
            }
          }
        }

        prevWpt = wpt;
      });

      return {
        action: "togglePathLinkType",
        data: {
          original,
        },
      };
    }

    let prevOriginal = original.map(({ wpt }) => {
      return {
        wpt,
        ins: wpt.ins.slice(0),
        outs: wpt.outs.slice(0),
      };
    });

    original.forEach((wdata) => {
      wdata.wpt.ins = wdata.ins;
      wdata.wpt.outs = wdata.outs;
    });

    return {
      action: "togglePathLinkType",
      data: {
        original: prevOriginal,
      },
    };
  }
}

export default class Editor {
  executor;
  actions;
  redoables;
  map;
  selection;
  toolsAvailable;

  constructor(map) {
    this.executor = new actionExecutor(this);
    this.actions = [];
    this.redoables = [];
    this.map = map;
    this.selection = [];
    this.toolsAvailable = [];
  }

  undo() {
    if (!this.actions.length) {
      return;
    }

    let undo = this.actions.pop();

    this.redoables.push({
      rebuildPaths: undo.rebuildPaths,
      label: undo.label,
      actions: undo.actions
        .slice(0)
        .reverse()
        .map(({ action, data }) => this.executor[action](data, true)),
    });

    if (undo.rebuildPaths) {
      this.mapRebuildPaths();
    }
    this.updateAvilableTools();
  }

  redo() {
    if (!this.redoables.length) {
      return;
    }
    let redo = this.redoables.pop();

    this.actions.push({
      rebuildPaths: redo.rebuildPaths,
      label: redo.label,
      actions: redo.actions.map(({ action, data }) =>
        this.executor[action](data, false)
      ),
    });

    if (redo.rebuildPaths) {
      this.mapRebuildPaths();
    }
    this.updateAvilableTools();
  }

  mapRebuildPaths() {
    this.selection = this.selection.filter(({ path }) => !path);
    this.map.buildPaths();
  }

  doneaction(action) {
    if (!action) {
      return false;
    }
    this.actions.push(action);
    this.redoables = [];

    if (action.rebuildPaths) {
      this.mapRebuildPaths();
    }

    this.updateAvilableTools();

    return true;
  }

  updateAvilableTools() {
    this.toolsAvailable = [];
    let { wpts, paths } = this.selectionWaypointsAndPaths();

    if (wpts.length > 2) {
      this.toolsAvailable.push({
        icon: "settings_ethernet",
        label: "Align waypoints",
        description:
          "Align " +
          wpts.length +
          " wpts in selection along a line from # " +
          wpts[0].index +
          " to #" +
          wpts.slice(-1)[0].index,
        action: "alignWpts",
        data: { wpts },
      });
    }

    if (paths.length === 1 && this.selection.length === 1) {
      let path = paths[0];

      let options = [];

      if (path.bidirectional) {
        options.push({
          label: "One way",
          value: "oneWay",
          icon: "arrow_right_alt",
        });
      }

      if (!path.bidirectional) {
        if (!path.reverse) {
          options.push({
            label: "Bidirectional",
            value: "twoWay",
            icon: "compare_arrows",
          });

          options.push({
            label: "Opposite direction",
            value: "switchDirection",
            icon: "cached",
          });
        }

        options.push({
          label: (path.reverse ? "Forward" : "Reverse") + " driving",
          value: "toggleReverse",
          icon: "swap_horizontal_circle",
        });
      }

      let icon = "timeline";
      let description = "Change all links in path # " + paths[0].index + " to ";
      let option;

      if (options.length === 1) {
        icon = options[0].icon;
        description += options[0].label;
        option = options[0].value;
        options = null;
      } else {
        description += " selected type";
      }

      this.toolsAvailable.push({
        icon,
        label: "Change path type",
        description,
        action: "togglePathLinkType",
        options,
        data: {
          path,
          option,
        },
        rebuildPaths: true,
      });
    }
  }

  toolAction({ action, data, label, rebuildPaths }, option) {
    if (option && option.value !== undefined) {
      data.option = option.value;
    }
    let doneAction = this.executor[action](data);
    if (doneAction) {
      this.doneaction({
        label,
        actions: [doneAction],
        rebuildPaths,
      });
    }
  }

  deleteKeyAction(event) {
    return (
      event.code === "Delete" &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.repeat
    );
  }

  selectionWaypointsAndPaths() {
    let wpts = [];
    let paths = [];
    this.selection.forEach((item) => {
      if (
        item &&
        item.waypoint &&
        !wpts.find((w) => w.index === item.waypoint.index)
      ) {
        wpts.push(item.waypoint);
      }
      if (item && item.path) {
        if (!paths.find((p) => p.index === item.path.index)) {
          paths.push(item.path);
          item.path.wpts.forEach((wpt) => {
            if (!wpts.find((w) => w.index === wpt.index)) {
              wpts.push(wpt);
            }
          });
        }
      }
    });
    return { wpts, paths };
  }

  keyUp(event) {
    let action;

    if (this.deleteKeyAction(event)) {
      let { wpts } = this.selectionWaypointsAndPaths();
      if (!wpts.length) {
        return;
      }

      let actions = [this.executor.selectionReplace([])];

      wpts.forEach((wpt) => {
        let done = this.executor.removeWaypoint(wpt);
        if (done) {
          actions.push(done);
        }
      });

      action = {
        label: "Remove selected items",
        actions,
        rebuildPaths: true,
      };
    }

    return this.doneaction(action);
  }

  wptDragged({ waypoint, dragstart }) {
    this.doneaction({
      label: "Move Waypont # " + waypoint.index,
      actions: [this.executor.movedWaypoint({ waypoint, dragstart })],
    });
  }
  mapClick({ event, svgpoint }) {
    let action;

    if (
      this.selection.length &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      action = {
        label: "Empty selection",
        actions: [this.executor.selectionReplace([])],
      };
    }

    if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
      let y = this.map
        .waypointsArray()
        .sort(
          (a, b) =>
            Math.sqrt(
              Math.pow(a.x - svgpoint.x, 2) + Math.pow(a.z - svgpoint.y, 2)
            ) -
            Math.sqrt(
              Math.pow(b.x - svgpoint.x, 2) + Math.pow(b.z - svgpoint.y, 2)
            )
        )
        .slice(0, 2);

      if (y.length) {
        y = y.reduce((sum, w) => sum + w.y, 0) / y.length;
      } else {
        y = 0;
      }

      action = {
        label: "Add new Waypoint",

        actions: [
          this.executor.addWaypoint({
            x: +svgpoint.x.toFixed(3),
            y: +y.toFixed(3),
            z: +svgpoint.y.toFixed(3),
          }),
        ],
      };
    }

    this.doneaction(action);
  }

  mouseReplaceSelectionAction(event, item) {
    if (
      !(
        (!this.selection.length || !event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      )
    ) {
      return;
    }
    let type;
    let index;

    if (item.waypoint) {
      type = "waypoint";
      index = item.waypoint.index;
    } else if (item.path) {
      type = "path";
      index = item.path.index;
    }

    return {
      label: "Set " + type + " # " + index + " as selection",
      actions: [this.executor.selectionReplace([item])],
    };
  }

  mouseAddToSelectionAction(event, item) {
    if (
      !(
        this.selection.length &&
        event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      )
    ) {
      return;
    }

    let type;
    let index;

    if (item.waypoint) {
      type = "waypoint";
      index = item.waypoint.index;
    } else if (item.path) {
      type = "path";
      index = item.path.index;
    }

    let action;

    let selectionIndex = this.selection.findIndex(
      (selection) =>
        (item.waypoint && selection.waypoint === item.waypoint) ||
        (item.path && selection.path === item.path)
    );
    if (selectionIndex !== -1) {
      if (this.selection.length === 1) {
        action = {
          label: "Empty selection",
          actions: [this.executor.selectionReplace([])],
        };
      } else {
        action = {
          label: "Remove " + type + " # " + index + " from selection",
          actions: [this.executor.selectionRemoveAtIndex(selectionIndex)],
        };
      }
    } else {
      action = {
        label: "Add " + type + " # " + index + " to selection",
        actions: [this.executor.selectionAdd(item)],
      };
    }
    return action;
  }

  selectionMouseActions(event, item) {
    let action = this.mouseAddToSelectionAction(event, item);
    if (!action) {
      action = this.mouseReplaceSelectionAction(event, item);
    }
    return action;
  }

  pathClick({ event, path }) {
    let item = { path };

    let action = this.selectionMouseActions(event, item);

    this.doneaction(action);
  }

  wptClick({ event, waypoint }) {
    let item = { waypoint };

    let action = this.selectionMouseActions(event, item);

    if (
      !action &&
      this.selection.length === 1 &&
      this.selection.slice(0)[0].waypoint &&
      this.selection.slice(0)[0].waypoint.index !== waypoint.index &&
      !event.ctrlKey &&
      event.shiftKey
    ) {
      let origin = this.selection.slice(0)[0].waypoint;
      action = {
        label: "Toggle Link # " + origin.index + " -> # " + waypoint.index,
        actions: [
          this.executor.linkWayPointsToggle([origin, waypoint, event.altKey]),
        ],
        rebuildPaths: true,
      };
    }

    this.doneaction(action);
  }
}
