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
		emit: function(event) {
			return _.emit(module + "." + event);
		},
		
		/**
		 * A functional extension for StrokeActions
		 *   This takes care of hooking a StrokeAction's logic into the event emitter
		 *
		 * @param {String} name - of the new StrokeAction
		 * @param {Object} actions - pojo of action steps
		 * @return {StrokeAction}
		 */

		extend: function(name, actions){
      var strokeAction = {
				/**
				 * Expose action scoped emitter
				 */
				on: function(event, fn) {
					return _.on(module + "." + name + "." + event, fn);
				},
				off: function(event, fn) {
					return _.off(module + "." + name + "." + event, fn);
				},
				emit: function(event) {
					return _.emit(module + "." + name + "." + event);
				}
			};
      for(var action in actions) {
				/**
				 * This is where the actions steps are wrapped with event emission.
				 * Perhaps this is a good place for other kinds of hooks to tie in
				 *  (before/after)
				 */
        strokeAction[action] = (function(action, fn){
          return  function(){
            fn.apply(strokeAction[action], arguments);
            strokeAction.emit(action, arguments);
          };
        })(action,actions[action]);
      }

      return strokeAction;
    },


    /* -----------------------------*/
    /* StrokeAction Helpers  				*/
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
    }
  };

})(whiteboard);
