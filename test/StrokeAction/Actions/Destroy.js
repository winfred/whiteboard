describe("StrokeAction.destroy", function() {
  var _ = whiteboard,
      $ = whiteboard.StrokeAction,
      helpers = whiteboard.test.helpers;

  helpers.paintStroke(); 

  describe("init", function() {
    it("adds listeners to focus.invoke events", function() {
      $.emit("focus.invoke");
    });
  });
});
