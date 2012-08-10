/**
 * Apply CSS3 rotate transformations to the stroke while handler is held down
 */
whiteboard.StrokeAction.rotate = (function(_,$){
  
    /**
     * Given a number, provide its rotation grid locked value
     * 
     * @param {number}
     * @returns {number}
     */
    function _rotationGridLock(number) {
      //there has to be a more clever way to do this with modulo 45
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
    };

    /** 
     * Determine if a number should be reset to its grid value
     *
     * @param {number}
     * @returns {boolean}
     */
    function _numberIsWithinGridlock(number) {
      return Math.abs(number) < 5 && Math.abs(number) > -5;
    };


    return $.extend('rotate', {

      invoke: function(event, content) {
        this.target = $.strokeForElement(event.target);

        _.addEvent(_.container, 'mousemove', this.process);
        _.addEvent(_.container, 'mouseup', this.commit);
      },

      process: function(event) {
        var strokeContent = this.target.getElementsByClassName('stroke-content')[0],
            rotation = strokeContent.attributes.getNamedItem('data-rotation');

        if (!rotation) {
          rotation = document.createAttribute('data-rotation');
          rotation.nodeValue = 0;
        }

        var degrees = _rotationGridLock(Number(rotation.value) - _.deltaX) % 360;

        rotation.nodeValue = degrees;
        strokeContent.attributes.setNamedItem(rotation);

        strokeContent.applyCSSTransformation("rotate(" + degrees + "deg)");
      },

      commit: function(event) {
        _.removeEvent(_.container, 'mousemove', this.process);
        _.removeEvent(_.container, 'mouseup', this.commit);
      }
    });
})(whiteboard, whiteboard.StrokeAction);
