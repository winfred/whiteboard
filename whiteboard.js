HTMLElement.prototype.removeClass = HTMLElement.prototype.removeClass || function(className) {
  this.className = this.className.split(" "+className).join('');
};

HTMLElement.prototype.addClass = HTMLElement.prototype.addClass || function(className) {
  this.className += " " + className;
};

HTMLElement.prototype.hasClass = HTMLElement.prototype.hasClass || function(className) {
  var classes = this.className.split(' ');
  for (var i = classes.length - 1; i >= 0; i--) {
    if (classes[i] === className) return true;
  };
  return false;
};

HTMLElement.prototype.applyTransformation = HTMLElement.prototype.applyTransformation || function(transformation) {
  if (this.style.webkitTransform != undefined)
    this.style.webkitTransform = transformation;

  if (this.style.MozTransform != undefined)
    this.style.MozTransform = transformation;

  if (this.style.OTransform != undefined)
    this.style.OTransform = transformation;

  if (this.style.msTransform != undefined)
    this.style.msTransform = transformation;
}


window.whiteboard = (function(){
  /* ------------------------------- */
  /* Private variables and functions */
  /* ------------------------------- */

   var _brushes = {}, _activeBrush,
       _htmlTag = document.getElementsByTagName('html')[0],
       _mouseX, _mouseY, _previousX, _previousY,
       _deltaX, _deltaY;

  /**
   * cross browser add event method
   *
   * @param {Element|HTMLDocument} object
   * @param {string} type
   * @param {Function} callback
   * @returns void
   */
  function _addEvent(object, type, callback) {
    if (object.addEventListener) {
      return object.addEventListener(type, callback, false);
    }

    object.attachEvent('on' + type, callback);
  };

  function _removeEvent(object, type, callback) {
    if (object.removeEventListener) {
      return object.removeEventListener(type, callback, false);
    }

    return object.detachEvent('on' + type, callback);
  };

  function _fireEvent (element, type, name, memo) {
    var event;
    if (document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.initEvent(type, true, true);
    } else {
      event = document.createEventObject();
      event.eventType = type;
    }

    event.eventName = name || 'whiteboard-event';
    event.memo = memo || { };

    if (document.createEvent) {
      element.dispatchEvent(event);
    } else {
      element.fireEvent("on" + event.eventType, event);
    }

  }

  function _updateMousePosition(e) {
    if (e.currentTarget === document) {
      _previousY = _mouseY, _previousX = _mouseX;

      _mouseX = (window.Event) ? 
                       e.pageX : 
                       event.clientX + (document.documentElement.scrollLeft ? 
                                        document.documentElement.scrollLeft : 
                                        _htmlTag.scrollLeft);

      _mouseY = (window.Event) ? 
                       e.pageY : 
                       event.clientY + (document.documentElement.scrollTop ? 
                                        document.documentElement.scrollTop : 
                                        _htmlTag.scrollTop);
      _deltaX = _mouseX - _previousX;
      _deltaY = _mouseY - _previousY;
    };
  };

  function _deltaY() {
    return _mouseY - _previousY;
  };

  function _deltaX() {
    return _mouseX - _previousX;
  }

  /**
   * takes the event and returns the keycode
   *
   * @param {Event} e
   * @return {number}
   */
  function _keyCodeFromEvent(e) {

      // add which for key events
      // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
      var char_code = typeof e.which == "number" ? e.which : e.keyCode;

      // right command on webkit, command on gecko
      if (char_code == 93 || char_code == 224) {
          return 91;
      }

      // map keypad numbers to top-of-keyboard numbers
      if (char_code >= 96 && char_code <= 105){
          return char_code - 48;
      }

      return char_code;
  };

  function _paintStroke(e) {
    if (_activeBrush && !e.defaultPrevented &&
        !_isContainedInElementOfClass(e.target, 'stroke') && 
        !_isContainedInElementOfClass(e.target, 'toolbox')) {
      var stroke = _activeBrush.createStroke();
      stroke.paint();

      if (!e.shiftKey)
        _activeBrush = null;
    }
  };

  /**
   * Checks to see if the element is contained in another of a certain class
   *
   * @param {Element} element
   * @param {string} className
   * @return {boolean}
   */
  function _isContainedInElementOfClass(element, className) {
    while (!element.hasClass(className) && element !== _htmlTag && element.parentElement) {
      element = element.parentElement;
    }
    if (element.hasClass(className)) return true;
    else return false;
  };

  function _toggleBrushComposition(e) {
    if (e.preventDefault) e.preventDefault();     
    _activeBrush = _brushFromEvent(e);
  };

  function _enableDocumentClickCatching(callback) {
    _addEvent(document, 'click', callback);
  };

  function _disableDocumentClickCatching(callback) {
    _removeEvent(document, 'click', callback);
  };

  /**
   * Get the brush corresponding to a tool's click event target
   * 
   * @param {Event} e
   * @return {Brush}
   */
  function _brushFromEvent(e) {
    var name = e.currentTarget.attributes.getNamedItem('data-brush-name').value;
    return _brushes[name];
  }

  /*
   *  Shorthand for the global whiteboard POJO.
   *  _ === window.whiteboard
   *  But we need to also expose it to public objects (Brush/Stroke) within this 
   *   IIFE scope since they (currently) need access to private helper functions
   */
  var _ = {
    addEvent: _addEvent,
    removeEvent: _removeEvent,

    /**
     * register a new brush type
     * should be a DOM element with which the contents will be used to paint
     * see HTML data-attribute API reference
     *
     * @param {Element} element
    */
    addBrush: function(element) {
      var name = element.attributes.getNamedItem('data-brush-name').value;
      _brushes[name] = new this.Brush(element, name);
    },

    getBrush: function(name) {
      return _brushes[name];
    },

    /**
     * find all the brushes in the document and register them
     */
    init: function() {
      var brushes = document.getElementsByClassName('brush');

      for (var i = 0; i < brushes.length; i++) {
        this.addBrush(brushes[i]);
      }

      var toolButtons = document.getElementsByClassName('tool');
      for (var i = 0; i < toolButtons.length; i++) {
        _addEvent(toolButtons[i], 'click', _toggleBrushComposition);
      }

      _addEvent(document, 'mousemove', _updateMousePosition);
      _addEvent(document, 'mousedown', _paintStroke);
    }
  };

  /**
   * Expose helper objects
   */


  /**
   *
   * @pattern Factory (of strokes)
   * @param {Element} element - a stroke template
   * @param {string} name 
   * @return {Brush}
   */
  _.Brush = (function(){
    var Brush = function(element, name){
      this.element = element;
      this.name = name;
      var onpaint = element.attributes.getNamedItem('data-onpaint');
      if (onpaint)
        this.onpaint = onpaint.value.split(', ');
    };
    Brush.prototype = {
      createStroke: function() {
        return new whiteboard.Stroke(this);
      }
    };

    return Brush;
  })();

  _.Stroke = (function(_){

    function _strokeForElement(element) {
      var probe = element;
      while (!probe.hasClass('stroke') && probe !== _htmlTag) {
        probe = probe.parentElement;
      }

      if (probe.hasClass('stroke'))
        return probe;
      else throw new Error({
        name: "StrokeMissingException",
        message: "This element does not live inside a stroke.", 
        element: element
      });
    };

    function _startStrokeEvent (event) {
      var stroke = _strokeForElement(event.target);
      var action = event.currentTarget.attributes.getNamedItem('data-action').value;
      var content = stroke.getElementsByClassName('stroke-content')[0];
      //before filters?
      _.strokeActions[action].start(event, content, stroke);
    };

    function _focusedStroke() {
      return document.getElementsByClassName('whiteboard-focused')[0];
    };

    function _focusedStrokeContent() {
      return _focusedStroke().getElementsByClassName('stroke-content')[0];
    };

    function _addEventToNodeAndChildren (node, event, callback) {
      if (node.childElementCount == 0)
        return node[event] = callback;
      else {
        _.addEvent(node, event, callback);

        for (var i = node.children.length - 1; i >= 0; i--) {
          _addEventToNodeAndChildren(node.children[i], event, callback);
        }
      }
    };

    function _rotationGridLock(number) {
      //there has to be a more clever way to do this with modulo 45 or something
      if (_numberIsWithinGridlock(number - 180))
        return 180;

      if (_numberIsWithinGridlock(number + 180))
        return -180;

      if (_numberIsWithinGridlock(number - 90))
        return 90;

      if (_numberIsWithinGridlock(number + 90))
        return -90;

      if (_numberIsWithinGridlock(number))
        return 0;

      return number;
    }

    function _numberIsWithinGridlock(number) {
      if (Math.abs(number) < 5 && Math.abs(number) > -5)
        return true;
      else
        return false;
      return number 
    };

    var Stroke = function(brush){
      this.brush = brush;
      this.element = document.createElement('div');
      this.element.innerHTML = brush.element.innerHTML;
      this.element.style.position = 'absolute';
      this.element.style.fontSize = "16px";
      this.element.className = "stroke";

      this.initializeEventListeners();
    };

    Stroke.prototype = {

      paint: function() {
        this.element.style.top = _mouseY;
        this.element.style.left = _mouseX;
        _htmlTag.appendChild(this.element);

        //always focus a stroke on paint
        _.strokeActions.focus.start({currentTarget: this.element});

        if (this.brush.onpaint) {
          for (var i = this.brush.onpaint.length - 1; i >= 0; i--) {
            var action = this.brush.onpaint[i];
            _.strokeActions.onpaint[action](this);
          };
        }        
      },

      initializeEventListeners: function() {
        var actions = this.element.getElementsByClassName('whiteboard-actionable');

        for (var i = actions.length - 1; i >= 0; i--) {
          var actionableElement = actions[i];

          //supress all actionable ondragstarts - rage against ondragstart
          actionableElement.ondragstart = function(){return false;};

          var action = actionableElement.attributes.getNamedItem('data-action').value;
          var trigger = actionableElement.attributes.getNamedItem('data-trigger').value;
          _.addEvent(actionableElement, trigger, _startStrokeEvent);
        };
        _.addEvent(this.element, 'mousedown', _.strokeActions.focus.start);
        _
      }
    };


    _.strokeActions = {

      onpaint: {
        focusEditableText: function(stroke) {
          var editableText = stroke.element.getElementsByClassName('editable')[0];
          _fireEvent(editableText, 'mousedown');
        }
      },

      move: {

        start: function(event, content, stroke) {
          stroke.id = "whiteboard-beingMoved";
          _.addEvent(_htmlTag, 'mousemove', _.strokeActions.move.continue);
          _.addEvent(_htmlTag, 'mouseup', _.strokeActions.move.finish);
        },

        continue: function(event) {
          var movingElement = document.getElementById('whiteboard-beingMoved');
          movingElement.style.top = _mouseY - movingElement.clientHeight + 10;
          movingElement.style.left = _mouseX;
        },

        finish: function(event) {
          document.getElementById('whiteboard-beingMoved').id = "";
          _.removeEvent(_htmlTag, 'mouseup', _.strokeActions.move.finish);
          _.removeEvent(_htmlTag, 'mousemove', _.strokeActions.move.continue);
        }

      },

      focus: {

        start: function(event) {
          var focusedStroke = _focusedStroke();
          if (focusedStroke) focusedStroke.removeClass('whiteboard-focused');

          _.addEvent(document, 'keyup', _.strokeActions.destroy.start);

          event.currentTarget.addClass('whiteboard-focused');
          _enableDocumentClickCatching(_.strokeActions.focus.finish);
        },

        finish: function(event) {
          if (!_isContainedInElementOfClass(event.target, 'whiteboard-focused')) {

            var stroke = _focusedStroke();
            stroke.removeClass('whiteboard-focused');
            _disableDocumentClickCatching(_.strokeActions.focus.finish);
            _.removeEvent(document, 'keyup', _.strokeActions.destroy.start);
          };
        }
      },

      destroy: {

        start: function(event) {
          if (_keyCodeFromEvent(event) === 8 && !event.target.hasClass('editable')) {
            if (event.preventDefault) event.preventDefault();
            if (event.stopPropagation) event.stopPropagation();
            _htmlTag.removeChild(_focusedStroke());
            _disableDocumentClickCatching(_.strokeActions.focus.finish);
          }
          return false;
        }
      },

      rotate: {

        start: function(event, content) {
          var stroke = _focusedStroke();

          _.addEvent(_htmlTag, 'mousemove', _.strokeActions.rotate.continue);
          _.addEvent(_htmlTag, 'mouseup', _.strokeActions.rotate.finish);
        },

        continue: function(event) {
          var strokeContent = _focusedStrokeContent(),
              rotation = strokeContent.attributes.getNamedItem('data-rotation');

          if (!rotation) {
            rotation = document.createAttribute('data-rotation');
            rotation.nodeValue = 0;
          }

          var degrees = _rotationGridLock(Number(rotation.value) - _deltaX) % 360;

          rotation.nodeValue = degrees;
          strokeContent.attributes.setNamedItem(rotation);

          strokeContent.applyTransformation("rotate(" + degrees + "deg)");
        },

        finish: function(event) {
          _.removeEvent(_htmlTag, 'mousemove', _.strokeActions.rotate.continue);
          _.removeEvent(_htmlTag, 'mouseup', _.strokeActions.rotate.finish);
        }
      },

      resize: {
        start: function(event) {

        }
      },

      increaseFontSize: {
        start: function(event, content) {
          var pixels = Number(content.style.fontSize.split('px')[0]);
          if (!pixels) {
            pixels = Number(content.attributes.getNamedItem('data-default-fontsize').value)
          }
          content.style.fontSize = (pixels + 2) + 'px';
        }
      },

      decreaseFontSize: {
        start: function(event, content) {
          var pixels = Number(content.style.fontSize.split('px')[0]);
          content.style.fontSize = (pixels - 2) + 'px';
        }
      },

      editText: {
        start: function(event) {
          var editableText = event.target;
          editableText.contentEditable = "true";
          editableText.id = "whiteboard-beingEdited"


          _addEvent(editableText, 'keydown', _.strokeActions.editText.finish);
          _enableDocumentClickCatching(_.strokeActions.editText.finish);
        },

        finish: function(event) {
          if (!_isContainedInElementOfClass(event.target, 'editable')) {
            var editableText = document.getElementById('whiteboard-beingEdited');
            editableText.contentEditable = "false";
            editableText.id = "";

            _removeEvent(editableText, 'keydown', _.strokeActions.editText.finish);
            _disableDocumentClickCatching(_.strokeActions.editText.finish);
          }
        }
      }
    }

    return Stroke;
  })(_);

  return _;
})();
