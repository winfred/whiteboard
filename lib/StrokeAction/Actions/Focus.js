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
      $.enableDocumentClickCatching($.focus.process);
    },

    process: function(event) {
      if (!event.target.isContainedInElementOfClass('whiteboard-focused'))
        $.focus.complete();
    },

    complete: function() {
      _setTarget.call(this, null);
      $.disableDocumentClickCatching($.focus.process);
    }
  });

})(whiteboard, whiteboard.StrokeAction);
