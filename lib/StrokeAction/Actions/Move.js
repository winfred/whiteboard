/**
 * Move an element while its drag handler is held by the mouse
 */
whiteboard.StrokeAction.move = (function(_,$){
  return $.extend('move', {
    invoke: function(event, content, stroke) {
			this.target = $.strokeForElement(event.target);

      _.addEvent(_.htmlTag, 'mousemove', this.process);
      _.addEvent(_.htmlTag, 'mouseup', this.commit);
    },

    process: function(event) {
      this.target.style.top = _.mouseY - this.target.clientHeight + 10 + "px";
      this.target.style.left = _.mouseX + "px";
    },

    commit: function(event) {
      _.removeEvent(_.htmlTag, 'mouseup', this.commit);
      _.removeEvent(_.htmlTag, 'mousemove', this.process);
    }
  });
})(whiteboard, whiteboard.StrokeAction);
