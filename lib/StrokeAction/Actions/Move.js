/**
 * Move an element while its drag handler is held by the mouse
 */
whiteboard.StrokeAction.move = (function(_,$){
	return $.extend('move', {
		invoke: function(event, content, stroke) {
			stroke.id = "whiteboard-beingMoved";
			_.addEvent(_.htmlTag, 'mousemove', $.move.process);
			_.addEvent(_.htmlTag, 'mouseup', $.move.complete);
		},

		process: function(event) {
			var movingElement = document.getElementById('whiteboard-beingMoved');
			movingElement.style.top = _.mouseY - movingElement.clientHeight + 10 + "px";
			movingElement.style.left = _.mouseX + "px";
		},

		complete: function(event) {
			document.getElementById('whiteboard-beingMoved').id = "";
			_.removeEvent(_.htmlTag, 'mouseup', $.move.complete);
			_.removeEvent(_.htmlTag, 'mousemove', $.move.process);
		}
	});
})(whiteboard, whiteboard.StrokeAction);
