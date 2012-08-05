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
    createOrUpdateStroke: function(stroke) {
     var strokeExists = this.strokes.hasOwnProperty(stroke.id);
     this.strokes[stroke.id] = stroke;

     if (strokeExists) {
       _.emit('Canvas.strokes.update', _buildStrokesEvent.call(this,stroke, 'update'));
     } else {
       _.emit("Canvas.strokes.create", _buildStrokesEvent.call(this, stroke, 'create'));
     }
    },
    handleStrokeChange: function(event) {
      if (event.action === 'focus' || event.action === 'unfocus')
        return;

      if (event.action === 'destroy') {
        delete this.strokes[event.target.id];
        _.emit('Canvas.strokes.destroy', _buildStrokesEvent.call(this, event.target, 'destroy'));
      } else {
        this.createOrUpdateStroke(event.target);
      }
  
    }

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
    _.on("^(StrokeAction|Stroke).(?!(un)?focus)*commit", function(event){
      Canvas.active.handleStrokeChange(event)
    });
  };

  /**
   * -----------------
   * Private Functions
   * -----------------
   */

  function _buildStrokesEvent(stroke, action) {
    return {
      action: action,
      target: {
        canvas: this,
        stroke: stroke
      }
    }
  };


  return Canvas;

})(whiteboard);
