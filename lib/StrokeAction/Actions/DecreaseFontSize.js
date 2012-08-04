/**
 * Decrease the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.decreaseFontSize = whiteboard.StrokeAction
  .extend('decreaseFontSize', {
      invoke: function(event) {
        this.target  = whiteboard.StrokeAction.strokeForElement(event.target);
				this.commit();
      },
			commit: function() {
        var content = this.target.getElementsByClassName('stroke-content')[0];
				    pixels = Number(content.style.fontSize.split('px')[0]);

				content.style.fontSize = (pixels - 2) + 'px';
			}       
  });
