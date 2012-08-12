whiteboard.Store.Local = (function(_){
  function _supportsLocalStorage() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  function _handleCanvasEvent(event) {
    if(event.action === 'create')
      _saveCanvas(event.target.canvas)
    else if (event.module === 'Canvas.strokes') {
      localStorage[event.target.canvas.id] = JSON.stringify(event.target.canvas.toJSON());
      if (event.action === 'destroy')
        _destroyStroke(event.target.canvas, event.target.stroke.toJSON());
      else
        _saveStroke(event.target.canvas, event.target.stroke.toJSON());

    }
  };
  
  function _saveCanvas(canvas){
    var json = canvas.toJSON(),
    canvases = JSON.parse(localStorage['canvases']);
    if (canvases.indexOf(canvas.id) < 0) {
      canvases.push(canvas.id);
      localStorage["canvases"] = JSON.stringify(canvases);
    }
    localStorage[canvas.id] = JSON.stringify(json);
    for (var strokeId in canvas.strokes)
      _saveStroke(canvas, canvas.strokes[strokeId].toJSON());
  }

  /**
   * Save a stroke's JSON data into the proper key
   *
   * @param {Canvas} - the Canvas for this stroke
   * @param {Object} - the stroke's toJSON format
   * @return void
   * @api private
   */
  function _saveStroke(canvas, stroke) {
    localStorage[canvas.id+'#'+stroke.id] = JSON.stringify(stroke);
  }

  * Delete a stroke from localStorage
  *
  * @param {Object} - the stroke's toJSON format POJO
  * @return void
  * @api private
  */
  function _destroyStroke(canvas, stroke) {
    delete localStorage[canvas.id+'#'+stroke.id];
  }

  function _emitCanvasFound() {
    var canvases = JSON.parse(localStorage.canvases),
        canvas;
    for (var i = canvases.length - 1; i >= 0; i--) {
      canvas = JSON.parse(localStorage[canvases[i]]);
      _.emit("Store.Canvas.found", {
          target: canvas,
          source: _.Store.Local
      });
    }
  };

  /**
   * Pulls a canvas out of localStorage
   * Instantiates the Canvas object and its strokes
   *
   * @param {Object} the POJO of canvas attributes
   * @return {Canvas}
   * @api private
   */
  function _loadCanvas(json) {
    var strokeJSON,
        strokeIdArray = json.strokes;
    json.strokes = {};
    for (var i = strokeIdArray.length - 1; i >= 0; i--) {
      strokeJSON = JSON.parse(localStorage[json.id+'#'+strokeIdArray[i]]);
      json.strokes[strokeIdArray[i]] = _.Stroke.create({json: strokeJSON});
    }
    return new _.Canvas(json);
  };

  var Local = {
    name: "LocalStorage",
    load: function(canvas) {
      _.off("Canvas.*.commit", _handleCanvasEvent);
      var canvas = _loadCanvas(JSON.parse(localStorage[canvas.id]));
      _.on("Canvas.*.commit", _handleCanvasEvent);
      return canvas;
    },
    init: function() {
      if (_supportsLocalStorage()) {
        if(!localStorage.canvases) localStorage.canvases = JSON.stringify([]);
        else _emitCanvasFound();
        _.on("Canvas.*.commit", _handleCanvasEvent);
      }
    }
  };
  return Local;
})(whiteboard);
