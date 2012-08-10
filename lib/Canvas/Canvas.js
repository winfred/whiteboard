/**
 * Expose Canvas Module
 *
 * The Canvas is essentially a unique collection of strokes.
 * This module also normalizes StrokeAction events so that DB-adapter listeners 
 *   only need to tune into Canvas events.
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
    _.emit("Canvas.create.commit", {module: 'Canvas', action: 'create', step: 'commit', target: { canvas: this}});
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
       _.emit('Canvas.strokes.update.commit', _buildStrokesEvent.call(this,stroke, 'update'));
     } else {
       _.emit("Canvas.strokes.create.commit", _buildStrokesEvent.call(this, stroke, 'create'));
     }
    },
    handleStrokeChange: function(event) {
      if (event.action === 'focus' || event.action === 'unfocus')
        return;

      if (event.action === 'destroy') {
        delete this.strokes[event.stroke.id];
        _.emit('Canvas.strokes.destroy.commit', _buildStrokesEvent.call(this, event.stroke, 'destroy'));
      } else {
        this.createOrUpdateStroke(event.stroke);
      }
    },
    toJSON: function() {
      var clone = _.Store.clone(this);
      clone.strokes = [];
      for (var strokeId in this.strokes)
        clone.strokes.push(strokeId);
      return clone;
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
		this.list = this.list || [];
    this.active = this.active || new Canvas();
    _.on("^(StrokeAction|Stroke).(?!(un)?focus)*commit", function(event){
      Canvas.active.handleStrokeChange(event)
    });
    _.on("Store.Canvas.found",_registerCanvas); 
      
  };

  /**
   * -----------------
   * Private Functions
   * -----------------
   */

  function _buildStrokesEvent(stroke, action) {
    return {
      action: action,
      module: 'Canvas.strokes',
      target: {
        canvas: this,
        stroke: stroke
      }
    }
  };
  
  function _registerCanvas(canvas) {
    Canvas.list.push(canvas);
    _refreshCanvasList(canvas);
  };

  function _refreshCanvasList() {
    var list = document.getElementsByClassName("canvas-list"),
        ul,
        item;
    for (var i = list.length - 1; i >= 0; i--) {
      ul = list[i].children[0];
      ul.innerHTML = "";
      for (var j = Canvas.list.length - 1; j >= 0; j--) {
        item = document.createElement("li");
        item.innerHTML = "<a href='#' class='canvas-link' data-canvas='"+j+"'>"+
                            Canvas.list[j].target.name+"</a";
        ul.appendChild(item);
        _.addEvent(item, 'click', _loadCanvas); 
      }
    }
  };

  function _loadCanvas(event) {
    var index = event.target.getAttribute('data-canvas'),
        canvas = Canvas.list[index],
        paintedStrokes = document.getElementsByClassName("stroke");
    for (var i = paintedStrokes.length - 1; i >= 0; i--)
      paintedStrokes[i].removeFromDOM();
 
    Canvas.active = canvas.source.load(canvas.target);
    
    var focusedStrokes = document.getElementsByClassName("whiteboard-focused");
    for (var i = focusedStrokes.length - 1; i >= 0; i--)
      focusedStrokes[i].removeClass("whiteboard-focused");
    return false;
  };

  return Canvas;

})(whiteboard);
