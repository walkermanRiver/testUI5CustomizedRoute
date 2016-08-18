sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', './RouteView','sap/ui/core/UIComponent', 'sap/ui/core/mvc/View'],
	function(jQuery, EventProvider, RouteView, UIComponent, View) {
		"use strict";
		
		var GCMaxCacheInstance = 20;
		
		var RouteViews = EventProvider.extend("sap.ui.demo.nav.routing.RouteViews", /** @lends sap.ui.core.routing.Views.prototype */ {

			//oOptions = {component : oOwner}
			constructor : function (oOptions) {
				if (!oOptions) {
					oOptions = {};
				}

//				{
//				"routeName1": 
//					[
//						{
//							"sViewName": "viewName1",
//							"type": "XML",
//							"AdditionalKey":["instanceId"],
//							"oParentRouteView": {},
//							"oRouteView"：{}
//						}
//					]
//				}
				this._oRouteViews = {};
				this._nCurrentViewCount = 0;

				this._oComponent = oOptions.component;
				if (this._oComponent) {
					jQuery.sap.assert(this._oComponent instanceof UIComponent, this + ' - the component passed to the constructor needs to be an instance of UIComponent');
				}

				EventProvider.apply(this, arguments);
			},

//			metadata : {
//				publicMethods: ["getView", "setView"]
//			},			
	
			//oOptions = oParentOptions = {sViewName:"value", type: "XML", optionalKey:{key1:value1,key2:value2}}			
//			getView : function (oOptions, oParentOptions) {
////				return this._getView(oOptions).loaded();
//			},
			
//			setView : function (sViewName, oView) {
//				this._checkViewName(sViewName);
//
//				this._oViews[sViewName] = oView;
//				return this;
//			},
			
			destroy : function () {
				var sProperty;

				EventProvider.prototype.destroy.apply(this);

				for (sRouteName in this._oRouteViews) {
					if (this._oRouteViews.hasOwnProperty(sRouteName) && this._oRouteViews[sRouteName]) {
						var aRouteView = this._oRouteViews[sRouteName];
						var nRouteViewCount = aRouteView.length;
						for(var i=0; i<nRouteViewCount; i++){
							aRouteView[i].destroy();
						}
					}
				}

				this._oRouteViews = undefined;
				this.bIsDestroyed = true;

				return this;
			},
			
			//TBD
			_shrinkView: function(){
//				var nViewCount = 0;
//				foreach(sRouteName in this._oRouteViews){
//					if (this._oRouteViews.hasOwnProperty(sRouteName) && this._oRouteViews[sRouteName]){
//						var nRouteViewCount = this._oRouteViews[sRouteName].length;
//						for(var i=0; i<nRouteViewCount; i++){
//							nViewCount = this._oRouteViews[sRouteName][i].
//						}
//					}
//				}
			},
			
			_compareRouteViewKey: function(oOptions, oIndexRouteView){				
				if(!oOptions && !oIndexRouteView){
					return true;
				}				
				if(!oOptions || !oIndexRouteView){
//					jQuery.sap.log.error("fail to compare route with initial object", this);
					return false;
				}				
				if(oIndexRouteView.sViewName != oOptions.sViewName){
					return false;
				}	
				if(oIndexRouteView.type != oOptions.type){
					jQuery.sap.log.error("the same view has different view type", this);
					return false;
				}
				if((!oOptions.aAdditionalKey || oOptions.aAdditionalKey.length <= 0) && 
				   (!oIndexRouteView.aAdditionalKey || oIndexRouteView.aAdditionalKey.length <= 0)){
					return true;					
				}else if( oOptions.aAdditionalKey && oIndexRouteView.aAdditionalKey && 
						( oOptions.aAdditionalKey.length == oIndexRouteView.aAdditionalKey.length) ){
					var nKeyCount = oOptions.aAdditionalKey.length;
					for(var i=0; i<nKeyCount; i++){
						var bFound = false;
						for(var j=0; j<nKeyCount; j++){
							if(oOptions.aAdditionalKey[i] == oIndexRouteView.aAdditionalKey[j]){
								bFound = true;
								break;
							}
						}						
						if(bFound == false){
							return false;
						}	
					}
					
				}else{
					return false;
				}
				
				return true;
				
			},

			//oParentRouteView: sap.ui.demo.nav.routing.RouteView
			//oOptions: {sRouteName:"routenamevalue", sViewName: "sap.ui.demo.nav.view.employee.overview.EmployeeOverview", type: "XML", id: undefined?, 
			// bCacheInstance: true,aAdditionalKey:["key1"] ,bAddPageContainer: true,nCacheTime: 100}
			//the key to identify one routeview is sRouteName,viewName,type, aAdditionalKey			
			_getRouteView: function(oOptions, oParentRouteView){
				if(!oOptions.sRouteName){
					jQuery.sap.log.error("the oOptions parameter sRouteName of _getRouteView is mandatory", this);
				}
				
				var aRouteView = this._oRouteViews[oOptions.sRouteName] = this._oRouteViews[oOptions.sRouteName] || [];	
				var nRouteViewCount = aRouteView.length;				
				for(var i=0; i<nRouteViewCount; i++){
					var oIndexRouteView = aRouteView[i];
					if(this._compareRouteViewKey(oOptions,oIndexRouteView) && this._compareRouteViewKey(oParentRouteView,oIndexRouteView.oParentRouteView )){
						return oIndexRouteView;
					}
				}				
				//no route is found, then create one new routeView
				var oRouteView = new RouteView({
					sViewName: oOptions.sViewName,
					type: oOptions.type,
					aAdditionalKey: oOptions.aAdditionalKey,
					id: oOptions.id,
					bCacheInstance: oOptions.bCacheInstance,					
					bAddPageContainer: oOptions.bAddPageContainer,
					nCacheTime: oOptions.nCacheTime
				},this);
				
				aRouteView.push({
					sViewName:oOptions.sViewName,
					type:oOptions.type,
					aAdditionalKey: oOptions.aAdditionalKey,
					oParentRouteView: oParentRouteView,
					oRouteView: oRouteView
				});
				
				return oRouteView;
				
			},

			_getViewInstace: function(oInstanceKey, oRouteView){
				return oRouteView.getViewWithInstanceKey(oInstanceKey);
			},
			
			//UI5 example: oOptions = {viewName: "sap.ui.demo.nav.view.employee.overview.EmployeeOverview", type: "XML", id: undefined}			
			_getView: function (oOptions,oParentRouteView,oInstanceKey) {			
				
				return this._getViewInstace(oInstanceKey, this._getRouteView(oOptions,oParentRouteView));
				
//				if (this._oComponent && oOptions.id) {
//					oOptions = jQuery.extend({}, oOptions, { id : this._oComponent.createId(oOptions.id) });
//				}
//
//				return this._getViewWithGlobalId(oOptions);
			},
			
//			_getViewWithGlobalId : function (oOptions) {
//				function fnCreateView() {
//					return sap.ui.view(oOptions);
//				}
//
//				if (!oOptions) {
//					jQuery.sap.log.error("the oOptions parameter of getView is mandatory", this);
//				}
//
//				var oView,
//					sViewName = oOptions.viewName;
//				
//				oView = this._oViews[sViewName];
//
//				if (oView) {
//					return oView;
//				}
//
//				if (this._oComponent) {
//					oView = this._oComponent.runAsOwner(fnCreateView);
//				} else {
//					oView = fnCreateView();
//				}
//
//				this._oViews[sViewName] = oView;
//
//				this.fireCreated({
//					view: oView,
//					viewOptions: oOptions
//				});
//
//				return oView;
//			}
			
		});

		return RouteViews;

});
