sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/core/routing/HashChanger','./Route', './Views', './Targets', 'sap/ui/thirdparty/crossroads'],
	function(jQuery, EventProvider, HashChanger,Route, Views, Targets, crossroads) {
	"use strict";
	
	var Router = EventProvider.extend("sap.ui.demo.nav.routing.Router",{
		constructor : function(aRoutes, oRouteConfig, oOwner, aTargetsConfig) {
			
			var that = this;
			
			EventProvider.apply(this);
			
			if (!aRoutes) {
				aRoutes = {};
			}

			this._oConfig = oConfig || {};
			this._oRouter = crossroads.create();
			this._oRouter.ignoreState = true;
			this._oRoutes = {};
			this._oOwner = oOwner;
			
			
			var oRoutes = {};
			
			if (jQuery.isArray(aRoutes)) {
				//Convert route object				
				jQuery.each(aRoutes, function(iRouteIndex, oRouteConfig) {
					oRoutes[oRouteConfig.name] = oRouteConfig;
				});
			}else{
				oRoutes = aRoutes;
			}
			
			jQuery.each(oRoutes, function(sRouteName, oRouteConfig) {
				if (oRouteConfig.name === undefined) {
					oRouteConfig.name = sRouteName;
				}
				that.addRoute(oRouteConfig);
			});

			this._oRouter.bypassed.add(jQuery.proxy(this._onBypassed, this));
		},
		
		addRoute : function (oConfig, oParent) {
			if (!oConfig.name) {
				jQuery.sap.log.error("A name has to be specified for every route", this);
			}

			if (this._oRoutes[oConfig.name]) {
				jQuery.sap.log.error("Route with name " + oConfig.name + " already exists", this);
			}
			this._oRoutes[oConfig.name] = new Route(this, oConfig, oParent);
		},
		
		parse : function (sNewHash, sOldHash) {
			jQuery.sap.log.warning("The URL hash has been changed to " + sNewHash, this);		
			jQuery.sap.log.warning("The URL original hash is " + sOldHash, this);		
		},
		
		initialize : function () {
			var that = this,
			oHashChanger = this.oHashChanger = HashChanger.getInstance();

			if (this._bIsInitialized) {
				jQuery.sap.log.warning("Router is already initialized.", this);
				return this;
			}
	
			this._bIsInitialized = true;
	
			this.fnHashChanged = function(oEvent) {
				that.parse(oEvent.getParameter("newHash"), oEvent.getParameter("oldHash"));
			};
	
			if (!oHashChanger) {
				jQuery.sap.log.error("navTo of the router is called before the router is initialized. If you want to replace the current hash before you initialize the router you may use getUrl and use replaceHash of the Hashchanger.", this);
				return;
			}
	
			oHashChanger.attachEvent("hashChanged", this.fnHashChanged);
	
			if (!oHashChanger.init()) {
				this.parse(oHashChanger.getHash());
			}
	
			return this;
		}
	});
	return Router;
});