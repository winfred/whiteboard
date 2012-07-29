/**
 * Make a specific element editable and listen for the user to be done editing
 */
whiteboard.StrokeAction.editText = (function(_ ,$){
  return $.extend('editText', {
    invoke: function(event) {
        var editableText = event.target;
        editableText.contentEditable = "true";
        editableText.id = "whiteboard-beingEdited"

        _.addEvent(editableText, 'keydown', $.editText.complete);
        $.enableDocumentClickCatching($.editText.complete);
    },

    complete: function(event) {
      if (!event.target.isContainedInElementOfClass('editable')) {
        var editableText = document.getElementById('whiteboard-beingEdited');
        editableText.contentEditable = "false";
        editableText.id = "";

        _.removeEvent(editableText, 'keydown', $.editText.complete);
        $.disableDocumentClickCatching($.editText.complete);
      }
    }
  });
})(whiteboard, whiteboard.StrokeAction);
