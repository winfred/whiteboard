describe("whiteboard.StrokeAction", function() {
  var _ = whiteboard,
      _$ = whiteboard.StrokeAction;
  describe("#on", function() {
    it("binds a function to an event", function() {
      var called = false;
      _$.on("focus.complete", function(){
        called = true;
      });
      _$.emit('focus.complete');
      expect(called).to.be(true);
    });
  });
});
