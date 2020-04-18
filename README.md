# adeditor ALFA

An online editor for [FS19_AutoDrive](https://github.com/Stephan-S/FS19_AutoDrive) mod for Farming Simulator 2019

## ALFA Version

The project is currently in early - prototyping - stage.

Online publishing is meant for _testing only_.

**PLEASE MAKE SURE TO BACKUP ANY FILE BEFORE OVERWRITING IT WITH CONTENT GENERATED BY adeditor**

## Main Features

* "Path" concept: the system identifies all the links sequences between "crossings" (nodes) allowing more "natural" operations on them, i.e.:

  - [x] alignment,
  - [ ] TODO: link type toggling for the entire path.

* "standard" config.xml files (from gamesave folder) and routesManager route .xml files (from the autoDrive\routesManager\routes folder) for both

  - [x] reading
  - [ ] TODO: and saving _(currently the file content is only logged to the javascript dev console of the browser)_

* Map size:

  - [x] is autodetected from the route when possible;
  - [x] can be changed at any time to any value;

* Map image

  - [x] is always scaled correctly to map size
        _(no issues with 2048x2048 PDA map images in 4x or 8x maps)_;
  - accepted formats
    - [ ] TODO: DDS _(directly from map .zip file)_;
    - [x] PNG _(converted from DDS with tools like [Paint.net](https://www.getpaint.net/))_;

* Manage items on map with mouse clicks + key modifiers (no need to "switch tool"):

  - [x] Select (click),
  - [x] move waypoint (click & drag),
  - [x] create waypoint (ctrl + click)
  - [x] link waypoints
  (click to select origin, shift + click on target, + alt for toggling reverse driving).

* Waypoint and Path selection:

  - [x] new selection (click);
  - [x] add/remove to selection (ctrl + click);
  - [x] delete waypoints in selection (del);
  - [ ] TODO: expand Path selection to its waypoints;
  - [ ] TODO: select all paths & their waypoints inside a region (left click & drag, + ctrl to add to selection);
  - [ ] TODO: changhe order of items in selection;
  - [ ] TODO: hide / show only selection;
  - [ ] TODO: select all unconnected waypoints _(for quick delete)_;

* Alignment of waypoints in current selection:
  - [x] between first and last waypoint in selection
  - [ ] TODO: between last used first and last;

- [x] Unlimited Undo/Redo levels (if not by browser memory restrictions)

- [ ] TODO: online/contextual help, documentation
      *(currently this document is the only source of information)*

## Known Issues / Limitations

### Slow/sluggish pan of the map
Currently, the entire map is always rendered as a single pannable/zoomable SVG.
When the number of rendered links is above a few hundreds the browser starts to struggle.

A possible solution might be to only render the currently visible portion and/or dynamically reduce the LOD basing on zoom factor; alternatively also switch to canvas rendering.

### Slow update after waypoints or links creation/deletion
This is probably due to the current relationship between Vue.js observables and map entities.

A possible solution could be to make Vue.js observables "more static", and selectively update them basing on the exact type of operation performed on map entities.

### Upload / Download of single files
Being a web page the editor has no direct access to the user filesystem for quick read / save operations and folder navigation. Everything must be uploaded or downloaded.

This also limits the level of integration with AD Route Manager (cannot directly create a new entry in the routes.xml "index") and with the game itself (i.e. direct access to the map zip file to extract the PDA map image)

A possible solution might be to pack the code into a Desktop Application (i.e. with NW.js) that runs locally in the user PC and thus has access to the local filesystem.

## Why?

The mod development team already supply a desktop [Course Editor](https://github.com/Stephan-S/FS19_AutoDrive/raw/master/AutoDrive%20Course%20Editor/AD.jar).

At the time of writing this, the official editor only manages basic operations on the "base entities" of courses (waypoints and links between them). Also, the interface is a little bit awkward for my perspective.

Being an eager AutoDrive user and a fan of "heavy automation" gameplay in Farming Simulator, I often found myself in need of a "more sophisticated" toolset.

I should have given my contribution to the official editor, but I know nothing about the programming language used for its development (Java) and its "environment", so it would have taken a very long time just to grasp the basics of the code; if I were ever able to get into it.

I instead have a "little-more-than-hobbyist" level of competence with web development technologies, and thus have been able to rather quickly put together a working prototype with the basic functionalities I was missing.

Maybe the official dev team will eventually deem some of the patterns/features of adeditor useful enough to be worth implementing them in the official editor, having my javascript source code available for "translation" in Java.
