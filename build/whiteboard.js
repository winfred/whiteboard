HTMLElement.prototype.removeClass = HTMLElement.prototype.removeClass || function(className) {
  this.className = this.className.split(" "+className).join('');
};

HTMLElement.prototype.addClass = HTMLElement.prototype.addClass || function(className) {
  this.className += " " + className;
};

HTMLElement.prototype.hasClass = HTMLElement.prototype.hasClass || function(className) {
  var classes = this.className.split(' ');
  for (var i = classes.length - 1; i >= 0; i--) {
    if (classes[i] === className) return true;
  };
  return false;
};

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

/**
 * A Brush knows its template and name, and it can paint new strokes 
 *    (copies of the template) onto the DOM
 *
 * @attribute {Element} element - a stroke template
 * @attribute {string} name 
 */
whiteboard.Brush = (function(_){

	var Brush = function(template, name){
		this.template = template;
		this.name = name;
		var onpaint = template.attributes.getNamedItem('data-onpaint');
		if (onpaint)
			this.onpaint = onpaint.value.split(', ');
	};

	/**
	 * Paint a new copy of a brush's template onto the DOM
	 * @returns void
	 */
	Brush.prototype.paintStroke = function() {
		var stroke = document.createElement('div');
		stroke.innerHTML = this.template.innerHTML;
		stroke.style.position = 'absolute';
		stroke.className = "stroke";
		stroke.style.top = _.mouseY + "px";
		stroke.style.left = _.mouseX + "px";

		_.htmlTag.appendChild(stroke);

		//always focus a stroke on paint
		_.StrokeAction.focus.invoke({currentTarget: stroke, target: stroke});

		//trigger any onpaint events
		if (this.onpaint) {
			var action;
			for (var i = this.onpaint.length - 1; i >= 0; i--) {
				action = this.onpaint[i];

				//firing traditional actions as well?
				if (_.StrokeAction[action])
					_.StrokeAction[action].invoke();

				//do we even need the onpaint specific actions?
				if (false && _.StrokeAction.onpaint[action])
					_.StrokeAction.onpaint[action](stroke);
			};
		}

		_initializeStrokeActionEventListeners(stroke); 
	};

	/**
	 * Bind all of a stroke's whiteboard-actionable events to their elements
	 *
	 * @param {Element} stroke
	 * @returns void
	 */
	function _initializeStrokeActionEventListeners(stroke) {
      var actionableElement, action, trigger, i,
      actions = stroke.getElementsByClassName('whiteboard-actionable');

      for (i = actions.length - 1; i >= 0; i--) {
        actionableElement = actions[i];

        //supress all actionable ondragstarts - rage against ondragstart (for now)
        actionableElement.ondragstart = function(){return false;};

        action = actionableElement.attributes.getNamedItem('data-action').value;
        trigger = actionableElement.attributes.getNamedItem('data-trigger').value;
        _.addEvent(actionableElement, trigger, _invokeStrokeEvent);
      }

      //all strokes respond to the focus action
      _.addEvent(stroke, 'mousedown', _.StrokeAction.focus.invoke);

    }

    /**
     * Fire a stroke action's function for a specific event
     *
     * @param {Event} event
     * @returns void
     */
    function _invokeStrokeEvent (event) {
      var stroke = _strokeForElement(event.target),
          action = event.currentTarget.attributes.getNamedItem('data-action').value,
          content = stroke.getElementsByClassName('stroke-content')[0];

      //before filters? listners to notify?
      _.StrokeAction[action].invoke(event, content, stroke);
    };

    /**
     * Get the parent stroke container for a given actionable element
     * 
     * @param {Element} element
     * @returns {Element} stroke
     * @throws {StrokeMissingException} 
     */
    function _strokeForElement(element) {
      var probe = element;
      while (!probe.hasClass('stroke') && probe !== _.htmlTag)
        probe = probe.parentElement;

      if (probe.hasClass('stroke'))
        return probe;
      else throw new Error({
        name: "StrokeMissingException",
        message: "This element does not live inside a stroke.", 
        element: element
      });
    };

    return Brush;
  })(whiteboard);

whiteboard.StrokeAction = (function(_){
	var callbacks = {}
	Emitter = {
		on: function(event, callback){
			callbacks[event] = callbacks[event] || [];
			callbacks[event].push(callback);
		},

		off: function(event, callback){
			var eventCallbacks = callbacks[event];
			if (!eventCallbacks) return;

			if (arguments.length == 1) {
				delete callbacks[event];
				return;
			}

			var i = eventCallbacks.indexOf(fn);
			eventCallbacks.splice(i, 1);
		},

		emit: function(event){
			var args = [].slice.call(arguments, 1)
				, eventCallbacks = callbacks[event];

			if (eventCallbacks) {
				for (var i = 0, len = eventCallbacks.length; i < len; ++i) {
					eventCallbacks[i].apply(this, args);
				}
			}
		}
	};
	
	return {
		extend: function(name, actions){
			var strokeAction = {};
			for(var action in actions) {
				strokeAction[action] = (function(action, fn){
					return  function(event, content, stroke){
						fn(event,content,stroke);
						Emitter.emit(name+"."+action);		
					};
				})(action,actions[action]);
			}
			return strokeAction;
		},
		/**
		 * Expose emitter
		 */
		on: Emitter.on,
		off: Emitter.off,
		emit: Emitter.emit,

		/* ------------------------------ */
		/* StrokeAction Helpers  */
		/* ----------------------------- */


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
		}
	};

})(whiteboard);

/**
 * Decrease the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.decreaseFontSize = whiteboard.StrokeAction
	.extend('decreaseFontSize', {
			invoke: function(event, content) {
				var pixels = Number(content.style.fontSize.split('px')[0]);
				content.style.fontSize = (pixels - 2) + 'px';
			}
	});

/**
 * Deletes the stroke if the backspace key was pressed
 */
whiteboard.StrokeAction.destroy = (function(_,$){

	return $.extend('destroy',{
		invoke: function(event) {
			if ($.keyCodeFromEvent(event) === 8 && !event.target.hasClass('editable')) {
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation(); //pesky browser back on backspace
				_.htmlTag.removeChild($.focusedStroke());
				$.disableDocumentClickCatching($.focus.complete);
			}
			return false;
		}
	});

})(whiteboard, whiteboard.StrokeAction);


/**
 * Make a specific element editable and listen for the user to be done editing
 */
whiteboard.StrokeAction.editText = (function(_ ,$){
	return $.extend('editText', {
		invoke: function(event) {
				var editableText = event.target;
				editableText.contentEditable = "true";
				editableText.id = "whiteboard-beingEdited"

				_.addEvent(editableText, 'keydown', $.editText.complete);
				$.enableDocumentClickCatching($.editText.complete);
		},

		complete: function(event) {
			if (!event.target.isContainedInElementOfClass('editable')) {
				var editableText = document.getElementById('whiteboard-beingEdited');
				editableText.contentEditable = "false";
				editableText.id = "";

				_.removeEvent(editableText, 'keydown', $.editText.complete);
				$.disableDocumentClickCatching($.editText.complete);
			}
		}
	});
})(whiteboard, whiteboard.StrokeAction);

/**
 * Apply focused CSS style to a stroke and listen for a loss of user focus
 */
whiteboard.StrokeAction.focus = (function(_,$){

	return $.extend('focus',{
		invoke: function(event) {
			var focusedStroke = $.focusedStroke();
			if (focusedStroke) focusedStroke.removeClass('whiteboard-focused');

			_.addEvent(document, 'keyup', $.destroy.invoke);

			event.currentTarget.addClass('whiteboard-focused');
			$.enableDocumentClickCatching($.focus.complete);
		},

		complete: function(event) {
			if (!event.target.isContainedInElementOfClass('whiteboard-focused')) {
				var stroke = $.focusedStroke();
				
				stroke.removeClass('whiteboard-focused');
				$.disableDocumentClickCatching($.focus.complete);
				_.removeEvent(document, 'keyup', $.destroy.invoke);
			};
		}
	});

})(whiteboard, whiteboard.StrokeAction);

/**
 * Increase the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.increaseFontSize = whiteboard.StrokeAction
	.extend('increaseFontSize', {
		invoke: function(event, content) {
			var pixels = Number(content.style.fontSize.split('px')[0]);
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
			stroke.id = "whiteboard-beingMoved";
			_.addEvent(_.htmlTag, 'mousemove', $.move.process);
			_.addEvent(_.htmlTag, 'mouseup', $.move.complete);
		},

		process: function(event) {
			var movingElement = document.getElementById('whiteboard-beingMoved');
			movingElement.style.top = _.mouseY - movingElement.clientHeight + 10 + "px";
			movingElement.style.left = _.mouseX + "px";
		},

		complete: function(event) {
			document.getElementById('whiteboard-beingMoved').id = "";
			_.removeEvent(_.htmlTag, 'mouseup', $.move.complete);
			_.removeEvent(_.htmlTag, 'mousemove', $.move.process);
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
				var stroke = $.focusedStroke();

				_.addEvent(_.htmlTag, 'mousemove', $.rotate.process);
				_.addEvent(_.htmlTag, 'mouseup', $.rotate.complete);
			},

			process: function(event) {
				var strokeContent = $.focusedStrokeContent(),
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

			complete: function(event) {
				_.removeEvent(_.htmlTag, 'mousemove', $.rotate.process);
				_.removeEvent(_.htmlTag, 'mouseup', $.rotate.complete);
			}
		});
})(whiteboard, whiteboard.StrokeAction);
