whiteboard.Stroke = (function(_){

  var Stroke = {
    includedBy: function(stroke) {
      stroke.whiteboard = {};
      for (var fnName in Stroke.prototype) {
        stroke[fnName] = (function(stroke, fnName){
          return function() {
            return Stroke.prototype[fnName].apply(stroke, arguments);
          }
        })(stroke, fnName);
      }
    },
    /**
     * Initialize a new HTMLElement(stroke) 
     *  append it to the DOM
     *  and set it as the focused stroke
     * 
     * @param {Brush}
     * @return {HTMLElement}
     * @api public
     */
    create: function(brush) {
      var stroke = document.createElement('div');
      stroke.innerHTML = brush.template.innerHTML;
    
      stroke.style.position = 'absolute';
      stroke.className = "stroke";
      stroke.style.top = _.mouseY + "px";
      stroke.style.left = _.mouseX + "px";
      stroke.id = brush.name + "#" + (new Date()).toJSON();

      stroke.brush = brush;

      var strokeContainer = document.createElement("div");
      strokeContainer.addClass("stroke-container");
      strokeContainer.appendChild(stroke);
      _.htmlTag.appendChild(strokeContainer);
      _.Stroke.includedBy(stroke);
      _initializeActionListeners.call(stroke);

      _.emit("Stroke.create.commit", {
          target: stroke,
          stroke: stroke,
          module: "Stroke",
          action: 'create',
          step: 'commit'
      });

      _.StrokeAction.focus.invoke({currentTarget: stroke, target: stroke});      
      return stroke;

    },
    load: function(json) {
      var strokeContainer = document.createElement('div');
      strokeContainer.addClass("stroke-container");
      strokeContainer.innerHTML = json.html;
      document.body.appendChild(strokeContainer);
      var stroke = strokeContainer.children[strokeContainer.children.length - 1];
      
      stroke.brush = _.Brush.get(stroke.id.split('#')[0]);
      _.Stroke.includedBy(stroke);
      _initializeActionListeners.call(stroke);
      return stroke;
    }
  };

  /**
   *  -----------------
   *  Private Functions
   *  -----------------
   */

  /**
   * Bind all of a stroke's whiteboard-actionable events to their elements
   *
   * @param {Element} stroke
   * @returns void
   * @api private
   */
  function _initializeActionListeners() {
    var actionableElement, action, trigger, i,
    actions = this.getElementsByClassName('whiteboard-actionable');

    for (i = actions.length - 1; i >= 0; i--) {
      actionableElement = actions[i];

      //supress all actionable ondragstarts - rage against ondragstart (for now)
      actionableElement.ondragstart = function(){return false;};

      action = actionableElement.attributes.getNamedItem('data-action').value;
      trigger = actionableElement.attributes.getNamedItem('data-trigger').value;
      _.addEvent(actionableElement, trigger, _.StrokeAction.invokeStrokeActionFromEvent);
    }

    //all strokes respond to the focus action
    _.addEvent(this, 'mousedown', _.StrokeAction.focus.invoke);

  };
 
  Stroke.prototype = {

    /**
     * Update this stroke HTMLElement's standard attributes as well as
     * the whiteboard attributes pojo.
     *
     * Supports deep nesting of attributes. That is to say, that calling 
     *
     * stroke.upateWhiteboardAttributes({
     *   style: {
     *     color: 'FFF'
     *   }
     * });
     *
     * Will *only* update the style.color attribute
     *
     * 
     * @param {Object} - the attributes to update
     * ------internal/recursive params-----------
     * @param {Object} - an attribute subnode to traverse and call setters on
     * @param {Object} - a whiteboard subnode to traverse and call setters on
     * ------------------------------------------
     * @return void
     * @api public
     */
    updateWhiteboardAttributes: function(opts, node, wbNode) {
      node = node || this;
      wbNode = wbNode || this.whiteboard;
      for (var opt in opts) {
        if (typeof opts[opt] === 'object') {
          wbNode[opt] = wbNode[opt] || {};
          this.updateWhiteboardAttributes(opts[opt], node[opt], wbNode[opt]);
        } else {
          wbNode[opt] = node[opt] = opts[opt];
        }
      }
    },

         
    /**
     * A cross-browser outer html function
     * @return {String}
     * @api public
     */
    whiteboardHTML: function() {
      return this.outerHTML || (function(node) {
        var div = document.createElement('div'), h;
        div.appendChild(node.cloneNode(true));
        h = div.innerHTML;
        div = null;
        return h;
      })(this);
    },

    /**
     * Returns the container element holding this stroke
     *
     * @return {HTMLElement}
     * @api public
     */
    container: function() {
      return this.parentElement;
    },

    /**
     * Remove the stroke from the DOM
     *
     * @return {Stroke}
     * @api public
     */
    removeFromDOM: function() {
      _.htmlTag.removeChild(this.container());
    },

    /**
     * Serialize the stroke for persistence
     * Avoiding premature optimization by just storing the HTML for now.
     * TODO: find a better way to serialize a stroke
     *
     * @return {Object}
     * @api public
     */
    toJSON: function() {
      return {
        id: this.id,
        brush: this.brush.name,
        html: this.whiteboardHTML()
      }
    }
  };
  return Stroke;
})(whiteboard);
