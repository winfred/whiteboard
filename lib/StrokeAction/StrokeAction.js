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
              e: DOMevent,
              target: strokeAction.target
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
      while (!probe.hasClass('stroke') && probe !== _.htmlTag)
        probe = probe.parentElement;

      if (probe.hasClass('stroke'))
        return probe;
      else 
        return whiteboard.StrokeAction.focusedStroke();
    }


  };

})(whiteboard);
