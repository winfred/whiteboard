describe("whiteboard.Canvas", function() {
  var _ = whiteboard,
      Canvas = _.Canvas;
      c = new Canvas();

  describe("module ", function() {

    describe("attributes", function() {

      describe(".active", function() {

        it("exists", function() {
          whiteboard.Canvas.hasOwnProperty('active');
        });

      });

    });

    describe("functions", function() {

      describe("init", function() {
        Canvas.init();

        it("sets an active canvas", function() {
          expect(Canvas.active).to.be.ok();
        });

        it("adds/updates strokes on StrokeAction|Stroke.*.commit events", function() {
          var stroke =  {id: "hey"};
          _.emit("StrokeAction.hey.commit", {target: stroke});
          expect(Canvas.active.strokes["hey"]).to.eql(stroke);
        });

      });

    });

  });


  describe("instance attributes", function() {
    describe("#strokes", function() {
      it("is a POJO", function() {
        expect(c.hasOwnProperty("strokes")).to.be(true);
        expect(typeof c.strokes).to.be('object');
      });

    });
    describe("#id", function() {
      it("is a string", function() {
        expect(c.hasOwnProperty("id")).to.be(true);
        expect(typeof c.id).to.be('string');
      });
    });
    describe("#name", function() {
      it("is a string", function() {
        expect(c.hasOwnProperty("name")).to.be(true);
        expect(typeof c.name).to.be('string');
      });
    });
  });



});
