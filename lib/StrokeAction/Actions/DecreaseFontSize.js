/**
 * Decrease the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.decreaseFontSize = whiteboard.StrokeAction
  .extend('decreaseFontSize', {
      invoke: function(event, content) {
        var pixels = Number(content.style.fontSize.split('px')[0]);
        content.style.fontSize = (pixels - 2) + 'px';
      }
  });
