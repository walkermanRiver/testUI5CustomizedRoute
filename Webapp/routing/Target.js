sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider'],
	function(jQuery, EventProvider) {
		"use strict";
		
		var Target = EventProvider.extend("sap.ui.demo.nav.routing.Target", /** @lends sap.ui.core.routing.Target.prototype */ {

			constructor : function(oOptions, oViews) {	
				this._oOptions = oOptions;
				this._oViews = oViews;
				EventProvider.apply(this, arguments);				
			},
			
			destroy : function () {
				this._oParent = null;
				this._oOptions = null;
				this._oViews = null;
				EventProvider.prototype.destroy.apply(this, arguments);
				this.bIsDestroyed = true;

				return this;
			}
			
		});

		return Target;
		
});	