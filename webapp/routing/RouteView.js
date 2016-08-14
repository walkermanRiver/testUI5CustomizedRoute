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
				this._bCacheInstance = oOptions.bCacheInstance;
				this._aAdditionalKey = oOptions.aAdditionalKey;
				this._bAddPageContainer = oOptions.bAddPageContainer;
				this._nCacheTime = oOptions.nCacheTime;
				this._aViews = [];
				EventProvider.apply(this, arguments);				
			},
			
			destroy : function () {				
				this._oOptions = null;				
				this._oView.destroy();
				this._oView = null;
				this._oInstanceKey = null;
				
				EventProvider.prototype.destroy.apply(this, arguments);
				this.bIsDestroyed = true;

				return this;
			},
			
			//optionalKey:{key1:value1,key2:value2}
//			_setInstanceKey: function(oInstanceKey){
//				if(this._oInstanceKey){
//					jQuery.sap.log.error("the view is set instance key again, this should not happen", this);
//				}
//				
//				if(oInstanceKey){
//					this._oInstanceKey = oOptionKey;
//				}
//			},
			
			//option = {viewName: "sap.ui.demo.nav.view.employee.overview.EmployeeOverview", type: "XML", id: undefined}
			createView: function(option){
				
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
			
			//optionalKey:{key1:value1,key2:value2}
			getViewWithInstanceKey: function(oInstanceKey){
				
				var oView;
				var nViewCount = this._aViews.length;
				
				if(!this._aAdditionalKey || this._aAdditionalKey.length <= 0 ){
					//then there is no additaional key, we can only use view name to search view instance
					if(nViewCount == 0 || this._bCacheInstance == false){
						oView = this._createView({
									viewName: this._sViewName,
									type: this._type,
									id: this._id
								});
						this._aViews[0] = oView;
					}else{						
						oView = this._aViews[0];
					}
				}else{
					var nViewCount = this._aViews.length;
					for(var i=0;i<nViewCount;i++){
						var oIndexView = this._aViews[i];
						
					}
				}
				
				return oView;
			}
			
			
		});

		return RouteView;
		
});	