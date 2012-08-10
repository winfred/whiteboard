describe("Stroke", function() {
  var _ = whiteboard;
  describe(".includedBy", function() {
    it("attaches Stroke module functions to the provided object", function() {
      var stroke = _.test.helpers.paintStroke();
      _.Stroke.includedBy(stroke);
      expect(typeof stroke.toJSON).to.be('function');
      stroke.removeFromDOM();
    });
  });

  describe(".create", function() {
    it("focuses the recently created stroke", function() {
      var stroke = _.Stroke.create(_.Brush.get('arrow'));
      expect(stroke.hasClass('whiteboard-focused')).to.be(true);
      stroke.removeFromDOM();
    });

    it("emits a Stroke.create.commit event", function() {
      var handlerCalled = false,
          stroke,
          module = "";
      _.on("Stroke.create.commit", function(event) {
        handlerCalled = true;
        module = event.module;
      });
      stroke = _.Stroke.create(_.Brush.get('arrow'));
      expect(handlerCalled).to.be(true);
      expect(module).to.be("Stroke");
      stroke.removeFromDOM();
    });
  });
  describe("#toJSON", function(){

    var stroke, serialized;

    beforeEach(function() {
      stroke = _.test.helpers.paintStroke();
      serialized = stroke.toJSON();
    });

    afterEach(function() {
      stroke.removeFromDOM();
    });

    it("returns a POJO of attributes", function() {
      expect(serialized).to.be.a('object');
    });

    it("has the stroke's id", function() {
      expect(serialized.id).to.be.a('string');  
    });

    it("has the stroke's brush name", function() {
      expect(serialized.brush).to.be.a('string');
    });

    it("has the stroke's html content (for now)", function() {
      expect(serialized.html[0]).to.be("<");
    });
  });
});
