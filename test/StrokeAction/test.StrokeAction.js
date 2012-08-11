describe("whiteboard.StrokeAction", function() {
  var _ = whiteboard,
      _$ = whiteboard.StrokeAction;

  describe("#extend", function() {
    var myStrokeAction;

    before(function() {
      myStrokeAction = _$.extend('myStrokeAction', {
        invoke: function() {
        },
        actionOne: function(){
          return true;
        }
      });
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
    it("provides a default commit function if none is provided, reducing boilerplate", function() {
      expect(myStrokeAction.commit).to.be.a('function');
    });

    it("throws an error if the provided steps don't include 'invoke'", function(){
      expect(function(){
        _$.extend('BARKBARKBARK',{
            notInvoke: 'fuuuu'
        });
      }).to.throwException();
    });
  });
});
