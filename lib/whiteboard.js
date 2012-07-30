window.whiteboard = (function(){
  /* ------------------------------- */
  /* Private variables and functions */
  /* ------------------------------- */

  var _brushes = {}, _callbacks = {},
      _activeBrush, _previousX, _previousY;

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
   * cross browser add event method
   *
   * @param {Element|HTMLDocument} object
   * @param {string} type
   * @param {Function} callback
   * @returns void
   */
  function _addEvent(object, type, callback) {
    if (object.addEventListener) {
      return object.addEventListener(type, callback, false);
    }

    object.attachEvent('on' + type, callback);
  };

  /**
   * cross browser remove event method
   *
   * @param {Element|HTMLDocument} object
   * @param {string} type
   * @param {Function} callback
   * @returns void
   */
  function _removeEvent(object, type, callback) {
    if (object.removeEventListener) {
      return object.removeEventListener(type, callback, false);
    }

    return object.detachEvent('on' + type, callback);
  };

  /**
   * cross browser fire event method
   *
   * @param {Element|HTMLDocument} object
   * @param {string} type
   * @returns void
   */
  function _fireEvent (object, type, name, memo) {
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
  }

  /**
   * Cross browser method to to update tracked mouse coords.
   * (current coords, previous coords, and deltas)
   *
   * @param {Event} e
   */

  function _updateMousePosition(e) {
    if (e.currentTarget === document) {
      _previousY = _.mouseY, _previousX = _.mouseX;

      _.mouseX = (window.Event) ? 
                       e.pageX : 
                       event.clientX + 
                          (document.documentElement.scrollLeft ? 
                              document.documentElement.scrollLeft : 
                              _.htmlTag.scrollLeft);

      _.mouseY = (window.Event) ? 
                       e.pageY : 
                       event.clientY + 
                          (document.documentElement.scrollTop ? 
                              document.documentElement.scrollTop : 
                              _.htmlTag.scrollTop);

      _.deltaX = _.mouseX - _previousX;
      _.deltaY = _.mouseY - _previousY;
    }
  };

  /**
   * Determine if the event deserves a brush stroke
   *
   * @param {Event} e
   * @return {boolean}
   */
  function _shouldPaintStroke(e) {
    return _activeBrush && !e.defaultPrevented &&
        !e.target.isContainedInElementOfClass('stroke') && 
        !e.target.isContainedInElementOfClass('toolbox');
  };

  /**
   *  Paint a stroke with the active brush. 
   *  Handles key-binds for composition
   *  Triggers package onPaint events (eventually)
   *
   *  preconditions:: _activeBrush != null
   *      Use _shouldPaintStroke to be sure
   *
   *  @param {Event} e
   * @returns void
   */
  function _paintStroke(e) {
      _activeBrush.paintStroke();
      if (!e.shiftKey) 
        _activeBrush = null;
  };

  /**
   *  Set the active brush using a tool's click event
   *
   *  @param {Event} e
   * @returns void
   */
  function _setActiveBrush(e) {
    if (e.preventDefault) e.preventDefault();  
    _activeBrush = _brushFromEvent(e);
  };

  /**
   * Get the brush corresponding to a tool's click event target
   * 
   * @param {Event} e
   * @returns {Brush}
   */
  function _brushFromEvent(e) {
    var name = e.currentTarget.attributes.getNamedItem('data-brush-name').value;
    return _brushes[name];
  }

   /*
   *  Expose the global whiteboard POJO.
   */
  return {
    /**
     * Expose package variables
     */
    activeBrush: _activeBrush,
    htmlTag:  document.getElementsByTagName('html')[0],


    /**
     * Expose cross browser event methods
     *  Just needed by the package, but here they are, public anyway
     */
    addEvent: _addEvent,
    removeEvent: _removeEvent,
    fireEvent: _fireEvent,


    /**
     * Expose emitter methods
     *
     * Events are named after their module and function (much like Backbone.js)
     * ------Examples------
     * 1.) listen for every time an element is focued
     *    whiteboard.on("StrokeAction.focused.complete", myFunction);
     *
     * 2.) listen to any 'complete' strokeAction
     *    whiteboard.StrokeAction.on("*.complete");
     *    whiteboard.on("StrokeAction.*.complete"); //equivalent to the line above
     *
     * 3.) listen to all complete actions (just Brush and StrokeActions at the moment)
     *    whiteboard.on("*.complete");
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
     * register a new brush type
     * should be a DOM element with which the contents will be used to paint
     * see HTML data-attribute API reference
     *
     * @param {Element} element
     * @returns {whiteboard}
    */
    addBrush: function(element) {
      var name = element.attributes.getNamedItem('data-brush-name').value;
      _brushes[name] = new this.Brush(element, name);
      return this;
    },

    /**
     * Get a known singleton brush object by name
     *
     * @param {string} name
     * @returns {Brush}
     */
    getBrush: function(name) {
      return _brushes[name];
    },

    /**
     * find all the brushes in the document and register them
     *
     * @return {whiteboard}
     */
    init: function() {
      var brushes = document.getElementsByClassName('brush'),
          brushButtons = document.getElementsByClassName('tool');

      for (var i = 0; i < brushes.length; i++)
        this.addBrush(brushes[i]);

      for (var i = 0; i < brushButtons.length; i++)
        _addEvent(brushButtons[i], 'click', _setActiveBrush);

      _addEvent(document, 'mousemove', _updateMousePosition);
      _addEvent(document, 'mousedown', function(e){
        if (_shouldPaintStroke(e))
          _paintStroke(e);

      return this;
      });
    }
  };

})();
