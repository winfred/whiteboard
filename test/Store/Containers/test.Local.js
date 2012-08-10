describe("Store.Local", function() {
  var _ = whiteboard;

  describe("writing", function() {
  
    it("stores canvases in a serialized array of ids", function() {
      expect(localStorage['canvases']).to.not.be.empty();
    });

    it("stores a canvas as a serialized array of stroke ids", function() {
      expect(localStorage[_.Canvas.active.id]).to.not.be.empty();
    });

    it("stores strokes by id as serialized html objects", function() {
      var stroke = _.test.helpers.paintStroke();
      expect(localStorage[_.Canvas.active.id + "#" + stroke.id]).to.be.ok();
    });

    it("deletes strokes from storage when they are destroyed", function() {

      var stroke = _.test.helpers.paintStroke();
      _.StrokeAction.destroy.invoke({target: stroke});
      var strokeJson = localStorage[_.Canvas.active.id+"#"+stroke.id];
      expect(strokeJson).to.be(undefined);
      var canvasJson = JSON.parse(localStorage[_.Canvas.active.id]);
      expect(canvasJson.strokes).to.not.contain(stroke.id);
      
    });
  });
  
  describe("reading", function(){
    describe("Event: canvas found", function() {
      it("emits an event for each canvas found on init()", function() {
        var otherCanvas = new _.Canvas(),
            handlerCalled = false;
        _.on("Store.Canvas.found", function() {
          handlerCalled = true;
        });
        _.Store.Local.init();
        expect(handlerCalled).to.be(true);
      });
    });
    describe("#load", function() {

      it("loads a Canvas from localStorage using the parameter's ID", function() {
        var canvas = _.Store.Local.load(_.Canvas.all[0].target);
        expect(canvas.strokes).to.not.be.an(Array);
      });
    });
  });
});
