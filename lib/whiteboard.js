window.whiteboard = (function(){
  /* ------------------------------- */
  /* Private variables and functions */
  /* ------------------------------- */

   var _brushes = {}, _activeBrush,
			 _previousX, _previousY;


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
   *  Shorthand for the global whiteboard POJO.
   *  _ === window.whiteboard
   *  But we need to also expose it to public objects (Brush/StrokActions) within this 
   *   IIFE scope since they (currently) need access to private helper functions
   */
  var _ = {
    /**
     * Expose cross browser event methods for fun
     */
    addEvent: _addEvent,
    removeEvent: _removeEvent,
    fireEvent: _fireEvent,

		/**
		 * Expose other package variables
		 */
		activeBrush: _activeBrush,
		htmlTag:  document.getElementsByTagName('html')[0],


		/**
     * register a new brush type
     * should be a DOM element with which the contents will be used to paint
     * see HTML data-attribute API reference
     *
     * @param {Element} element
     * @returns void
    */
    addBrush: function(element) {
      var name = element.attributes.getNamedItem('data-brush-name').value;
      _brushes[name] = new this.Brush(element, name);
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
      });
    }
  };


  /* ------------------------------------------- */
  /* Expose whiteboard public helper constructs  */
  /* ------------------------------------------- */



  
  //return the whiteboard global object (shorthanded)
  return _;
})();
