/**
 * Remove focused CSS styles from a stroke
 */
whiteboard.StrokeAction.unfocus = (function(_,$){
  
  return $.extend('unfocus', {

    init: function() {
      $.on("focus.commit", this.invoke);
    },

    invoke: function() {
      $.enableDocumentClickCatching(this.process);
    },

    process: function(event) {
      if (event.target.isContainedInElementOfClass &&
         !event.target.isContainedInElementOfClass('whiteboard-focused'))
        this.commit();
    },

    commit: function() {
      this.target = $.focus.target;
      this.target.removeClass('whiteboard-focused');
      $.disableDocumentClickCatching(this.process);
    }
  });
})(whiteboard, whiteboard.StrokeAction);
