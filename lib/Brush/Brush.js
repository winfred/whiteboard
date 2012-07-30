/**
 * Expose the Brush module
 */
whiteboard.Brush = (function(_){

  var _brushes = {},
  /**
   * A Brush knows its template and name, and it can paint new strokes 
   *    (copies of the template) onto the DOM
   *
   * It's basically a stroke factory
   *
   * @attribute {Element} element - a stroke template
   * @attribute {string} name 
   */
  Brush = function(template, name){
    this.template = template;
    this.name = name;
    var onpaint = template.attributes.getNamedItem('data-onpaint');
    if (onpaint)
      this.onpaint = onpaint.value.split(', ');
  };

  /**
   * ------------------------------
   * Module Variables/Methods
   * ------------------------------
   */

  Brush.active = null;

  /**
   * Find all brushes and their tool-buttons in the DOM
   *   Register brushes with whiteboard global
   *   Set tool-button click handlers
   *   
   * @return void
   * @api public
   */
  Brush.initializeBrushes = function() {
    var brushes = document.getElementsByClassName('brush'),
        brushButtons = document.getElementsByClassName('tool');

    for (var i = 0; i < brushes.length; i++)
      Brush.add(brushes[i]);

    for (var i = 0; i < brushButtons.length; i++)
      _.addEvent(brushButtons[i], 'click', _setActiveBrush);

    _.addEvent(document, 'mousedown', function(e){
      if (_shouldPaintStroke(e))
        _paintStroke(e);
    });

  };

  /**
   * register a new brush type
   * should be a DOM element with which the contents will be used to paint
   * see HTML data-attribute API reference
   *
   * @param {Element} element
   * @returns {whiteboard}
  */
  Brush.add = function(element) {
    var name = element.attributes.getNamedItem('data-brush-name').value;
    _brushes[name] = new Brush(element, name);
    return this;
  };

  /**
   * Get a known singleton brush object by name
   *
   * @param {string} name
   * @returns {Brush}
   */
  Brush.get = function(name) {
    return _brushes[name];
  };


  /**
   * ----------------
   * Instance Methods
   * ----------------
   */

  /**
   * Paint a new copy of a brush's template onto the DOM
   * Initialize all DOM listeners for strokeActions on the stroke.
   *
   * @returns void
   */
  Brush.prototype.paintStroke = function(stroke) {
    if (!stroke) {
      stroke = this.createStroke();
    } else {
      _.htmlTag.appendChild(stroke);
    }


    //TODO: trigger any onpaint events?

    _initializeStrokeActionEventListeners(stroke); 
    _.emit("Brush."+ name + ".paintStroke", {brush: this, stroke: stroke});
  };

  /**
   * Initialize a new HTMLElement(stroke) 
   *  append it to the DOM
   *  and set it as the focused stroke
   * 
   * @return {HTMLElement}
   * @api public
   */
  Brush.prototype.createStroke = function() {
      var stroke = document.createElement('div');
      stroke.innerHTML = this.template.innerHTML;
      stroke.style.position = 'absolute';
      stroke.className = "stroke";
      stroke.style.top = _.mouseY + "px";
      stroke.style.left = _.mouseX + "px";

      _.htmlTag.appendChild(stroke);
      _.StrokeAction.focus.invoke({currentTarget: stroke, target: stroke});      
      return stroke;
  };

  /**
   * ---------------
   * Private Methods
   * ---------------
   */

  
  /**
   * Get the brush corresponding to a tool's click event target
   * 
   * @param {Event} e
   * @returns {Brush}
   */
  function _brushFromEvent(e) {
    var name = e.currentTarget.attributes.getNamedItem('data-brush-name').value;
    return _brushes[name];
  };
  
  /**
   *  Set the active brush using a tool's click event
   *
   *  @param {Event} e
   *  @return {Brush}
   *  @api private
   */
  function _setActiveBrush(e) {
    if (e.preventDefault) e.preventDefault();  
    Brush.active = _brushFromEvent(e);
    return Brush;
  };

    /**
   * Determine if the event deserves a brush stroke
   *
   * @param {Event} e
   * @return {boolean}
   * @api private
   */
  function _shouldPaintStroke(e) {
    return Brush.active && !e.defaultPrevented &&
        !e.target.isContainedInElementOfClass('stroke') && 
        !e.target.isContainedInElementOfClass('toolbox');
  };

  /**
   *  Paint a stroke with the active brush. 
   *  Handles key-binds for composition
   *
   *  preconditions:: Brush.active != null
   *      Use _shouldPaintStroke to be sure
   *
   *  @param {Event} e
   *  @returns {Brush}
   *  @api private
   */
  function _paintStroke(e) {
    Brush.active.paintStroke();
    if (!e.shiftKey) 
      Brush.active = null;

    return Brush;
  };

  
  /**
   * Bind all of a stroke's whiteboard-actionable events to their elements
   *
   * @param {Element} stroke
   * @returns void
   * @api private
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
     * @api private
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
     * @api private
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
