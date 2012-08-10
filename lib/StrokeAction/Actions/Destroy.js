/**
 * Deletes the stroke if the backspace key was pressed
 */
whiteboard.StrokeAction.destroy = (function(_,$){

  return $.extend('destroy',{
    invoke: function(event) {
      if (event.preventDefault) event.preventDefault();
      this.target = $.strokeForElement(event.target);
      this.commit();
      return false;
    },
    commit: function(event) {
      this.target.removeFromDOM();
    }
  });

})(whiteboard, whiteboard.StrokeAction);

