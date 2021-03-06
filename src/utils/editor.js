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

  selectionInsert(data, reverse) {
    let { index, item } = data;
    if (!reverse) {
      this.editor.selection.splice(index, 0, item);
    } else {
      this.editor.selection.splice(index, 1);
    }
    return {
      action: "selectionInsert",
      data,
    };
  }

  selectionMove(data) {
    let { index, toIndex } = data;
    if (index >= this.editor.selection.length) {
      index = this.editor.selection.length - 1;
    }

    this.editor.selection.splice(
      toIndex,
      0,
      this.editor.selection.splice(index, 1)[0]
    );

    return {
      action: "selectionMove",
      data: {
        index: toIndex,
        toIndex: index,
      },
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

  selectionRemoveItems({ start, count, removed }, reverse) {
    if (!reverse) {
      let removed = this.editor.selection.splice(start, count);
      return {
        action: "selectionRemoveItems",
        data: {
          start,
          removed,
        },
      };
    }
    this.editor.selection.splice(start, 0, ...removed);
    return {
      action: "selectionRemoveItems",
      data: {
        start,
        count: removed.length,
      },
    };
  }

  reverseSelection() {
    this.editor.selection.reverse();

    return {
      action: "reverseSelection",
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

  alignWpts({ wpts, start, end, movedWpts, highlightEventType }, reverse) {
    if (highlightEventType) {
      if (highlightEventType === "mouseenter") {
        this.editor.preview = {
          line: [start, end],
        };
      }
      if (highlightEventType === "mouseleave") {
        this.editor.preview = null;
      }
      return;
    }
    if (wpts && !reverse) {
      let movedWpts = [];

      wpts.forEach((wpt) => {
        if (wpt === start || wpt === end) {
          return;
        }
        let newPos = closestPointToLine(wpt, start, end);
        if (!newPos) {
          return;
        }
        newPos.x = +newPos.x.toFixed(3);
        newPos.z = +newPos.z.toFixed(3);
        if (newPos.x === wpt.x && newPos.z === wpt.z) {
          return;
        }

        movedWpts.push({
          wpt,
          original: {
            x: wpt.x,
            z: wpt.z,
          },
        });

        wpt.x = newPos.x;
        wpt.z = newPos.z;
      });

      if (movedWpts.length) {
        this.editor.lastAlignment = {
          start,
          end,
        };
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

  toggleBranchLinkType({ branch, option, original, highlightEventType }) {
    if (highlightEventType) {
      return;
    }
    if (!original) {
      let checkedOption = false;
      if (!option) {
        return;
      }
      if (
        (option === "oneWay" && branch.bidirectional) ||
        ((option === "twoWay" || option === "switchDirection") &&
          !branch.bidirectional &&
          !branch.reverse) ||
        (option === "toggleReverse" && !branch.bidirectional)
      ) {
        checkedOption = true;
      }

      if (!checkedOption) {
        return;
      }

      let original = branch.wpts.map((wpt) => {
        return {
          wpt,
          ins: wpt.ins.slice(0),
          outs: wpt.outs.slice(0),
        };
      });

      let prevWpt;

      branch.wpts.forEach((wpt) => {
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
        action: "toggleBranchLinkType",
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
      action: "toggleBranchLinkType",
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
  preview;

  constructor(map) {
    this.executor = new actionExecutor(this);
    this.actions = [];
    this.redoables = [];
    this.map = map;
    this.selection = [];
    this.toolsAvailable = [];
    this.preview = null;
  }

  undo() {
    if (!this.actions.length) {
      return;
    }

    let undo = this.actions.pop();

    this.redoables.push({
      rebuildBranches: undo.rebuildBranches,
      label: undo.label,
      actions: undo.actions
        .slice(0)
        .reverse()
        .map(({ action, data }) => this.executor[action](data, true))
        .reverse(),
    });

    if (undo.rebuildBranches) {
      this.mapRebuildBranches();
    }
    this.updateAvilableTools();
  }

  redo() {
    if (!this.redoables.length) {
      return;
    }
    let redo = this.redoables.pop();

    this.actions.push({
      rebuildBranches: redo.rebuildBranches,
      label: redo.label,
      actions: redo.actions.map(({ action, data }) =>
        this.executor[action](data, false)
      ),
    });

    if (redo.rebuildBranches) {
      this.mapRebuildBranches();
    }
    this.updateAvilableTools();
  }

  mapRebuildBranches() {
    this.selection = this.selection.filter(({ branch }) => !branch);
    this.map.buildBranches();
  }

  doneaction(action) {
    if (!action) {
      return false;
    }
    this.actions.push(action);
    this.redoables = [];

    if (action.rebuildBranches) {
      this.mapRebuildBranches();
    }

    this.updateAvilableTools();

    return true;
  }

  updateAvilableTools() {
    this.toolsAvailable = [];
    let { wpts, branches } = this.selectionWaypointsAndBranches();

    let alignOptions = [];

    if (wpts.length > 2) {
      alignOptions.push({
        label: "Selection 1st and last",
        data: {
          start: wpts[0],
          end: wpts.slice(-1)[0],
          wpts: wpts.slice(1, -1),
        },
        description:
          "Align " +
          wpts.length +
          " wpts in selection along a line from # " +
          wpts[0].index +
          " to #" +
          wpts.slice(-1)[0].index,
      });
    }

    if (
      wpts.length &&
      this.lastAlignment &&
      this.lastAlignment.start !== wpts[0] &&
      this.lastAlignment.end !== wpts[0] &&
      this.lastAlignment.start !== wpts.slice(-1)[0] &&
      this.lastAlignment.end !== wpts.slice(-1)[0]
    ) {
      let alignable = wpts.filter(
        (w) =>
          w.index !== this.lastAlignment.start.index &&
          w.index !== this.lastAlignment.end.index
      );

      if (alignable.length) {
        alignOptions.push({
          label: "Prev. 1st and last",
          data: {
            start: this.lastAlignment.start,
            end: this.lastAlignment.end,
            wpts,
          },
          description:
            "Align " +
            wpts.length +
            " wpts in selection along a line from # " +
            this.lastAlignment.start.index +
            " to #" +
            this.lastAlignment.end.index,
        });
      }
    }

    if (alignOptions.length) {
      let description;
      let data;
      let options;

      if (alignOptions.length === 1) {
        description = alignOptions[0].description;
        data = alignOptions[0].data;
      } else {
        options = alignOptions;
      }

      this.toolsAvailable.push({
        icon: "settings_ethernet",
        label: "Align waypoints",
        description,
        action: "alignWpts",
        data,
        options,
      });
    }

    if (branches.length === 1 && this.selection.length === 1) {
      let branch = branches[0];

      let options = [];

      if (branch.bidirectional) {
        options.push({
          label: "One way",
          value: "oneWay",
          icon: "arrow_right_alt",
        });
      }

      if (!branch.bidirectional) {
        if (!branch.reverse) {
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
          label: (branch.reverse ? "Forward" : "Reverse") + " driving",
          value: "toggleReverse",
          icon: "swap_horizontal_circle",
        });
      }

      let icon = "timeline";
      let description =
        "Change all links in branch # " + branches[0].index + " to ";
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
        label: "Change branch type",
        description,
        action: "toggleBranchLinkType",
        options,
        data: {
          branch,
          option,
        },
        rebuildBranches: true,
      });
    }
  }

  selectionItemCmd({ item, index, cmd }) {
    let action;

    if (cmd.value === "expand") {
      let actions = [this.executor.selectionRemoveAtIndex(index)];

      item.branch.wpts
        .slice(0)
        .reverse()
        .forEach((wpt) => {
          actions.push(
            this.executor.selectionInsert({
              index,
              item: { waypoint: wpt },
            })
          );
        });

      action = {
        label: "Expand selection branch #" + item.branch.index,
        actions,
      };
    }

    if (cmd.value === "remove") {
      action = {
        label: "Remove item from selection",
        actions: [this.executor.selectionRemoveAtIndex(index)],
      };
    }

    if (cmd.value === "removeBefore" || cmd.value === "removeAfter") {
      let start = cmd.value === "removeBefore" ? 0 : index + 1;
      let count =
        cmd.value === "removeBefore"
          ? index
          : this.selection.length - (index + 1);

      action = {
        label: "Remove items from selection",
        actions: [this.executor.selectionRemoveItems({ start, count })],
      };
    }

    let toIndex;

    if (cmd.value == "top") {
      toIndex = 0;
    }
    if (cmd.value == "up") {
      toIndex = index - 1;
    }
    if (cmd.value == "down") {
      toIndex = index + 1;
    }
    if (cmd.value == "bottom") {
      toIndex = this.selection.length;
    }

    if (toIndex !== undefined) {
      action = {
        label: cmd.label + " selection item ",
        actions: [this.executor.selectionMove({ index, toIndex })],
      };
    }

    this.doneaction(action);
  }

  toolAction(
    { action, data, label, rebuildBranches },
    option,
    highlightEventType
  ) {
    if (option) {
      if (option.data !== undefined) {
        data = option.data;
      }
      if (option.value !== undefined) {
        data.option = option.value;
      }
    }
    data.highlightEventType = highlightEventType;

    let doneAction = this.executor[action](data);
    if (doneAction) {
      this.doneaction({
        label,
        actions: [doneAction],
        rebuildBranches,
      });
    }
  }

  selectionWaypointsAndBranches() {
    let wpts = [];
    let branches = [];
    this.selection.forEach((item) => {
      if (
        item &&
        item.waypoint &&
        !wpts.find((w) => w.index === item.waypoint.index)
      ) {
        wpts.push(item.waypoint);
      }
      if (item && item.branch) {
        if (!branches.find((p) => p.index === item.branch.index)) {
          branches.push(item.branch);
          item.branch.wpts.forEach((wpt) => {
            if (!wpts.find((w) => w.index === wpt.index)) {
              wpts.push(wpt);
            }
          });
        }
      }
    });
    return { wpts, branches };
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

  keyUp(event) {
    let action;

    if (this.deleteKeyAction(event)) {
      let items = this.selection.slice(0);
      let actions = [this.executor.selectionReplace([])];

      items.forEach(({ waypoint, branch }) => {
        if (waypoint) {
          let done = this.executor.removeWaypoint(waypoint);
          if (done) {
            actions.push(done);
          }
        }

        if (branch) {
          branch.wpts.slice(1, -1).forEach((wpt) => {
            let done = this.executor.removeWaypoint(wpt);
            if (done) {
              actions.push(done);
            }
          });
        }
      });

      action = {
        label: "Remove selected items",
        actions,
        rebuildBranches: true,
      };
    }

    if (
      event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.repeat
    ) {
      if (event.code === "KeyZ") {
        this.undo();
        return true;
      }
      if (event.code === "KeyY") {
        this.redo();
        return true;
      }
      if (event.code === "KeyS") {
        this.map.save();
        return true;
      }
    }

    return this.doneaction(action);
  }

  wptDragged({ waypoint, dragstart }) {
    this.doneaction({
      label: "Move Waypont # " + waypoint.index,
      actions: [this.executor.movedWaypoint({ waypoint, dragstart })],
    });
  }

  reverseSelection() {
    this.doneaction({
      label: "Reverse selection",
      actions: [this.executor.reverseSelection()],
    });
  }

  emptySelection() {
    this.doneaction({
      label: "Empty selection",
      actions: [this.executor.selectionReplace([])],
    });
  }

  mapClick({ event, svgpoint }) {
    if (
      this.selection.length &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      this.emptySelection();
      return;
    }
    let action;

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
    } else if (item.branch) {
      type = "branch";
      index = item.branch.index;
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
    } else if (item.branch) {
      type = "branch";
      index = item.branch.index;
    }

    let action;

    let selectionIndex = this.selection.findIndex(
      (selection) =>
        (item.waypoint && selection.waypoint === item.waypoint) ||
        (item.branch && selection.branch === item.branch)
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

  branchClick({ event, branch }) {
    let item = { branch };

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
        rebuildBranches: true,
      };
    }

    this.doneaction(action);
  }
}
