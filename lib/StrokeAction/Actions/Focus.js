/**
 * Apply focused CSS style to a stroke and listen for a loss of user focus
 */
whiteboard.StrokeAction.focus = (function(_,$){

  /**
   * Unstyle the currently focused element and
   * apply focused style to provided element, if available
   *
   * @param {Element} element
   * @return void
   * @api private
   */
  function _setTarget(element){
    //remove existing target's focus style
    if (this.target)
      this.target.removeClass('whiteboard-focused');

    this.target = element;

    if (element)
      element.addClass('whiteboard-focused');
  };


  return $.extend('focus',{
    invoke: function(event) {
     _setTarget.call(this, event.currentTarget);
     this.commit();
    },

    commit: function() {
    }
  });

})(whiteboard, whiteboard.StrokeAction);
