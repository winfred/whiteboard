/**
 * Apply focused CSS style to a stroke and listen for a loss of user focus
 */
whiteboard.StrokeAction.focus = (function(_,$){

  return $.extend('focus',{
    invoke: function(event) {
      var focusedStroke = $.focusedStroke();
      if (focusedStroke) focusedStroke.removeClass('whiteboard-focused');

      _.addEvent(document, 'keyup', $.destroy.invoke);

      event.currentTarget.addClass('whiteboard-focused');
      $.enableDocumentClickCatching($.focus.complete);
    },

    complete: function(event) {
      if (!event.target.isContainedInElementOfClass('whiteboard-focused')) {
        var stroke = $.focusedStroke();
        
        stroke.removeClass('whiteboard-focused');
        $.disableDocumentClickCatching($.focus.complete);
        _.removeEvent(document, 'keyup', $.destroy.invoke);
      };
    }
  });

})(whiteboard, whiteboard.StrokeAction);
