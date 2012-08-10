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
