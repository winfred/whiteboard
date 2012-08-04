/**
 * Decrease the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.decreaseFontSize = whiteboard.StrokeAction
  .extend('decreaseFontSize', {
      invoke: function(event, content, stroke) {
				this.target  = content;
				this.stroke = stroke;
				this.commit();
      },
			commit: function() {
				var pixels = Number(this.content.style.fontSize.split('px')[0]);
				this.content.style.fontSize = (pixels - 2) + 'px';
			}       
  });
