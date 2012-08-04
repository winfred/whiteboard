/**
 * Increase the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.increaseFontSize = whiteboard.StrokeAction
  .extend('increaseFontSize', {
    invoke: function(event, content) {
      this.target = whiteboard.StrokeAction.strokeForElement(event.target);
      this.commit();
    },
    commit: function() {
      var content = this.target.getElementsByClassName('stroke-content')[0],
          pixels = Number(content.style.fontSize.split('px')[0]);

      if (!pixels) {
        pixels = Number(content.attributes.getNamedItem('data-default-fontsize').value)
      }
      content.style.fontSize = (pixels + 2) + 'px';
 
    }
  });
