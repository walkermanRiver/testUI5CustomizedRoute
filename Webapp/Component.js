sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/demo/nav/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.nav.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);			
	
			var oRoutingManifestEntry = this.getMetadata().getManifestEntry("/sap.ui5/routing", true);
			var oRouteConfig = oRoutingManifestEntry.config || {};
			var aRoutes = oRoutingManifestEntry.routes;
			
			this.customizedRouter = new Router(aRoutes, oRouteConfig, this, oRoutingManifestEntry.targets);
			this.customizedRouter.initialize();
			
			// create the views based on the url/hash
			this.getRouter().initialize();
		}

	});

});
