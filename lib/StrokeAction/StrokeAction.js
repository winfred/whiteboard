whiteboard.StrokeAction = (function(_){
  var callbacks = {}
  Emitter = {
    on: function(event, fn){
      callbacks[event] = callbacks[event] || [];
      callbacks[event].push(fn);
    },

    off: function(event, fn){
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
          return  function(){
            fn.apply(strokeAction[action], arguments);
            Emitter.emit(name+"."+action, arguments);   
          };
        })(action,actions[action]);
      }
      strokeAction.on = function(event,fn){
        Emitter.on(name+'.'+event, fn);
        return this;
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
