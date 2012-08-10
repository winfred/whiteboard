/**
 * Cross browser removeClass method
 *
 * @param {String}
 * @return void
 * @api public
 */
HTMLElement.prototype.removeClass = HTMLElement.prototype.removeClass || function(className) {
  if (this.classList && this.classList.remove)
    return this.classList.remove(className);
  else
    return this.className = this.className.split(" "+className).join('');
};

/**
 * Cross browser addClass method
 *
 * @param {String}
 * @return void
 * @api public
 */
HTMLElement.prototype.addClass = HTMLElement.prototype.addClass || function(className){
  if(this.classList && this.classList.add) 
    return this.classList.add(className);
  else
    return this.className += " " + className;
};

/**
 * Cross browser hasClass check
 *
 * @param {String}
 * @return {boolean}
 * @api public
 */
HTMLElement.prototype.hasClass = HTMLElement.prototype.hasClass || function(className) {
  if (this.classList && this.classList.contains) {
    return this.classList.remove(className);
  } else {
    var classes = this.className.split(' ');
    for (var i = classes.length - 1; i >= 0; i--) {
      if (classes[i] === className) return true;
    };
    return false;
  }
};

/**
 * Cross browser method to apply a CSS3 transformation to an element
 *
 * @param {String}
 * @return void
 * @api public
 */
HTMLElement.prototype.applyCSSTransformation = HTMLElement.prototype.applyCSSTransformation || function(transformation) {
  if (this.style.webkitTransform != undefined)
    this.style.webkitTransform = transformation;

  else if (this.style.MozTransform != undefined)
    this.style.MozTransform = transformation;

  else if (this.style.OTransform != undefined)
    this.style.OTransform = transformation;

  else if (this.style.msTransform != undefined)
    this.style.msTransform = transformation;
};

/**
 * Checks to see if the element is contained in another of a certain class
 *
 * Because of the tree traversal, this is best used on nodes close to the root.
 *  (which is how we use it below)
 *
 * @param {string} className
 * @return {boolean}
 */
HTMLElement.prototype.isContainedInElementOfClass = HTMLElement.prototype.isContainedInElementOfClass || 
  function(className) {
    var probe = this;
    while (!probe.hasClass(className) && this !== document.getElementsByTagName('html')[0] && probe.parentElement) {
      probe = probe.parentElement;
    }
    if (probe.hasClass(className)) return true;
    else return false;
  };
