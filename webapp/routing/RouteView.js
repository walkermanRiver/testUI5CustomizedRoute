sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider'],
	function(jQuery, EventProvider) {
		"use strict";
		
		var RouteView = EventProvider.extend("sap.ui.demo.nav.routing.RouteView", {

			//UI5: oOptions = {viewName: "sap.ui.demo.nav.view.employee.overview.EmployeeOverview", type: "XML", id: undefined}
			//BPC: oOptions = {viewName: "sap.ui.demo.nav.view.employee.overview.EmployeeOverview", type: "XML", id: undefined?, 
			// bCacheInstance: true,aAdditionalKey:["key1"] ,bAddPageContainer: true,nCacheTime: 100}
			constructor : function(oOptions) {	
				this._oOptions = oOptions;		
				this._sViewName = oOptions.sViewName;
				this._type = oOptions.type;
				this._id = oOptions.id;
				this._aAdditionalKey = oOptions.aAdditionalKey;
				this._bCacheInstance = oOptions.bCacheInstance;				
				this._bAddPageContainer = oOptions.bAddPageContainer;
				this._nCacheTime = oOptions.nCacheTime;
//				[
//					{
//						"oRouteKey": {}
//						"createTimestamp":1223234343,
//						"view"：{}
//					}
//				]
				this._aViews = [];
				EventProvider.apply(this, arguments);				
			},
			
			destroy : function () {				
				this._oOptions = null;						
				var nViewCount = this._aViews.length;
				for(var i=0; i<nViewCount; i++){
					this._aViews[i].view.destroy();
				}
				this._aViews = [];
				
				EventProvider.prototype.destroy.apply(this, arguments);
				this.bIsDestroyed = true;

				return this;
			},	
			
			//option = {viewName: "sap.ui.demo.nav.view.employee.overview.EmployeeOverview", type: "XML", id: undefined}
			_createView: function(oOptions){				
				var oContentView;				
				if(this._bAddPageContainer){
					oContentView =  new sap.m.Page({
						content: sap.ui.view(oOptions)
					});
				}else{
					oContentView = sap.ui.view(oOptions);
				}				
				return oContentView;
			},
			
			_compareKey: function(oInstanceKey, oIndexKey){				
				for (sKey in oInstanceKey) {
					if (oInstanceKey.hasOwnProperty(sKey) && oInstanceKey[sKey] != oIndexKey[sKey] ) {
						return false;
					}
				}				
				return true;
			},
			
			//optionalKey:{key1:value1,key2:value2}
			getViewWithInstanceKey: function(oInstanceKey){				
				var oView = null;
				var nViewCount = this._aViews.length;
				
				if(!this._aAdditionalKey || this._aAdditionalKey.length <= 0 ){
					//then there is no additional key, we can only use view name to search view instance
					if(nViewCount == 0 || this._bCacheInstance == false || 
							(( this._nCacheTime > 0) && ((new Date().getTime() - this._aViews[0].createTimestamp)/1000 > this._nCacheTime)) ){
						oView = this._createView({
									viewName: this._sViewName,
									type: this._type,
									id: this._id
								});
						if(this._aViews[0]){
							this._aViews[0].view.destroy();
						}
						this._aViews[0] = {
							createTimestamp: new Date().getTime(),
							view: oView
						};
					}else{						
						oView = this._aViews[0];
					}
				}else{					
					for(var i=0;i<nViewCount;i++){
						var oIndexView = this._aViews[i];
						if(_compareKey(oInstanceKey, oIndexView.oRouteKey)){
							if(this._bCacheInstance == false || 
							  (( this._nCacheTime > 0) && ((new Date().getTime() - this._aViews[0].createTimestamp)/1000 > this._nCacheTime))){
								oIndexView.view.destroy();
								oView = oIndexView.view = this._createView({
									viewName: this._sViewName,
									type: this._type,
									id: this._id
								});							
							}
							break;
						}						
					}					
					if(!oView){
						oView = {};
						oView.oRouteKey = $.extend(true,{},oInstanceKey);
						oView.view = this._createView({
							viewName: this._sViewName,
							type: this._type,
							id: this._id
						});						
						this._aViews.push({
							createTimestamp: new Date().getTime(),
							view: oView
						});
					}
				}				
				return oView;
			}
		});

		return RouteView;
		
});	