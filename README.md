# whiteboard.js

### The missing HTML5 DOMichelangelo.*
##### *super alpha

## Introduction

Whiteboard.js makes it easier to define and draw HTML elements anywhere on the screen, as if they were just different pens for a whiteboard.

There are three major objects unique to whiteboard. The toolbox, brushes, and strokes.

Users click on a tool in the toolbox for a specific brush. Then when they click somewhere on the page, that brush leaves a stroke on the page. Strokes can have specific actions made available to them (such as 'move', 'rotate', 'increaseFontSize').

This library introduces several default brushes and stroke actions, but it also provides, most importantly, an API for hooking in custom brushes and stroke actions.

Oh yeah and it's framework agnostic/small and stuff.

## Installation Derp
  
    <script type="text/javascript" src="whiteboard.js"></script>
    <!-- define brushes in HTML somewhere before .init(), see below for brush explanation -->
    <script type="text/javascript">
      whiteboard.init();
    </script>

## Brushes

Brushes are hidden elements whose contents will be pasted into the DOM upon a new stroke.
They are the templates for future strokes and are defined purely in HTML.

#### Example Brush

    <div class="brush" data-brush-name="uml-class"> <!-- required: 'data-brush-name' -->
      <div class="stroke-content"> <!-- required: the primary graphical div should have this class -->
        <div class="uml-class">
          <div class="uml-class-header">
            <h3 class="whiteboard-actionable editable" data-action="editText" data-trigger="mousedown">Class Name</h3>
          </div>
          <div class="uml-class-attributes">
            <p class="whiteboard-actionable editable" data-action="editText" data-trigger="mousedown">
              - attribute1 <br />
              + attribute2
            </p>
          </div>
          <div class="uml-class-methods">
            <p class="whiteboard-actionable editable" data-action="editText" data-trigger="mousedown">
              - method1 <br />
              + method2
            </p>
          </div>
        </div>
      </div>
      <!-- optional: a stroke-controls div outside of stroke-content remains visually unaffected by content actions -->
      <div class="stroke-controls stroke-controls-top"> 
          <a href="#" class="whiteboard-actionable" data-action="move" data-trigger="mousedown">Drag Me</a>
      </div>
    </div>

Notice that there is a .stroke-content div and a .stroke-controls div. Because there is a 'focus' stroke-action that all strokes respond to, elements outside of the 'stroke-content' div will only be visible while the user has focused directly on that stroke. (not unlike most graphical editors)

It is standard for stroke actions to apply only to the stroke-content, so the stroke-controls can remain visually unaffected (such as for a rotate action).

Also, any element can have stroke actions (which are defined in javascript) applied to it by adding the 'whiteboard-actionable' class. When a new stroke is made with that brush, whiteboard will automatically add event handlers to that element, causing the 'data-action' function value to fire on the 'data-trigger' event.

Triggers will be standard DOM event names, while actions are POJOs containing functions defined in javascript under whiteboard.strokeActions. (see below)

## Stroke Actions

All stroke actions are invoked by calling the start function for the POJO defined under whiteboard.strokeActions['myAction']. 

The start function is responsible for setting up the action and registering events to process the ongoing action and/or finish it.

#### Example Stroke Action - move

    whiteboard.strokeActions.move = {

      start: function(event, content, stroke) {
        stroke.id = "whiteboard-beingMoved";
        whiteboard.addEvent(_htmlBaseTag, 'mousemove', whiteboard.strokeActions.move.continue);
        whiteboard.addEvent(_htmlBaseTag, 'mouseup', whiteboard.strokeActions.move.finish);
      },

      continue: function(event) {
        var movingElement = document.getElementById('whiteboard-beingMoved');
        movingElement.style.top = _mouseY - movingElement.clientHeight + 10;
        movingElement.style.left = _mouseX;
      },

      finish: function(event) {
        document.getElementById('whiteboard-beingMoved').id = "";
        whiteboard.removeEvent(_htmlBaseTag, 'mouseup', whiteboard.strokeActions.move.finish);
        whiteboard.removeEvent(_htmlBaseTag, 'mousemove', whiteboard.strokeActions.move.continue);
      }

    }
  
At some point, this really should use the HTML5 draggable api.

## Design Notes

Although there is a little bit of OO with regard to brushes, a functional approach to handling StrokeActions made the most sense after some toying around. Two steps down the prototypal path quickly revealed a wasteland of boilerplate code that this approach does a good job of avoiding. 

While still in alpha, design thoughts/recommendations are absolutely welcome, as long as there is evidence/logic behind recommendations.

## License

MIT. See [LICENSE](LICENSE.txt)





