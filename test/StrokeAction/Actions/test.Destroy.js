describe("StrokeAction.destroy", function() {
  var _ = whiteboard,
      $ = whiteboard.StrokeAction,
      helpers = whiteboard.test.helpers;

	describe("commit", function() {
		it("removes the stroke from the DOM", function() {
			var stroke = helpers.paintStroke();	
			expect(document.contains(stroke)).to.be(true);
			$.destroy.invoke({target: stroke});
			expect(document.contains(stroke)).to.be(false);
		});
	});
});
