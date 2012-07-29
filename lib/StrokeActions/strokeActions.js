/**
 * The collection of stroke action event handlers
 * 
 * Each stroke action is keyed by its name and has a 'invoke' function.
 * 
 */
whiteboard.strokeActions = (function(_){

	var strokeActions = {

		/**
		 * Collection of events that need to be fired on a stroke's paint event
		 */
		onpaint: {
			focusEditableText: function(stroke) {
				_.fireEvent(stroke.getElementsByClassName('editable')[0], 'mousedown');
			}
		},

		/**
		 * Move an element while its drag handler is held by the mouse
		 */
		move: {
			invoke: function(event, content, stroke) {
				stroke.id = "whiteboard-beingMoved";
				_.addEvent(_.htmlTag, 'mousemove', _.strokeActions.move.process);
				_.addEvent(_.htmlTag, 'mouseup', _.strokeActions.move.complete);
			},

			process: function(event) {
				var movingElement = document.getElementById('whiteboard-beingMoved');
				movingElement.style.top = _.mouseY - movingElement.clientHeight + 10 + "px";
				movingElement.style.left = _.mouseX + "px";
			},

			complete: function(event) {
				document.getElementById('whiteboard-beingMoved').id = "";
				_.removeEvent(_.htmlTag, 'mouseup', _.strokeActions.move.complete);
				_.removeEvent(_.htmlTag, 'mousemove', _.strokeActions.move.process);
			}

		},

		/**
		 * Apply focused CSS style to a stroke and listen for a loss of user focus
		 */
		focus: {

			invoke: function(event) {
				var focusedStroke = _focusedStroke();
				if (focusedStroke) focusedStroke.removeClass('whiteboard-focused');

				_.addEvent(document, 'keyup', _.strokeActions.destroy.invoke);

				event.currentTarget.addClass('whiteboard-focused');
				_enableDocumentClickCatching(_.strokeActions.focus.complete);
			},

			complete: function(event) {
				if (!event.target.isContainedInElementOfClass('whiteboard-focused')) {
					var stroke = _focusedStroke();
					
					stroke.removeClass('whiteboard-focused');
					_disableDocumentClickCatching(_.strokeActions.focus.complete);
					_.removeEvent(document, 'keyup', _.strokeActions.destroy.invoke);
				};
			}
		},

		/**
		 * Deletes the stroke if the backspace key was pressed
		 */
		destroy: {

			invoke: function(event) {
				if (_keyCodeFromEvent(event) === 8 && !event.target.hasClass('editable')) {
					if (event.preventDefault) event.preventDefault();
					if (event.stopPropagation) event.stopPropagation(); //pesky browser back on backspace
					_.htmlTag.removeChild(_focusedStroke());
					_disableDocumentClickCatching(_.strokeActions.focus.complete);
				}
				return false;
			}
		},

		/**
		 * Apply CSS3 rotate transformations to the stroke while handler is held down
		 */
		rotate: {

			invoke: function(event, content) {
				var stroke = _focusedStroke();

				_.addEvent(_.htmlTag, 'mousemove', _.strokeActions.rotate.process);
				_.addEvent(_.htmlTag, 'mouseup', _.strokeActions.rotate.complete);
			},

			process: function(event) {
				var strokeContent = _focusedStrokeContent(),
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
				_.removeEvent(_.htmlTag, 'mousemove', _.strokeActions.rotate.process);
				_.removeEvent(_.htmlTag, 'mouseup', _.strokeActions.rotate.complete);
			}
		},

		/**
		 * Increase the font-size of a stroke's stroke-content element
		 */
		increaseFontSize: {
			invoke: function(event, content) {
				var pixels = Number(content.style.fontSize.split('px')[0]);
				if (!pixels) {
					pixels = Number(content.attributes.getNamedItem('data-default-fontsize').value)
				}
				content.style.fontSize = (pixels + 2) + 'px';
			}
		},

		/**
		 * Decrease the font-size of a stroke's stroke-content element
		 */
		decreaseFontSize: {
			invoke: function(event, content) {
				var pixels = Number(content.style.fontSize.split('px')[0]);
				content.style.fontSize = (pixels - 2) + 'px';
			}
		},

		/**
		 * Make a specific element editable and listen for the user to be done editing
		 */
		editText: {
			invoke: function(event) {
				var editableText = event.target;
				editableText.contentEditable = "true";
				editableText.id = "whiteboard-beingEdited"


				_.addEvent(editableText, 'keydown', _.strokeActions.editText.complete);
				_enableDocumentClickCatching(_.strokeActions.editText.complete);
			},

			complete: function(event) {
				if (!event.target.isContainedInElementOfClass('editable')) {
					var editableText = document.getElementById('whiteboard-beingEdited');
					editableText.contentEditable = "false";
					editableText.id = "";

					_.removeEvent(editableText, 'keydown', _.strokeActions.editText.complete);
					_disableDocumentClickCatching(_.strokeActions.editText.complete);
				}
			}
		},

		/**
		 * Add a new strokeAction to the collection.
		 *
		 * @param {string} name
		 * @param {Object} handler
		 */
		addHandler: function(name, handler) {
			_.strokeActions[name] = handler;
		}
	};

	/* ------------------------------ */
	/* strokeAction private helpers  */
	/* ----------------------------- */


  /**
   * Have the document catch all clicks with a callback
   *
   * @param {Function} callback
   * @returns void
   */
  function _enableDocumentClickCatching(callback) {
    _.addEvent(document, 'click', callback);
  };

  /**
   * Stop the document from catching clicks with a calback
   *
   * @param {Function} callback
   * @returns void
   */
  function _disableDocumentClickCatching(callback) {
    _.removeEvent(document, 'click', callback);
  };

	/**
	 * Get the stroke that is currently focused by the user
	 *
	 * @returns {Element}
	 */
	function _focusedStroke() {
		return document.getElementsByClassName('whiteboard-focused')[0];
	};

	/**
	 * Get the 'stroke-content' div for the currently focused stroke
	 *
	 * @returns {Element}
	 */
	function _focusedStrokeContent() {
		return _focusedStroke().getElementsByClassName('stroke-content')[0];
	};

	/**
	 * Cross browser event binds to an element and its children
	 *
	 * @param {Element} node
	 * @param {string} event
	 * @param {Function} callback
	 * @returns void 
	 */
	function _addEventToNodeAndChildren (node, event, callback) {
		if (node.childElementCount == 0)
			return node[event] = callback;
		else {
			_.addEvent(node, event, callback);

			for (var i = node.children.length - 1; i >= 0; i--)
				_addEventToNodeAndChildren(node.children[i], event, callback);
		}
	};

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
	}

	/** 
	 * Determine if a number should be reset to its grid value
	 *
	 * @param {number}
	 * @returns {boolean}
	 */
	function _numberIsWithinGridlock(number) {
		return Math.abs(number) < 5 && Math.abs(number) > -5;
	};

	/**
   * takes the event and returns the keycode
   *  (thanks mousetrap.js)
   *
   * @param {Event} e
   * @return {number}
   */
  function _keyCodeFromEvent(e) {

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
  };


	return strokeActions;
})(whiteboard);

