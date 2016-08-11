sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/core/routing/Target', 'sap/ui/core/Component'],
	function($, EventProvider, Target, Component) {
	"use strict";
	
	var Route = EventProvider.extend("sap.ui.core.routing.Route", {
		
		metadata : {
			publicMethods: ["getURL", "getPattern"]
		},

		constructor : function(oRouter, oRouteConfig, oParent) {
			EventProvider.apply(this, arguments);

			if (!oRouteConfig.name) {
				$.sap.log.error("A name has to be specified for every route", this);
			}

			this._aPattern = [];
			this._aRoutes = [];
			this._oParent = oParent;
			this._oRouteConfig = oRouteConfig;
			this._oRouter = oRouter;

			var that = this,
				sPattern = oRouteConfig.pattern;	

			if (!oRouteConfig.target) {				
				// create a new target for this route
				this._oTarget = new Target(oRouteConfig, oRouter._oViews, oParent && oParent._oTarget);				
			}			

			if (oRouteConfig.pattern === undefined) {
				//this route has no pattern - it will not get a matched handler. Or a crossroads route
				return;
			}			

			that._aPattern[0] = sPattern;
			that._aRoutes[0] = oRouter._oRouter.addRoute(sPattern);
			that._aRoutes[0].greedy = oRouteConfig.greedy;
			that._routeMatched(oArguments, true);
			
		},
		
		destroy : function () {
			EventProvider.prototype.destroy.apply(this);

			this._aPattern = null;
			this._aRoutes = null;
			this._oParent = null;
			this._oRouteConfig = null;

			this.bIsDestroyed = true;

			return this;
		},
		
		getURL : function (oParameters) {
			return this._aRoutes[0].interpolate(oParameters);
		},
		
		getPattern : function() {
			return this._aPattern[0];
		},
		
		attachMatched : function(oData, fnFunction, oListener) {
			return this.attachEvent("matched", oData, fnFunction, oListener);
		},
		
		detachMatched : function(fnFunction, oListener) {
			return this.detachEvent("matched", fnFunction, oListener);
		},
		
		attachPatternMatched : function(oData, fnFunction, oListener) {
			return this.attachEvent("patternMatched", oData, fnFunction, oListener);
		},
		
		detachPatternMatched : function(fnFunction, oListener) {
			return this.detachEvent("patternMatched", fnFunction, oListener);
		}
		
	});


	Route.M_EVENTS = {
		Matched : "matched",
		PatternMatched : "patternMatched"
	};

	return Route;
	
});
