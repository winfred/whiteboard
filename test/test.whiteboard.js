describe("whiteboard", function() {
  var _ = whiteboard;
  describe("events", function() {
    var stroke = {id: "hey"};

    describe("#on", function() {
      it("binds a function to an event", function() {
        var called = false;
        _.on("StrokeAction.focus.complete", function(){
          called = true;
        });
        _.emit('StrokeAction.focus.complete', {stroke: stroke});
        expect(called).to.be(true);
      });

      it("allows wildcard event registration", function() {
        var called = false;
        _.on("StrokeAction.*.complete", function() {
          called = true;
        });
        _.emit('StrokeAction.asdfasdf.complete', {stroke: stroke});
        expect(called).to.be(true);
      });

      it("allows OR regex conditions", function() {
        var called = false;
        _.on("(this|that).*.complete", function() {
          called = true;
        });

        _.emit("this.what.complete", {stroke: stroke});
        expect(called).to.be(true);

        called = false;
        _.emit("that.why.complete", {stroke: stroke});
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
        _.emit('StrokeAction.focus.complete', {stroke: stroke});
        expect(called).to.be(true);
        called = false;
        _.off("StrokeAction.focus.complete", myFun);
        _.emit("StrokeAction.focus.complete", {stroke: stroke});
        expect(called).to.be(false);
      });
    });
  });

  describe("functions", function() {
    describe("initSubmodules", function() {
      it("calls init for each submodule", function() {
        var called = false,
        module = {
          Submodule: {
            init: function() {
              called = true;
            }
          }
        };
        _.initSubmodules.apply(module);
        expect(called).to.be(true);
      });
    });
  });

});
