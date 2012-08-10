describe("StrokeAction.unfocus", function() {
	var _ = whiteboard,
			$ = whiteboard.StrokeAction;
	
	describe("commit", function() {
		it("removes the focused style from the currently focused element", function() {
			var stroke = _.test.helpers.paintStroke();
			$.focus.invoke({currentTarget: stroke});
			$.unfocus.target = stroke;
			$.unfocus.commit();
			expect(stroke.hasClass('whiteboard-focused')).to.be(false);
			_.bodyTag.removeChild(stroke);
		});
	});

});
