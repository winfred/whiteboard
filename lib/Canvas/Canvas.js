/**
 * Expose Canvas Module
 */
whiteboard.Canvas = (function(_){

  /**
   * ----------------
   * Class Definition
   * ----------------
   */

  /**
   * A Canvas knows its ID (for serialization)
   * its name (for user recognition)
   * its strokes
   *
   */
  var Canvas = function(opts) {
    var now = (new Date()).toJSON();
    opts = opts || {};
    this.strokes = opts.strokes || {};
    this.id = opts.id || now;
    this.name = opts.name || now + "-Untitled";
    this.createdAt = opts.createdAt || now;

  };

  /**
   * ----------------
   * Instance Methods
   * ----------------
   */
  Canvas.prototype = {

  };



  /**
   *  ---------------------------
   *  Module Attributes/Functions
   *  ---------------------------
   */

  /**
   * The canvas that is currently being shown/edited
   */
  Canvas.active = null;

  /**
   * Module initialization
   * Sets active canvas from settings
   *
   * Listens for changes to persist in canvas
   *
   * TODO: set up programmable canvas defaults (a la whiteboard.defaults = {})
   *
   */
  Canvas.init = function() {
    this.active = this.active || new Canvas();
    _.on("(StrokeAction|Brush).*.commit", _createOrUpdateStroke);
  };

  /**
   * -----------------
   * Private Functions
   * -----------------
   */

  /**
   * Event handler for all *.commit events
   *
   * @param {WhiteboardEvent}
   * @return void
   * @api private
   */
  function _createOrUpdateStroke(event) {
    Canvas.active.strokes[event.target.id] = event.target;
  };


  return Canvas;

})(whiteboard);
