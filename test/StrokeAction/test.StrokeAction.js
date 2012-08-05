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
      _$.emit("myStrokeAction.actionOne", {});
      expect(handlerCalled).to.be(true);
    });

    it("prepends the module namespace to the event name", function() {
      var namespace = "";
      _$.on("myStrokeAction.*", function(event) {
        namespace = event.module;
      });
      _$.emit("myStrokeAction.actionOne", {});
      expect(namespace).to.be("StrokeAction");
    });

    it("provides action-scoped functions for registering event handlers", function() {
      var handlerCalled = false,
          myFun = function() {
            handlerCalled = true;
          };
      myStrokeAction.on("*", myFun);
      myStrokeAction.emit('actionOne', {});
      expect(handlerCalled).to.be(true);
      handlerCalled = false;
      myStrokeAction.off("*", myFun);
      myStrokeAction.emit('actionOne', {});
      expect(handlerCalled).to.be(false);

    });
  });
});
