sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider'],
	function(jQuery, EventProvider) {
		"use strict";
		
		var Target = EventProvider.extend("sap.ui.demo.nav.routing.Target", {

			constructor : function(oOptions, oRouteViews) {	
				this._oOptions = oOptions;
				this._oRouteViews = oRouteViews;
				this._aRouteView = null;
				EventProvider.apply(this, arguments);				
			},
			
			destroy : function () {
				this._oParent = null;
				this._oOptions = null;
				this._oRouteViews = null;
				this._oCurrentRouteView = null;
				EventProvider.prototype.destroy.apply(this, arguments);
				this.bIsDestroyed = true;

				return this;
			},
			
			//vRouteInstancePara/unit: {targetName1:{aKeyName,oKeyValue,parent}}
			////{aKeyName,oKeyValue,parent}
			display : function (vData, sRouteName, vRouteInstancePara) {
				var oParentInfo;

				if (this._oParent) {
					var vParentRouteInstancePara = vRouteInstancePara ? vRouteInstancePara.parent : null;
					oParentInfo = this._oParent.display(vData, sRouteName, vParentRouteInstancePara);
				}

				return this._place(oParentInfo, vData, sRouteName, vRouteInstancePara);
			},
			
			
			
			//vRouteInstancePara: {aKeyName,oKeyValue,parent}
			_place : function (oParentInfo, vData, sRouteName, vRouteInstancePara) {
				var oOptions = this._oOptions;
				oParentInfo = oParentInfo || {};

				var oView,
					oControl = oParentInfo.oTargetControl,
					oViewContainingTheControl = oParentInfo.oTargetParent;

				// validate config and log errors if necessary
				if (!this._isValid(oParentInfo, true)) {
					return;
				}

				//no parent view - see if there is a targetParent in the config
				if (!oViewContainingTheControl && oOptions.rootView) {
					oViewContainingTheControl = sap.ui.getCore().byId(oOptions.rootView);

					if (!oViewContainingTheControl) {
						jQuery.sap.log.error("Did not find the root view with the id " + oOptions.rootView, this);
						return;
					}
				}

				// Find the control in the parent
				if (oOptions.controlId) {

					if (oViewContainingTheControl) {
						//controlId was specified - ask the parents view for it
						oControl = oViewContainingTheControl.byId(oOptions.controlId);
					}

					if (!oControl) {
						//Test if control exists in core (without prefix) since it was not found in the parent or root view
						oControl =  sap.ui.getCore().byId(oOptions.controlId);
					}

					if (!oControl) {
						jQuery.sap.log.error("Control with ID " + oOptions.controlId + " could not be found", this);
						return;
					}

				}

				var oAggregationInfo = oControl.getMetadata().getJSONKeys()[oOptions.controlAggregation];

				if (!oAggregationInfo) {
					jQuery.sap.log.error("Control " + oOptions.controlId + " does not have an aggregation called " + oOptions.controlAggregation, this);
					return;
				}

				//Set view for content
				var sViewName = this._getEffectiveViewName(oOptions.viewName);

				var oViewOptions = {
					viewName : sViewName,
					type : oOptions.viewType,
					id : oOptions.viewId,
					bCacheInstance: oOptions.cacheInstance,
					aAdditionalKey: vRouteInstancePara.aKeyName,
					bAddPageContainer:oOptions.addPageContainer,
					nCacheTime: oOptions.cacheTime
				};
				
				var oParentRouteView = this._oParent ? this._oParent._oCurrentRouteView : null;
				var oInstanceKey = vRouteInstancePara ? vRouteInstancePara.oKeyValue : null;
				
				this._oCurrentRouteView = this._oRouteViews._getRouteView(oViewOptions,oParentRouteView);
				oView = this._oCurrentRouteView.getViewWithInstanceKey(oInstanceKey);
				
				//oOptions = {sViewName:"value", type: "XML", optionalKey:{key1:value1,key2:value2}}
//				oView = this._oRouteViews._getView(oViewOptions,oParentRouteView,oInstanceKey);

//				// Hook in the route for deprecated global view id, it has to be supported to stay compatible
//				if (this._bUseRawViewId) {
//					oView = this._oRouteViews._getViewWithGlobalId(oViewOptions);
//				} else {
//					// Target way of getting the view
//					oView = this._oRouteViews._getView(oViewOptions);
//				}

				if (oOptions.clearControlAggregation === true) {
					oControl[oAggregationInfo._sRemoveAllMutator]();
				}

				jQuery.sap.log.info("Did place the view '" + sViewName + "' with the id '" + oView.getId() + "' into the aggregation '" + oOptions.controlAggregation + "' of a control with the id '" + oControl.getId() + "'", this);
				oControl[oAggregationInfo._sMutator](oView);

				this.fireDisplay({
					view : oView,
					control : oControl,
					config : this._oOptions,
					data: vData
				});

				return {
					oTargetParent : oView,
					oTargetControl : oControl
				};
			},
			
			_isValid : function (oParentInfo, bLog) {
				var oOptions = this._oOptions,
					oControl = oParentInfo && oParentInfo.oTargetControl,
					bHasTargetControl = (oControl || oOptions.controlId),
					bIsValid = true,
					sLogMessage = "";

				if (!bHasTargetControl) {
					sLogMessage = "The target " + oOptions.name + " has no controlId set and no parent so the target cannot be displayed.";
					bIsValid = false;
				}

				if (!oOptions.controlAggregation) {
					sLogMessage = "The target " + oOptions.name + " has a control id or a parent but no 'controlAggregation' was set, so the target could not be displayed.";
					bIsValid = false;
				}

				if (!oOptions.viewName) {
					sLogMessage = "The target " + oOptions.name + " no viewName defined.";
					bIsValid = false;
				}

				if (bLog && sLogMessage) {
					jQuery.sap.log.error(sLogMessage, this);
				}

				return bIsValid;
			},
			
			attachDisplay : function(oData, fnFunction, oListener) {
				return this.attachEvent(this.M_EVENTS.DISPLAY, oData, fnFunction, oListener);
			},
			
			detachDisplay : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.DISPLAY, fnFunction, oListener);
			},
			
			fireDisplay : function(mArguments) {
				return this.fireEvent(this.M_EVENTS.DISPLAY, mArguments);
			},
			
			_getEffectiveViewName : function (sViewName) {
				var sViewPath = this._oOptions.viewPath;

				if (sViewPath) {
					sViewName = sViewPath + "." + sViewName;
				}

				return sViewName;
			},
			
			M_EVENTS : {
				DISPLAY : "display"
			}
			
		});

		return Target;
		
});	