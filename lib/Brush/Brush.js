/**
 * A Brush knows its template and name, and it can paint new strokes 
 *    (copies of the template) onto the DOM
 *
 * @attribute {Element} element - a stroke template
 * @attribute {string} name 
 */
whiteboard.Brush = (function(_){

	var Brush = function(template, name){
		this.template = template;
		this.name = name;
		var onpaint = template.attributes.getNamedItem('data-onpaint');
		if (onpaint)
			this.onpaint = onpaint.value.split(', ');
	};

	/**
	 * Paint a new copy of a brush's template onto the DOM
	 * @returns void
	 */
	Brush.prototype.paintStroke = function() {
		var stroke = document.createElement('div');
		stroke.innerHTML = this.template.innerHTML;
		stroke.style.position = 'absolute';
		stroke.className = "stroke";
		stroke.style.top = _.mouseY + "px";
		stroke.style.left = _.mouseX + "px";

		_.htmlTag.appendChild(stroke);

		//always focus a stroke on paint
		_.StrokeAction.focus.invoke({currentTarget: stroke, target: stroke});

		//trigger any onpaint events
		if (this.onpaint) {
			var action;
			for (var i = this.onpaint.length - 1; i >= 0; i--) {
				action = this.onpaint[i];

				//firing traditional actions as well?
				if (_.StrokeAction[action])
					_.StrokeAction[action].invoke();

				//do we even need the onpaint specific actions?
				if (false && _.StrokeAction.onpaint[action])
					_.StrokeAction.onpaint[action](stroke);
			};
		}

		_initializeStrokeActionEventListeners(stroke); 
	};

	/**
	 * Bind all of a stroke's whiteboard-actionable events to their elements
	 *
	 * @param {Element} stroke
	 * @returns void
	 */
	function _initializeStrokeActionEventListeners(stroke) {
      var actionableElement, action, trigger, i,
      actions = stroke.getElementsByClassName('whiteboard-actionable');

      for (i = actions.length - 1; i >= 0; i--) {
        actionableElement = actions[i];

        //supress all actionable ondragstarts - rage against ondragstart (for now)
        actionableElement.ondragstart = function(){return false;};

        action = actionableElement.attributes.getNamedItem('data-action').value;
        trigger = actionableElement.attributes.getNamedItem('data-trigger').value;
        _.addEvent(actionableElement, trigger, _invokeStrokeEvent);
      }

      //all strokes respond to the focus action
      _.addEvent(stroke, 'mousedown', _.StrokeAction.focus.invoke);

    }

    /**
     * Fire a stroke action's function for a specific event
     *
     * @param {Event} event
     * @returns void
     */
    function _invokeStrokeEvent (event) {
      var stroke = _strokeForElement(event.target),
          action = event.currentTarget.attributes.getNamedItem('data-action').value,
          content = stroke.getElementsByClassName('stroke-content')[0];

      //before filters? listners to notify?
      _.StrokeAction[action].invoke(event, content, stroke);
    };

    /**
     * Get the parent stroke container for a given actionable element
     * 
     * @param {Element} element
     * @returns {Element} stroke
     * @throws {StrokeMissingException} 
     */
    function _strokeForElement(element) {
      var probe = element;
      while (!probe.hasClass('stroke') && probe !== _.htmlTag)
        probe = probe.parentElement;

      if (probe.hasClass('stroke'))
        return probe;
      else throw new Error({
        name: "StrokeMissingException",
        message: "This element does not live inside a stroke.", 
        element: element
      });
    };

    return Brush;
  })(whiteboard);
