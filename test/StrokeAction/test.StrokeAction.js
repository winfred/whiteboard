describe("whiteboard.StrokeAction", function() {
  var _ = whiteboard,
      _$ = whiteboard.StrokeAction;

  describe("#extend", function() {
    var myStrokeAction = _$.extend('myStrokeAction', {
      actionOne: function(){
        return true;
      }
    });

    it("wraps event emitters around all action steps", function() {
      var handlerCalled = false,
        handler = function(){
          handlerCalled = true;
        };
      _$.on("myStrokeAction.*", handler);
      _$.emit("myStrokeAction.actionOne");
      expect(handlerCalled).to.be(true);
    });

    it("provides shortcut functions for registering event handlers", function() {
      var handlerCalled = false,
          myFun = function() {
            handlerCalled = true;
          };
      myStrokeAction.on("*", myFun);
      myStrokeAction.emit('actionOne');
      expect(handlerCalled).to.be(true);
      handlerCalled = false;
      myStrokeAction.off("*", myFun);
      myStrokeAction.emit('actionOne');
      expect(handlerCalled).to.be(false);

    });
  });
});
