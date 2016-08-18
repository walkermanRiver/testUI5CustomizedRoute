sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/core/routing/HashChanger','./Route', './RouteViews', './Targets', 'sap/ui/thirdparty/crossroads'],
	function(jQuery, EventProvider, HashChanger,Route, RouteViews, Targets, crossroads) {
	"use strict";
	
	var Router = EventProvider.extend("sap.ui.demo.nav.routing.Router",{
		constructor : function(aRoutes, oRouteConfig, oOwner, oTargetsConfig) {
			
			var that = this;
			
			EventProvider.apply(this);
			
			if (!aRoutes) {
				aRoutes = {};
			}

			this._oRouteConfig = oRouteConfig || {};
			this._oRouter = crossroads.create();
			this._oRouter.ignoreState = true;
			this._oRoutes = {};
			this._oOwner = oOwner;
			this._vComplexValue;
			
			var oRoutes = {};
			
			if (jQuery.isArray(aRoutes)) {
				//Convert route object				
				jQuery.each(aRoutes, function(iRouteIndex, oRouteConfig) {
					oRoutes[oRouteConfig.name] = oRouteConfig;
				});
			}else{
				oRoutes = aRoutes;
			}
			
			//add code here
			//end arrange code
			this._oRouteViews = new RouteViews({component : oOwner});
			if (oTargetsConfig) {
				this._oTargets = this._createTargets(this._oConfig, oTargetsConfig);
			}
			
			jQuery.each(oRoutes, function(sRouteName, oRouteConfig) {
				if (oRouteConfig.name === undefined) {
					oRouteConfig.name = sRouteName;
				}
				that.addRoute(oRouteConfig);
			});

			this._oRouter.bypassed.add(jQuery.proxy(this._onBypassed, this));
		},
		
		_arrangeRoute: function(oRoutes, oTargetsConfig){
			
			
			
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
			if (this._oRouter) {
				this._oRouter.parse(sNewHash);
			} else {
				jQuery.sap.log.warning("This router has been destroyed while the hash changed. No routing events where fired by the destroyed instance.", this);
			}
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
		},
		
		destroy: function(){
			EventProvider.prototype.destroy.apply(this);

			if (!this._bIsInitialized) {
				jQuery.sap.log.info("Router is not initialized, but got destroyed.", this);
			}

			if (this.fnHashChanged) {
				this.oHashChanger.detachEvent("hashChanged", this.fnHashChanged);
			}

			//will remove all the signals attached to the routes - all the routes will not be useable anymore
			this._oRouter.removeAllRoutes();
			this._oRouter = null;

			jQuery.each(this._oRoutes, function(iRouteIndex, oRoute) {
				oRoute.destroy();
			});
			this._oRoutes = null;
			this._oConfig = null;

			if (this._oTargets) {
				this._oTargets.destroy();
				this._oTargets = null;
			}

			this.bIsDestroyed = true;

			return this;
		},
		
		getURL : function (sRouteName, oParameters) {
			if (oParameters === undefined) {
				//even if there are only optional parameters crossroads cannot navigate with undefined
				oParameters = {};
			}

			var oRoute = this.getRoute(sRouteName);
			if (!oRoute) {
				jQuery.sap.log.warning("Route with name " + sName + " does not exist", this);
				return;
			}
			return oRoute.getURL(oParameters);
		},
		
		_createTargets : function (oConfig, oTargetsConfig) {
			return new Targets({
				routeViews: this._oRouteViews,
				config: oConfig,
				targets: oTargetsConfig
			});
		},
		
		navTo : function (sRouteName, oParameters, bReplace, oOptionalComplexValue) {
			var sURL = this.getURL(sRouteName, oParameters);
			this._vComplexValue = oOptionalComplexValue;

			if (sURL === undefined) {
				jQuery.sap.log.error("Can not navigate to route with name " + sName + " because the route does not exist");
			}

			if (bReplace) {
				this.oHashChanger.replaceHash(sURL);
			} else {
				this.oHashChanger.setHash(sURL);
			}

			return this;
		},
		
		attachRouteMatched : function(oData, fnFunction, oListener) {
			this.attachEvent("routeMatched", oData, fnFunction, oListener);
			return this;
		},
		
		detachRouteMatched : function(fnFunction, oListener) {
			this.detachEvent("routeMatched", fnFunction, oListener);
			return this;
		},
		
		fireRouteMatched : function(mArguments) {
			this.fireEvent("routeMatched", mArguments);
			return this;
		},
		
		attachViewCreated : function(oData, fnFunction, oListener) {
			this.attachEvent("viewCreated", oData, fnFunction, oListener);
			return this;
		},
		
		detachViewCreated : function(fnFunction, oListener) {
			this.detachEvent("viewCreated", fnFunction, oListener);
			return this;
		},
		
		fireViewCreated : function(mArguments) {
			this.fireEvent("viewCreated", mArguments);
			return this;
		},
		
		attachBypassed : function(oData, fnFunction, oListener) {
			return this.attachEvent(Router.M_EVENTS.Bypassed, oData, fnFunction, oListener);
		},
		
		detachBypassed : function(fnFunction, oListener) {
			return this.detachEvent(Router.M_EVENTS.Bypassed, fnFunction, oListener);
		},
		
		fireBypassed : function(mArguments) {
			return this.fireEvent(Router.M_EVENTS.Bypassed, mArguments);
		},
		
		_onBypassed : function (sHash) {
			var fnFireEvent = function() {
				this.fireBypassed({
					hash: sHash
				});
			}.bind(this);

			if (this._oConfig.bypassed) {
				// In sync case, oReturn is a Targets reference
				// In async case, it's a Promise instance
				var oReturn = this._oTargets.display(this._oConfig.bypassed.target, { hash : sHash});

				if (oReturn instanceof Promise) {
					// When Promise is returned, make sure the bypassed event is fired after the target view is loaded
					oReturn.then(fnFireEvent);
					return;
				}
			}

			fnFireEvent();
		},
	});
	
	Router.M_EVENTS = {
		RouteMatched : "routeMatched",
//			RoutePatternMatched : "routePatternMatched",
		ViewCreated : "viewCreated",
		Bypassed: "bypassed"
	};
	
	return Router;
});