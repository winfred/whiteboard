/**
 * Make a specific element editable and listen for the user to be done editing
 */
whiteboard.StrokeAction.editText = (function(_ ,$){
  return $.extend('editText', {
    invoke: function(event) {
        this.target = event.target;
        this.target.contentEditable = "true";


        _.addEvent(this.target, 'keydown', $.editText.process);
        $.enableDocumentClickCatching($.editText.process);
    },
		process: function(event) {
      if (!event.target.isContainedInElementOfClass('editable'))
				$.editText.commit();
		},

    commit: function() {
			this.target.contentEditable = "false";

			_.removeEvent(this.target, 'keydown', $.editText.process);
			$.disableDocumentClickCatching($.editText.process);
    }
  });
})(whiteboard, whiteboard.StrokeAction);
