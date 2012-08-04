whiteboard.Stroke = (function(){

	var Stroke = {
		includedBy: function(stroke) {
			stroke.whiteboard = {};
			for (var fnName in Stroke.prototype) {
				stroke[fnName] = (function(stroke, fnName){
					return function() {
						return Stroke.prototype[fnName].apply(stroke, arguments);
					}
				})(stroke, fnName);
			}
		}
	};
	Stroke.prototype = {

		/**
		 * Update this stroke HTMLElement's standard attributes as well as
		 * the whiteboard attributes pojo.
		 *
		 * Supports deep nesting of attributes. That is to say, that calling 
		 *
		 * stroke.upateWhiteboardAttributes({
		 *   style: {
		 *		 color: 'FFF'
		 *	 }
		 * });
		 *
		 * Will *only* update the style.color attribute
		 *
		 * 
		 * @param {Object} - the attributes to update
		 * ------internal/recursive params-----------
		 * @param {Object} - an attribute subnode to traverse and call setters on
		 * @param {Object} - a whiteboard subnode to traverse and call setters on
		 * ------------------------------------------
		 * @return void
		 * @api public
		 */
		updateWhiteboardAttributes: function(opts, node, wbNode) {
			node = node || this;
			wbNode = wbNode || this.whiteboard;
			for (var opt in opts) {
				if (typeof opts[opt] === 'object') {
					wbNode[opt] = wbNode[opt] || {};
					this.updateWhiteboardAttributes(opts[opt], node[opt], wbNode[opt]);
				} else {
					wbNode[opt] = node[opt] = opts[opt];
				}
			}
		},

		/**
		 * A cross-browser outer html function
		 * @return {String}
		 * @api public
		 */
		whiteboardHTML: function() {
			return this.outerHTML || (function(node) {
				var div = document.createElement('div'), h;
				div.appendChild(node.cloneNode(true));
				h = div.innerHTML;
				div = null;
				return h;
			})(this);
		},

		/**
		 * Serialize the stroke for persistence
		 * Avoiding premature optimization by just storing the HTML for now.
		 * TODO: find a better way to serialize a stroke
		 *
		 * @return {Object}
		 * @api public
		 */
		serialize: function() {
			return {
				id: this.id,
				html: this.whiteboardHTML()
			}
		}
	};
	return Stroke;
})();
