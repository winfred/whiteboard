/**
 * Deletes the stroke if the backspace key was pressed
 */
whiteboard.StrokeAction.destroy = (function(_,$){

	return $.extend('destroy',{
		invoke: function(event) {
			if ($.keyCodeFromEvent(event) === 8 && !event.target.hasClass('editable')) {
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation(); //pesky browser back on backspace
				_.htmlTag.removeChild($.focusedStroke());
				$.disableDocumentClickCatching($.focus.complete);
			}
			return false;
		}
	});

})(whiteboard, whiteboard.StrokeAction);

