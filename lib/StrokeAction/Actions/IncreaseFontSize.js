/**
 * Increase the font-size of a stroke's stroke-content element
 */
whiteboard.StrokeAction.increaseFontSize = whiteboard.StrokeAction
	.extend('increaseFontSize', {
		invoke: function(event, content) {
			var pixels = Number(content.style.fontSize.split('px')[0]);
			if (!pixels) {
				pixels = Number(content.attributes.getNamedItem('data-default-fontsize').value)
			}
			content.style.fontSize = (pixels + 2) + 'px';
		}
	});
