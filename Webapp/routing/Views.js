sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/core/UIComponent', 'sap/ui/core/mvc/View'],
	function(jQuery, EventProvider, UIComponent, View) {
		"use strict";
		
		var Views = EventProvider.extend("sap.ui.core.routing.Views", /** @lends sap.ui.core.routing.Views.prototype */ {

			constructor : function (oOptions) {
				if (!oOptions) {
					oOptions = {};
				}

				this._oViews = {};

				this._oComponent = oOptions.component;
				if (this._oComponent) {
					jQuery.sap.assert(this._oComponent instanceof UIComponent, this + ' - the component passed to the constructor needs to be an instance of UIComponent');
				}

				EventProvider.apply(this, arguments);
			},

			metadata : {
				publicMethods: ["getView", "setView"]
			},
			
			getView : function (oOptions) {
				return this._getView(oOptions).loaded();
			},
			
			setView : function (sViewName, oView) {
				this._checkViewName(sViewName);

				this._oViews[sViewName] = oView;
				return this;
			},
			
			destroy : function () {
				var sProperty;

				EventProvider.prototype.destroy.apply(this);

				for (sProperty in this._oViews) {
					if (this._oViews.hasOwnProperty(sProperty) && this._oViews[sProperty]) {
						this._oViews[sProperty].destroy();
					}
				}

				this._oViews = undefined;
				this.bIsDestroyed = true;

				return this;
			},
			
			_getView: function (oOptions) {
				if (this._oComponent && oOptions.id) {
					oOptions = jQuery.extend({}, oOptions, { id : this._oComponent.createId(oOptions.id) });
				}

				return this._getViewWithGlobalId(oOptions);
			},
			
			_getViewWithGlobalId : function (oOptions) {
				function fnCreateView() {
					return sap.ui.view(oOptions);
				}

				if (!oOptions) {
					jQuery.sap.log.error("the oOptions parameter of getView is mandatory", this);
				}

				var oView,
					sViewName = oOptions.viewName;
				
				oView = this._oViews[sViewName];

				if (oView) {
					return oView;
				}

				if (this._oComponent) {
					oView = this._oComponent.runAsOwner(fnCreateView);
				} else {
					oView = fnCreateView();
				}

				this._oViews[sViewName] = oView;

				this.fireCreated({
					view: oView,
					viewOptions: oOptions
				});

				return oView;
			}
			
		});

		return Views;

});
