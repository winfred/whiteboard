describe("whiteboard", function() {
  var _ = whiteboard;
  describe("events", function() {
    describe("#on", function() {
      it("binds a function to an event", function() {
        var called = false;
        _.on("StrokeAction.focus.complete", function(){
          called = true;
        });
        _.emit('StrokeAction.focus.complete');
        expect(called).to.be(true);
      });
      it("allows wildcard event registration", function() {
        var called = false;
        _.on("StrokeAction.*.complete", function() {
          called = true;
        });
        _.emit('StrokeAction.asdfasdf.complete');
        expect(called).to.be(true);
      });
    });

    describe("#off", function() {
      it("unbinds a funtion from an event", function() {
        var called = false;
        function myFun(){
          called = true;
        };
        _.on("StrokeAction.focus.complete", myFun);
        _.emit('StrokeAction.focus.complete');
        expect(called).to.be(true);
        called = false;
        _.off("StrokeAction.focus.complete", myFun);
        _.emit("StrokeAction.focus.complete");
        expect(called).to.be(false);
      });
    });
  });

  describe("attributes", function() {
    describe("activeCanvas", function() {
      it("stores a reference to the canvas that is currently being manipulated", function() {
        _.hasOwnProperty("activeCanvas");
        //TODO: flesh out this concept
      });
      
      it("listens for new brush strokes to add to the active canvas", function() {
        
      });
    });
  });

});
