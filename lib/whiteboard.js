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
    htmlTag:  document.getElementsByTagName('html')[0],


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
    init: function() {
      _.initSubmodules();

      _.addEvent(document, 'mousemove', _updateMousePosition);

      return this;
    }
  };

})();
