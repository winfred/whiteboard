whiteboard.StrokeAction = (function(_){
  var module = "StrokeAction";

    /**
     * Get the parent stroke container for a given actionable element
     *   If the element provided is not contained in a stroke, 
     *   provide the focused stroke.
     * 
     * @param {Element} element
     * @returns {Element} stroke
     * @throws {StrokeMissingException} 
     * @api private
     */
    function _strokeForElement(element) {
      if (!element) 
        return _.StrokeAction.focusedStroke();

      var probe = element;
      while (!probe.hasClass('stroke') && probe !== _.htmlTag)
        probe = probe.parentElement;

      if (probe.hasClass('stroke'))
        return probe;
      else 
        return whiteboard.StrokeAction.focusedStroke();
    };

    function _createInternalEvent(action, step, DOMevent, target) {
      DOMevent = DOMevent || {};
      var stroke = _strokeForElement(DOMevent.target);

      return {
        action: action,
        step: step,
        stroke: stroke,
        e: DOMevent,
        target: target
      };
    };

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
     * @param {String} action - name of the new StrokeAction
     * @param {Object} steps - pojo of action steps
     * @return {StrokeAction}
     */

    extend: function(action, steps){
      if (steps.init) steps.init();

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
        emit: function(step) {
          arguments[0] = module + "." + action + "." + step;
          return _.emit.apply(arguments[0], arguments);
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
            strokeAction.emit.apply(strokeAction, [step, _createInternalEvent(action, step, DOMevent, strokeAction.target)]);
          };
        })(step,steps[step]);
      }

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
     * @param {Event} event
     * @returns void
     * @api module 
     */
     invokeStrokeActionFromEvent: function(event) {
      var stroke = _strokeForElement(event.target),
          action = event.currentTarget.attributes.getNamedItem('data-action').value,
          content = stroke.getElementsByClassName('stroke-content')[0];

      //before filters? listners to notify?
      _.StrokeAction[action].invoke(event, content, stroke);
    },
    
  
    /**
     * Bind all of a stroke's whiteboard-actionable events to their elements
     *
     * @param {Element} stroke
     * @returns void
     * @api private
     */
    initializeStrokeActionEventListeners: function(stroke) {
      var actionableElement, action, trigger, i,
      actions = stroke.getElementsByClassName('whiteboard-actionable');

      for (i = actions.length - 1; i >= 0; i--) {
        actionableElement = actions[i];

        //supress all actionable ondragstarts - rage against ondragstart (for now)
        actionableElement.ondragstart = function(){return false;};

        action = actionableElement.attributes.getNamedItem('data-action').value;
        trigger = actionableElement.attributes.getNamedItem('data-trigger').value;
        _.addEvent(actionableElement, trigger, _.StrokeAction.invokeStrokeActionFromEvent);
      }

      //all strokes respond to the focus action
      _.addEvent(stroke, 'mousedown', _.StrokeAction.focus.invoke);

    }

  };

})(whiteboard);
