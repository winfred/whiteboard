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
