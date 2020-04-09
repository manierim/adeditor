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

  selectionReplace(data, reverse) {
    if (!reverse) {
      let undo = {
        action: "selectionReplace",
        data: this.editor.selection.slice(),
      };
      this.editor.selection = data;
      return undo;
    }
    let redo = {
      action: "selectionReplace",
      data: this.editor.selection.slice(),
    };
    this.editor.selection = data;
    return redo;
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
      actions: undo.actions.map(({ action, data }) =>
        this.executor[action](data, true)
      ),
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
      !event.altKey &&
      !this.selection.find((selection) => selection.waypoint === waypoint)
    ) {
      action = {
        label: "Add waypoint # " + waypoint.index + " to selection",
        actions: [this.executor.selectionAdd(item)],
      };
    }

    if (
      (!this.selection.length || !event.ctrlKey) &&
      !event.shiftKey &&
      !event.altKey
    ) {
      action = {
        label: "Set waypoint # " + waypoint.index + " as selection",
        actions: [this.executor.selectionReplace([item])],
      };
    }

    if (action) {
      this.doneaction(action);
      return;
    }
    console.debug(event, waypoint);
  }
}
