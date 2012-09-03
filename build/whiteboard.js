/**
 * Cross browser removeClass method
 *
 * @param {String}
 * @return void
 * @api public
 */
HTMLElement.prototype.removeClass = HTMLElement.prototype.removeClass || function(className) {
  if (this.classList && this.classList.remove)
    return this.classList.remove(className);
  else
    return this.className = this.className.split(" "+className).join('');
};

/**
 * Cross browser addClass method
 *
 * @param {String}
 * @return void
 * @api public
 */
HTMLElement.prototype.addClass = HTMLElement.prototype.addClass || function(className){
  if(this.classList && this.classList.add) 
    return this.classList.add(className);
  else
    return this.className += " " + className;
};

/**
 * Cross browser hasClass check
 *
 * @param {String}
 * @return {boolean}
 * @api public
 */
HTMLElement.prototype.hasClass = HTMLElement.prototype.hasClass || function(className) {
  if (this.classList && this.classList.contains) {
    return this.classList.contains(className);
  } else {
    var classes = this.className.split(' ');
    for (var i = classes.length - 1; i >= 0; i--) {
      if (classes[i] === className) return true;
    };
    return false;
  }
};

/**
 * Cross browser method to apply a CSS3 transformation to an element
 *
 * @param {String}
 * @return void
 * @api public
 */
HTMLElement.prototype.applyCSSTransformation = HTMLElement.prototype.applyCSSTransformation || function(transformation) {
  if (this.style.webkitTransform != undefined)
    this.style.webkitTransform = transformation;

  else if (this.style.MozTransform != undefined)
    this.style.MozTransform = transformation;

  else if (this.style.OTransform != undefined)
    this.style.OTransform = transformation;

  else if (this.style.msTransform != undefined)
    this.style.msTransform = transformation;
};

/**
 * Checks to see if the element is contained in another of a certain class
 *
 * Because of the tree traversal, this is best used on nodes close to the root.
 *  (which is how we use it below)
 *
 * @param {string} className
 * @return {boolean}
 */
HTMLElement.prototype.isContainedInElementOfClass = HTMLElement.prototype.isContainedInElementOfClass || 
  function(className) {
    var probe = this;
    while (!probe.hasClass(className) && this !== document.getElementsByTagName('html')[0] && probe.parentElement) {
      probe = probe.parentElement;
    }
    if (probe.hasClass(className)) return true;
    else return false;
  };

window.whiteboard = (function(){
  /* ------------------------------- */
  /* Private variables and functions */
  /* ------------------------------- */

  var _callbacks = {}, _,
      _previousX, _previousY;

  /**
   * Find all callbacks that match a specific event pattern
   *
   * Supports wildcard "*" characters when searching modules for events
   *
   * @param {String} query
   * @return {Array}
   * @api private
   */
  function _findMatchingEventCallbacks(query) {
    var results = [],
        match,
        exp;

    for (var event in _callbacks) {
      exp = event.replace(".","\\.").replace("*",".+");
      match = query.match(exp);
      if (match && match.shift() === query)
        results = results.concat(_callbacks[event]);
    }
    return results;
  };

  /**
   * Cross browser method to to update tracked mouse coords.
   * (current coords, previous coords, and deltas)
   *
   * @param {Event} e
   * @return {whiteboard}
   * @api private
   */

  function _updateMousePosition(e) {
    if (e.currentTarget === document) {
      _previousY = _.mouseY, _previousX = _.mouseX;

      _.mouseX = (window.Event) ? 
                       e.pageX : 
                       event.clientX + 
                          (document.documentElement.scrollLeft ? 
                              document.documentElement.scrollLeft : 
                              _.container.scrollLeft);

      _.mouseY = (window.Event) ? 
                       e.pageY : 
                       event.clientY + 
                          (document.documentElement.scrollTop ? 
                              document.documentElement.scrollTop : 
                              _.container.scrollTop);

      _.deltaX = _.mouseX - _previousX;
      _.deltaY = _.mouseY - _previousY;
    }
    return whiteboard;
  };


   /*
   *  Expose the global whiteboard POJO.
   *   as well as set "_" for local access
   */
  return _ = {
    /**
     * Expose package variables
     */

    /**
     * Expose cross browser event methods
     *  Just needed by the package, but here they are, public anyway
     */

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @return {whiteboard}
     * @api public
     */
    addEvent: function(object, type, callback) {
      if (object.addEventListener) {
        object.addEventListener(type, callback, false);
      } else {
        object.attachEvent('on' + type, callback);
      }
      return whiteboard;
    },

    /**
     * cross browser remove event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @return {whiteboard}
     * @api public
     */
    removeEvent: function(object, type, callback) {
      if (object.removeEventListener) {
        object.removeEventListener(type, callback, false);
      } else {
        object.detachEvent('on' + type, callback);
      }
      return whiteboard;
    },

    /**
     * cross browser fire event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @returns {whiteboard}
     * @api public
     */
    fireEvent: function(object, type, name, memo) {
      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(type, true, true);
        object.dispatchEvent(event);
      } else {
        event = document.createEventObject();
        event.eventType = type;
        object.fireEvent("on" + event.eventType, event);
      }
      return whiteboard;
    },

    /**
     * Expose emitter methods
     *
     * Events are named after their module and function 
     * ------Examples------
     * 1.) listen for every time an element is focued
     *    whiteboard.on("StrokeAction.focus.commit", myFunction);
     *
     * 2.) listen to any 'commit' strokeAction
     *    whiteboard.StrokeAction.on("*.commit");
     *    whiteboard.on("StrokeAction.*.commit"); //equivalent to the line above
     *
     * 3.) listen to all commit actions
     *    whiteboard.on("*.commit");
     */

    /**
     * Add a new event listener to whiteboard
     * 
     * @param {String} event
     * @param {Function} callback
     * @return {whiteboard} this
     * @api public
     */
    on: function(event, fn){
      _callbacks[event] = _callbacks[event] || [];
      _callbacks[event].push(fn);
      return this;
    },

    /**
     * Remove an event listener from whiteboard
     * 
     * @param {String} event
     * @param {Function} callback
     * @return {whiteboard} this
     * @api public
     */
    off: function(event, fn){
      var eventCallbacks = _callbacks[event];
      if (!eventCallbacks) return;

      if (arguments.length == 1) {
        delete _callbacks[event];
        return;
      }

      var i = eventCallbacks.indexOf(fn);
      eventCallbacks.splice(i, 1);
      return this;
    },

    /**
     * Trigger all event listeners for an event
     *
     * @param {String} event
     * @return {whiteboard} this
     * @api public
     */
    emit: function(event){
      var args = [].slice.call(arguments, 1)
      , eventCallbacks = _findMatchingEventCallbacks(event);

      if (eventCallbacks) {
        for (var i = 0, len = eventCallbacks.length; i < len; ++i) {
          eventCallbacks[i].apply(this, args);
        }
      }
      return this;
    },

    /**
     * Initialize all of the submodules for a module
     *  Uses the 'init' method pattern if available
     *
     * @param {Object} module
     * @return void
     * @api package
     */
    initSubmodules: function(module) {
      module = module || this;
      for (var submodule in module) {
        if (module.hasOwnProperty(submodule)
            && submodule.charAt(0) >= 'A' && submodule.charAt(0) <= 'Z'
            && typeof this[submodule].init === 'function') 
        {
          module[submodule].init();
        }
      }
    },

    /**
     * Initialize all modules
     *
     * @return {whiteboard}
     */
    init: function(opts) {
      opts = opts || {};
      _.initSubmodules();

      _.addEvent(document, 'mousemove', _updateMousePosition);

			this.container = opts.container || document.body;

      return this;
    }
  };

})();

/**
 * Expose the Brush module
 */
whiteboard.Brush = (function(_){

  var _brushes = {},
  /**
   * A Brush knows its template and name, and it can paint new strokes 
   *    (copies of the template) onto the DOM
   *
   * It's basically a stroke factory
   *
   * @attribute {Element} element - a stroke template
   * @attribute {string} name 
   */
  Brush = function(template, name){
    this.template = template;
    this.name = name;
  };

  /**
   * ------------------------------
   * Module Variables/Methods
   * ------------------------------
   */

  Brush.active = null;

  /**
   * Find all brushes and their tool-buttons in the DOM
   *   Register brushes with module
   *   Set tool-button click handlers
   *   
   * @return void
   * @api public
   */
  Brush.init = function() {
    var brushes = document.getElementsByClassName('brush'),
        brushButtons = document.getElementsByClassName('tool');

    for (var i = 0; i < brushes.length; i++)
      Brush.add(brushes[i]);

    for (var i = 0; i < brushButtons.length; i++)
      _.addEvent(brushButtons[i], 'click', _setActiveBrush);

    _.addEvent(document, 'mousedown', function(e){
      if (_shouldPaintStroke(e))
        _paintStroke(e);
    });

  };

  /**
   * register a new brush type
   * should be a DOM element with which the contents will be used to paint
   * see HTML data-attribute API reference
   *
   * @param {Element} element
   * @returns {whiteboard}
  */
  Brush.add = function(element) {
    var name = element.attributes.getNamedItem('data-brush-name').value;
    _brushes[name] = new Brush(element, name);
    return this;
  };

  /**
   * Get a known singleton brush object by name
   *
   * @param {string} name
   * @returns {Brush}
   */
  Brush.get = function(name) {
    return _brushes[name];
  };

  /**
   * ----------------
   * Instance Methods
   * ----------------
   */

  /**
   * Paint a new copy of a brush's template onto the DOM
   * Initialize all DOM listeners for strokeActions on the stroke.
   *
   * @returns {Stroke} newly painted stroke 
   */
  Brush.prototype.paintStroke = function(stroke) {
    if (stroke) {
      stroke = _.Stroke.create({json: stroke});
    } else {
      stroke = _.Stroke.create({brush: this});
    }
    _.emit("Brush."+this.name+".paint.commit", {
        module: "Brush",
        action: "paint",
        step: "commit",
        stroke: stroke,
        brush: this
    });

    return stroke; 
  };

  /**
   * ---------------
   * Private Methods
   * ---------------
   */

  
  /**
   * Get the brush corresponding to a tool's click event target
   * 
   * @param {Event} e
   * @returns {Brush}
   */
  function _brushFromEvent(e) {
    var name = e.currentTarget.attributes.getNamedItem('data-brush-name').value;
    return _brushes[name];
  };
  
  /**
   *  Set the active brush using a tool's click event
   *
   *  @param {Event} e
   *  @return {Brush}
   *  @api private
   */
  function _setActiveBrush(e) {
    if (e.preventDefault) e.preventDefault();  
    Brush.active = _brushFromEvent(e);
    return Brush;
  };

    /**
   * Determine if the event deserves a brush stroke
   *
   * @param {Event} e
   * @return {boolean}
   * @api private
   */
  function _shouldPaintStroke(e) {
    return Brush.active && !e.defaultPrevented &&
        !e.target.isContainedInElementOfClass('stroke') && 
        !e.target.isContainedInElementOfClass('toolbox');
  };

  /**
   *  Paint a stroke with the active brush. 
   *  Handles key-binds for composition
   *
   *  preconditions:: Brush.active != null
   *      Use _shouldPaintStroke to be sure
   *
   *  @param {Event} e
   *  @returns {Brush}
   *  @api private
   */
  function _paintStroke(e) {
    Brush.active.paintStroke();
    if (!e.shiftKey) 
      Brush.active = null;

    return Brush;
  };


    return Brush;
  })(whiteboard);

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
   * Instance Methods
   */
  Canvas.prototype = {
    /**
     * Set an attribute on the canvas (such as name)
     * 
     * @param {String}
     * @param {any}
     * @return {Canvas}
     */
    set: function(attribute, value) {
      this[attribute] = value;
      _.emit('Canvas.update.commit', {module: 'Canvas', action: 'update', step: 'commit', target: {canvas: this}});
      return this;
    },
    createOrUpdateStroke: function(stroke) {
     var strokeExists = this.strokes.hasOwnProperty(stroke.id);
     this.strokes[stroke.strokeId] = stroke;

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
        delete this.strokes[event.stroke.strokeId];
        _.emit('Canvas.strokes.destroy.commit', _buildStrokesEvent.call(this, event.stroke, 'destroy'));
      } else {
        this.createOrUpdateStroke(event.stroke);
      }
    },
    /**
     * Serialize the canvas, removing all ciruclar references and Objects
     *   Specifically, the strokes hash references HTMLElements is converted into 
     *   an array of IDs
     *
     * @return {Object}
     * @api public
     */
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
		this.all = this.all || [];
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
    Canvas.all.push(canvas);
    _refreshCanvasList(canvas);
  };

  function _refreshCanvasList() {
    var list = document.getElementsByClassName("canvas-list"),
        ul,
        item;
    for (var i = list.length - 1; i >= 0; i--) {
      ul = list[i].children[0];
      ul.innerHTML = "";
      for (var j = Canvas.all.length - 1; j >= 0; j--) {
        item = document.createElement("li");
        item.innerHTML = "<a href='#' class='canvas-link' data-canvas='"+j+"'>"+
                            Canvas.all[j].target.name+"</a";
        ul.appendChild(item);
        _.addEvent(item, 'click', _loadCanvas); 
      }
    }
  };

  function _loadCanvas(event) {
    var index = event.target.getAttribute('data-canvas'),
        canvas = Canvas.all[index],
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

/**
 * All stores will be referenced in the whiteboard.Store namespace.
 *
 * Stores must adhere to the following interface
 *
 * @interface Store 
 *   @attribute {String} name - the display name of the store.
 *        ("Local" for local storage or perhaps "Cloud" for a webserver)
 *
 *   @function load
 *        Instantiates a canvas of the provided ID from the Store.
 *        Right now, this takes care of instantiating Canvas and its Strokes 
 *          and setting up all necessary relationships,
 *          but perhaps Stroke instantiation (and DOM appending) should be delegated by the Canvas 
 *       
 *        @param {Object} - the canvas JSON (or POJO with a unique id key)
 *        @return {Canvas}
 *        @api public
 *
 *   @function init
 *      Ensures the browser supports this form of storage
 *      Asks the store for all of the known canvases for the user
 *      Emits a "Store.Canvas.found" event for each Canvas JSON discovered
 *      
 *      @return void
 *      @api public
 *
 * @end
 *
 * They should also listen to "Canvas.*.commit" events and handle persisting changes accordingly.
 *
 * Everything else below here is just some kind of helper method that needed a home
 */
whiteboard.Store = (function(_){

  return {
    /**
     * Called on whiteboard.init()
     * Takes care of initializing all Stores
     */
    init: function() {
      _.initSubmodules.apply(this);
    },

    /**
     * Some helpers stolen from underscore
     */
    clone: function(obj){
      if (typeof obj !== 'object') {
        return obj;
      } else if (this.isArray(obj)) {
        return obj.slice();
      } else {
        var clone = {};
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop))
            clone[prop] = obj[prop];
        }
        return clone;
     }

    },
    isArray: function(obj) {
      return toString.call(obj) == '[object Array]';
    }
  }
})(whiteboard);


whiteboard.Stroke = (function(_){
  var _idSplitter = '...',
      _idCounter = 0,
      Stroke;

  function _nextId() {
    return "stroke"+_idCounter++;
  };

  Stroke = {
    includedBy: function(stroke) {
      stroke.serializable = {};
      for (var fnName in Stroke.prototype) {
        stroke[fnName] = (function(stroke, fnName){
          return function() {
            return Stroke.prototype[fnName].apply(stroke, arguments);
          }
        })(stroke, fnName);
      }
    },

    /**
     * A painter-helper
     * Just asks the serialized stroke's brush to paint with JSON
     *
     * @param {Object} - the JSON format of a stroke
     * @return{Stroke} 
     * @api public
     */
    paint: function(strokeJSON) {
      return _.Brush.get(strokeJSON.brush).paintStroke(strokeJSON);
    },

    /**
     * Initialize a new HTMLElement(stroke) 
     *  append it to the DOM
     *
     * @param {Object} opts
     *    if opts.brush is provided, a new stroke is created with that brush
     *    if opts.json is provided, a new stroke is loaded from that json
     *
     * @return {HTMLElement}
     * @api public
     */
    create: function(opts) {
      var stroke;
      if (opts.brush) {
        stroke = document.createElement('div');
        stroke.innerHTML = opts.brush.template.innerHTML;
      
        stroke.style.position = 'absolute';
        stroke.addClass("stroke");
        stroke.style.top = _.mouseY + "px";
        stroke.style.left = _.mouseX + "px";
        stroke.strokeId = opts.brush.name + _idSplitter + (new Date()).toJSON();

        stroke.brush = opts.brush;
      } else {
        var strokeContainer = document.createElement('div');
            strokeContainer.innerHTML = opts.json.html;
        stroke = strokeContainer.children[0];
        stroke.strokeId = opts.json.id;
        stroke.brush = _.Brush.get(opts.json.brush);
      }
      stroke.id = _nextId();

      _paint(stroke);

      if (opts.brush){
        _.StrokeAction.focus.invoke({currentTarget: stroke, target: stroke});      
        _.emit("Stroke.create.commit", {
            target: stroke,
            stroke: stroke,
            module: "Stroke",
            action: 'create',
            step: 'commit'
        });
      }
      return stroke;
    },
    /**
     * Framework consumers will define their custom attributes as POJOs that know how to 
     * @function toJSON -> serialize the stroke.serializable[attribute] POJO into JSON
     * @function load -> unserialize the provided JSON and attach it to stroke.serializable[attribute]
     *
     */
    attributes: {}
  };


  /**
   *  -----------------
   *  Private Functions
   *  -----------------
   */


  /**
   * Prepare and paint an HTMLElement stroke
   * Fires all onpaint functions accordingly
   *
   * @param {HTMLElement} stroke
   * @return void
   * @api private
   */
  function _paint(stroke) {
    _.container.appendChild(stroke);
    _.Stroke.includedBy(stroke);
    _initializeActionListeners.call(stroke);
  };

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
      _.container.removeChild(this);
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
      var json = {
        id: this.strokeId,
        brush: this.brush.name,
        html: this.whiteboardHTML()
      };

      for (var attribute in  this.serializable)
        json[attribute] = Stroke.attributes[attribute].toJSON.call(this.serializable[attribute]);

      return json;
    }
  };
  return Stroke;
})(whiteboard);

whiteboard.StrokeAction = (function(_){
  var module = "StrokeAction";

  return {
    /**
     * Expose module scoped emitter
     */
    on: function(event, fn) {
      return _.on(module + "." + event, fn);
    },
    off: function(event, fn) {
      return _.off(module + "." + event, fn);
    },
    emit: function(eventName, event) {
      eventName = module + "." + eventName;
      event.module = module;
      return _.emit(eventName, event);
    },
    
    /**
     * A functional extension for StrokeActions
     *   This takes care of hooking a StrokeAction's logic into the event emitter
     *
     * @param {String} action - name of the new StrokeAction
     * @param {Object} steps - pojo of action steps
     * @return {StrokeAction}
     */

    extend: function(action, steps){
      
      var strokeAction = {
        /**
         * Expose action scoped emitter
         */
        on: function(step, fn) {
          return _.on(module + "." + action + "." + step, fn);
        },
        off: function(step, fn) {
          return _.off(module + "." + action + "." + step, fn);
        },
        emit: function(step, event) {
          step = action + "." + step;
          event.action = action;
          return _.StrokeAction.emit(step, event);
        }
      };
      if (!steps.invoke)
        throw "You extended StrokeAction and didn't implement invoke... remember to set the action's target therein"
      
      steps.commit = steps.commit || function(){};
      for(var step in steps) {
        /**
         * This is where the actions steps are wrapped with event emission.
         * Perhaps this is a good place for other kinds of hooks to tie in
         *  (before/after)
         */
        strokeAction[step] = (function(step, fn){
          return  function(DOMevent){
            fn.apply(strokeAction, arguments);
            strokeAction.emit(step, {
              step: step,
              data: DOMevent,
              target: strokeAction.target,
              stroke: strokeAction.stroke || _.StrokeAction.strokeForElement(strokeAction.target) 
            });
          };
        })(step,steps[step]);
      }
      if (steps.init) steps.init.call(strokeAction);

      return strokeAction;
    },


    /* -----------------------------*/
    /* StrokeAction Helpers         */
    /* -----------------------------*/


    /**
     * Have the document catch all clicks with a callback
     *
     * @param {Function} callback
     * @returns void
     */
    enableDocumentClickCatching: function(callback) {
      _.addEvent(document, 'click', callback);
    },

    /**
     * Stop the document from catching clicks with a calback
     *
     * @param {Function} callback
     * @returns void
     */
    disableDocumentClickCatching: function(callback) {
      _.removeEvent(document, 'click', callback);
    },

    /**
     * Get the stroke that is currently focused by the user
     *
     * @returns {Element}
     */
    focusedStroke: function() {
      return document.getElementsByClassName('whiteboard-focused')[0];
    },

    /**
     * Get the 'stroke-content' div for the currently focused stroke
     *
     * @returns {Element}
     */
    focusedStrokeContent: function() {
      return this.focusedStroke().getElementsByClassName('stroke-content')[0];
    },

    /**
     * Cross browser event binds to an element and its children
     *
     * @param {Element} node
     * @param {string} event
     * @param {Function} callback
     * @returns void 
     */
    addEventToNodeAndChildren: function(node, event, callback) {
      if (node.childElementCount == 0)
        return node[event] = callback;
      else {
        _.addEvent(node, event, callback);

        for (var i = node.children.length - 1; i >= 0; i--)
          _addEventToNodeAndChildren(node.children[i], event, callback);
      }
    },
    
    /**
     * takes the event and returns the keycode
     *  (thanks mousetrap.js)
     *
     * @param {Event} e
     * @return {number}
     */
    keyCodeFromEvent: function(e) {

        // add which for key events
        // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
        var char_code = typeof e.which == "number" ? e.which : e.keyCode;

        // right command on webkit, command on gecko
        if (char_code == 93 || char_code == 224) {
            return 91;
        }

        // map keypad numbers to top-of-keyboard numbers
        if (char_code >= 96 && char_code <= 105){
            return char_code - 48;
        }

        return char_code;
    },

    /**
     * Fire a stroke action's function for a specific event
     *
     * @param {HTMLEvent} event
     * @returns void
     * @api module 
     */
     invokeStrokeActionFromEvent: function(event) {
      var action = event.currentTarget.attributes.getNamedItem('data-action').value;
      _.StrokeAction[action].invoke(event);
    },
    
  
    /**
     * Get the parent stroke container for a given actionable element
     *   If the element provided is not contained in a stroke, 
     *   provide the focused stroke.
     * 
     * @param {Element} element
     * @returns {Element} stroke
     * @api module
     */
    strokeForElement: function(element) {
      if (!element) 
        return _.StrokeAction.focusedStroke();

      var probe = element;
      while (!probe.hasClass('stroke') && probe !== _.container)
        probe = probe.parentElement;

      if (probe.hasClass('stroke'))
        return probe;
      else 
        return whiteboard.StrokeAction.focusedStroke();
    }


  };

})(whiteboard);

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

 /**
  * Delete a stroke from localStorage
  *
  * @param {Canvas} - the canvas for this stroke
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
      json.strokes[strokeIdArray[i]] = _.Stroke.paint(strokeJSON);
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

/**
 * Decrease the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.decreaseFontSize = whiteboard.StrokeAction
  .extend('decreaseFontSize', {
      invoke: function(event) {
        this.target  = whiteboard.StrokeAction.strokeForElement(event.target);
				this.commit();
      },
			commit: function() {
        var content = this.target.getElementsByClassName('stroke-content')[0];
				    pixels = Number(content.style.fontSize.split('px')[0]);

				content.style.fontSize = (pixels - 2) + 'px';
			}       
  });

/**
 * Deletes the stroke if the backspace key was pressed
 */
whiteboard.StrokeAction.destroy = (function(_,$){

  return $.extend('destroy',{
    invoke: function(event) {
      if (event.preventDefault) event.preventDefault();
      this.target = $.strokeForElement(event.target);
      this.commit();
      return false;
    },
    commit: function(event) {
      this.target.removeFromDOM();
    }
  });

})(whiteboard, whiteboard.StrokeAction);


/**
 * Make a specific element editable and listen for the user to be done editing
 */
whiteboard.StrokeAction.editText = (function(_ ,$){
  return $.extend('editText', {
    invoke: function(event) {
        this.target = event.target;
        this.target.contentEditable = "true";

        $.enableDocumentClickCatching($.editText.process);
    },
    process: function(event) {
      if (!event.target.isContainedInElementOfClass('editable'))
        $.editText.commit();
    },

    commit: function() {
      this.target.contentEditable = "false";

      $.disableDocumentClickCatching($.editText.process);
    }
  });
})(whiteboard, whiteboard.StrokeAction);

/**
 * Apply focused CSS style to a stroke and listen for a loss of user focus
 */
whiteboard.StrokeAction.focus = (function(_,$){

  /**
   * Unstyle the currently focused element and
   * apply focused style to provided element, if available
   *
   * @param {Element} element
   * @return void
   * @api private
   */
  function _setTarget(element){
    //remove existing target's focus style
    if (this.target)
      this.target.removeClass('whiteboard-focused');

    this.target = element;

    if (element)
      element.addClass('whiteboard-focused');
  };


  return $.extend('focus',{
    invoke: function(event) {
     _setTarget.call(this, event.currentTarget);
     this.commit();
    },

    commit: function() {
    }
  });

})(whiteboard, whiteboard.StrokeAction);

/**
 * Increase the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.increaseFontSize = whiteboard.StrokeAction
  .extend('increaseFontSize', {
    invoke: function(event, content) {
      this.target = whiteboard.StrokeAction.strokeForElement(event.target);
      this.commit();
    },
    commit: function() {
      var content = this.target.getElementsByClassName('stroke-content')[0],
          pixels = Number(content.style.fontSize.split('px')[0]);

      if (!pixels) {
        pixels = Number(content.attributes.getNamedItem('data-default-fontsize').value)
      }
      content.style.fontSize = (pixels + 2) + 'px';
 
    }
  });

/**
 * Move an element while its drag handler is held by the mouse
 */
whiteboard.StrokeAction.move = (function(_,$){
  return $.extend('move', {
    invoke: function(event, content, stroke) {
			this.target = $.strokeForElement(event.target);

      _.addEvent(_.container, 'mousemove', this.process);
      _.addEvent(_.container, 'mouseup', this.commit);
    },

    process: function(event) {
      this.target.style.top = _.mouseY - this.target.clientHeight + 10 + "px";
      this.target.style.left = _.mouseX + "px";
    },

    commit: function(event) {
      _.removeEvent(_.container, 'mouseup', this.commit);
      _.removeEvent(_.container, 'mousemove', this.process);
    }
  });
})(whiteboard, whiteboard.StrokeAction);

/**
 * Apply CSS3 rotate transformations to the stroke while handler is held down
 */
whiteboard.StrokeAction.rotate = (function(_,$){
  
    /**
     * Given a number, provide its rotation grid locked value
     * 
     * @param {number}
     * @returns {number}
     */
    function _rotationGridLock(number) {
      //there has to be a more clever way to do this with modulo 45
      if (_numberIsWithinGridlock(number - 180))
        return 180;

      if (_numberIsWithinGridlock(number + 180))
        return -180;

      if (_numberIsWithinGridlock(number - 90))
        return 90;

      if (_numberIsWithinGridlock(number + 90))
        return -90;

      if (_numberIsWithinGridlock(number))
        return 0;

      return number;
    };

    /** 
     * Determine if a number should be reset to its grid value
     *
     * @param {number}
     * @returns {boolean}
     */
    function _numberIsWithinGridlock(number) {
      return Math.abs(number) < 5 && Math.abs(number) > -5;
    };


    return $.extend('rotate', {

      invoke: function(event, content) {
        this.target = $.strokeForElement(event.target);

        _.addEvent(_.container, 'mousemove', this.process);
        _.addEvent(_.container, 'mouseup', this.commit);
      },

      process: function(event) {
        var strokeContent = this.target.getElementsByClassName('stroke-content')[0],
            rotation = strokeContent.attributes.getNamedItem('data-rotation');

        if (!rotation) {
          rotation = document.createAttribute('data-rotation');
          rotation.nodeValue = 0;
        }

        var degrees = _rotationGridLock(Number(rotation.value) - _.deltaX) % 360;

        rotation.nodeValue = degrees;
        strokeContent.attributes.setNamedItem(rotation);

        strokeContent.applyCSSTransformation("rotate(" + degrees + "deg)");
      },

      commit: function(event) {
        _.removeEvent(_.container, 'mousemove', this.process);
        _.removeEvent(_.container, 'mouseup', this.commit);
      }
    });
})(whiteboard, whiteboard.StrokeAction);

/**
 * Remove focused CSS styles from a stroke
 */
whiteboard.StrokeAction.unfocus = (function(_,$){
  
  return $.extend('unfocus', {

    init: function() {
      $.on("focus.commit", this.invoke);
    },

    invoke: function() {
      $.enableDocumentClickCatching(this.process);
    },

    process: function(event) {
      if (event.target.isContainedInElementOfClass &&
         !event.target.isContainedInElementOfClass('whiteboard-focused'))
        this.commit();
    },

    commit: function() {
      this.target = $.focus.target;
      this.target.removeClass('whiteboard-focused');
      $.disableDocumentClickCatching(this.process);
    }
  });
})(whiteboard, whiteboard.StrokeAction);
