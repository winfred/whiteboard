describe("cleanup", function() {
	it("removes all painted elements", function() {
		var strokes = document.getElementsByClassName("stroke");
		for(var i = strokes.length - 1; i > 0; i--)
			whiteboard.StrokeAction.destroy.invoke({target: strokes[i]});
		localStorage.clear();
		//expect(document.getElementsByClassName("stroke")).to.be.empty();
	});
});
