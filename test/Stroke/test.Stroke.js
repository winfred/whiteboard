describe("Stroke", function() {
	var _ = whiteboard;
	describe(".includedBy", function() {
		it("attaches Stroke module functions to the provided object", function() {
			var stroke = _.test.helpers.paintStroke();
			_.Stroke.includedBy(stroke);
			expect(typeof stroke.serialize).to.be('function');
			_.htmlTag.removeChild(stroke);
		});
	});

	describe("#serialize", function(){

		var stroke, serialized;

		beforeEach(function() {
			stroke = _.test.helpers.paintStroke();
			serialized = stroke.serialize();
		});

		afterEach(function() {
			_.htmlTag.removeChild(stroke);
		});

		it("returns a POJO of attributes", function() {
			expect(serialized).to.be.a('object');
		});

		it("has the stroke's id", function() {
			expect(serialized.id).to.be.a('string');	
		});

		it("has the stroke's html content (for now)", function() {
		  expect(serialized.html[0]).to.be("<");
		});
	});
});
