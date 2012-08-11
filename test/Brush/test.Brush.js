describe("Brush", function(){
  var _ = whiteboard;
  describe("module", function() {

    describe(".onpaint", function(){
      it("calls each fn inside for each stroke when it is painted", function() {
        var handlerCalled = false;
        _.Brush.onpaint.testOnPaint = function(){
          handlerCalled = true;
        };
        _.test.helpers.paintStroke();
        expect(handlerCalled).to.be(true);
      });
    });

  });
  describe("instance", function() {
    describe('.onpaint', function() {
      it("each fn inside is called for every time this brush's stroke is painted", function() {
        var handlerCalled;
        _.Brush.get('arrow').onpaint.testInstanceOnPaint = function(){
          handlerCalled = true;
        };
        _.test.helpers.paintStroke();
        expect(handlerCalled).to.be(true);
      });
      it("each fn inside is not called if another brush is being painted", function(){
        var handlerCalled;
        _.Brush.get('text').onpaint.testWrongInstanceOnPaint = function() {
          handlerCalled =true;
        };
        _.test.helpers.paintStroke();
        expect(handlerCalled).to.not.be(true);
      });
    });
  });
});
