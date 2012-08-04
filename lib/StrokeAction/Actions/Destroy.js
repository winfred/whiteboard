/**
 * Deletes the stroke if the backspace key was pressed
 */
whiteboard.StrokeAction.destroy = (function(_,$){

  return $.extend('destroy',{
    invoke: function(event) {
      this.target = $.strokeForElement(event.target);
      this.commit();
    },
    commit: function(event) {
      _.htmlTag.removeChild(this.target);
    }
  });

})(whiteboard, whiteboard.StrokeAction);

