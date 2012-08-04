describe("StrokeAction.focus", function() {
	var _ = whiteboard,
	    $ = whiteboard.StrokeAction;
	
	describe("commit", function() {
		it("applies a whiteboard-focused style to the target element", function() {
			var stroke = _.test.helpers.paintStroke();
			$.focus.invoke({currentTarget: stroke});
			expect(stroke.hasClass('whiteboard-focused')).to.be(true);
			_.htmlTag.removeChild(stroke);
		});
	});

});
