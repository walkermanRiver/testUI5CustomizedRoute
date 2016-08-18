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
			that._aRoutes[0].matched.add(function() {
				var oArguments = {};
				$.each(arguments, function(iArgumentIndex, sArgument) {
					oArguments[that._aRoutes[0]._paramsIds[iArgumentIndex]] = sArgument;
				});
				that._routeMatched(oArguments, true);
			});			
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
		
		_convertToTargetOptions: function (oOptions) {
			return $.extend(true,
				{},
				oOptions,
				{
					rootView: oOptions.targetParent,
					controlId: oOptions.targetControl,
					controlAggregation: oOptions.targetAggregation,
					clearControlAggregation: oOptions.clearTarget,
					viewName: oOptions.view,
					// no rename here
					viewType: oOptions.viewType,
					viewId: oOptions.viewId
				});
		},
		
		_convertArgumentsPara: function(oArguments){
			
			var oNewArguments = {};
			
			for(sArgument in oArguments){
				if (oArguments.hasOwnProperty(sArgument)) {
					var sType = typeof(oArguments[sArgument]);
					switch(sType){
					case "object":
						for(sQueryArgument in oArguments[sArgument]){
							if(oArguments[sArgument].hasOwnProperty(sQueryArgument)){
								oNewArguments[sQueryArgument] = oArguments[sArgument][sQueryArgument];
							}
						}
						break;
					case "string":
						oNewArguments[sArgument] = oArguments[sArgument];
						break;
					default:
						jQuery.sap.log.error("fail to analyze the route argument data type", this);
					}
				}
			}
			
			return oNewArguments;
		},
		
		//oRouteInstancePara = {self:{aKeyName: [k1, k2],oKeyValue:{k1:value1, k2: value2}},p1:{aKeyName: [k1, k2],oKeyValue:{k1:value1, k2: value2}}}
		_convertInstanceCachePara: function(oParameter){
			var oRouteInstancePara = {};
			var oCacheKey = this._oRouteConfig.cacheKey;
			if(!oCacheKey){
				return oRouteInstancePara;
			}
			
			for (sTarget in oCacheKey) {
				if (oCacheKey.hasOwnProperty(sTarget)) {
					oRouteInstancePara[sTarget] = {aKeyName:[],oKeyValue:{}, parent: null};
					for(sKey in oCacheKey[sTarget]["key"]){
						if (oCacheKey[sTarget]["key"].hasOwnProperty(sKey)) {
							oRouteInstancePara[sTarget]["aKeyName"].push(sKey);
							var sKeyValue = oCacheKey[sTarget]["key"][sKey];
							if(sKeyValue.substr(0,1) == '{'){
								nLength = sKeyValue.length - 2;
								sKeyValue = sKeyValue.substr(1,nLength);
								sKeyValue = oParameter[sKeyValue];
							}							
							oRouteInstancePara[sTarget]["oKeyValue"][sKey] = sKeyValue;
							
							
							
							
						}						
					}
					
					var oConfigParent = oCacheKey[sTarget].parent;
					var sCurTargetName = this._oRouteConfig.name;
					var oIndexInstancePara = oRouteInstancePara[sTarget];
					
					for(;oConfigParent;){
						var oCurTarget = this._oRouter._oTargets.getTarget(sCurTargetName);
						var sParentTargetName = oCurTarget._oParent._oOptions.name;
						oIndexInstancePara["parent"] = {aKeyName:[],oKeyValue:{}, parent: null};
						oIndexInstancePara["parent"]["aKeyName"] = oConfigParent.key;
						
						for(sKey in oConfigParent["key"]){
							if (oConfigParent["key"].hasOwnProperty(sKey)) {
								oIndexInstancePara["parent"]
							}
						}
						
						oIndexInstancePara["parent"]["oKeyValue"] = 
						
						
						
					}
				}
			}	
			
			return oRouteInstancePara;
			
		},
		
		
		
		_routeMatched: function(oArguments, bInital, oNestingChild) {
			var oRouter = this._oRouter,
			oParentPlaceInfo,
			oPlaceInfo,
			oTarget,
			oConfig,
			oEventData,
			oView = null,
			oTargetControl = null;
			oNewArguments = this._convertArgumentsPara(oArguments);

			// Recursively fire matched event and display views of this routes parents
			if (this._oParent) {
				oParentPlaceInfo = this._oParent._routeMatched(oArguments);
			} else if (this._oNestingParent) {
				// pass child for setting the flag in event parameter of parent
				this._oNestingParent._routeMatched(oArguments, false, this);
			}
	
			oConfig =  jQuery.extend({}, oRouter._oConfig, this._oConfig);
	
			oEventData = {
				name: oConfig.name,
				arguments: oArguments,
				config : oConfig
			};
	
			if (oNestingChild) {
				// setting the event parameter of nesting child
				oEventData.nestedRoute = oNestingChild;
			}
			
			//oRouteInstancePara = {self:{aKeyName: [k1, k2],oKey:{k1:value1, k2: value2}},p1:{aKeyName: [k1, k2],oKey:{k1:value1, k2: value2}}}
			var oRouteInstancePara = this._convertInstanceCachePara(oNewArguments);			
	
			// Route is defined without target in the config - use the internally created target to place the view
			if (this._oTarget) {
				oTarget = this._oTarget;
				// update the targets config so defaults are taken into account - since targets cannot be added in runtime they don't merge configs like routes do
				oTarget._oOptions = this._convertToTargetOptions(oConfig);
	
				// validate if it makes sense to display the target (Route does not have all params required) - no error logging will be done during validation
				if (oTarget._isValid(oParentPlaceInfo, false)) {
					oPlaceInfo = oTarget._place(oParentPlaceInfo);
				}
	
				oPlaceInfo = oPlaceInfo || {};
	
				oView = oPlaceInfo.oTargetParent;
				oTargetControl = oPlaceInfo.oTargetControl;
	
				// Extend the event data with view and targetControl
				oEventData.view = oView;
				oEventData.targetControl = oTargetControl;
			} else {
				// let targets do the placement + the events
				oRouter._oTargets._display(this._oConfig.target, oArguments, this._oRouteConfig.name, oRouteInstancePara);
			}
	
			if (oConfig.callback) {
				//Targets don't pass TargetControl and view since there might be multiple
				oConfig.callback(this, oArguments, oConfig, oTargetControl, oView);
			}
	
			this.fireEvent("matched", oEventData);
			oRouter.fireRouteMatched(oEventData);
	
			// skip this event in the recursion
			if (bInital) {
				jQuery.sap.log.info("The route named '" + oConfig.name + "' did match with its pattern", this);
				this.fireEvent("patternMatched", oEventData);
				oRouter.fireRoutePatternMatched(oEventData);
			}
	
			return oPlaceInfo;
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
