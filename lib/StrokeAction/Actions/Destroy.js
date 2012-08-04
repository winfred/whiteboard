/**
 * Deletes the stroke if the backspace key was pressed
 */
whiteboard.StrokeAction.destroy = (function(_,$){

  return $.extend('destroy',{
    init: function() {
      $.on('focus.commit',this.invoke);
      $.on('unfocus.commit',this.abort);
    },
    abort: function(event) {
      _.removeEvent(document, 'keydown', $.destroy.process);
    },
    invoke: function(event) {
      _.addEvent(document, 'keydown', $.destroy.process);
    },
    process: function(event) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();

      if ($.keyCodeFromEvent(event) === 8 && !event.target.hasClass('editable')) {
        $.destroy.commit();
      }
      return false;
    },
    commit: function(event) {
      this.target = $.focus.target;
      $.unfocus.commit();
      _.htmlTag.removeChild(this.target);
    }
  });

})(whiteboard, whiteboard.StrokeAction);

