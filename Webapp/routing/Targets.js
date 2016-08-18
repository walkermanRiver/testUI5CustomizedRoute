sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', './Target'],
	function(jQuery, EventProvider, Target) {
		"use strict";
		
		var Targets = EventProvider.extend("sap.ui.core.routing.Targets", /** @lends sap.ui.core.routing.Targets.prototype */ {

			constructor : function(oOptions) {
				var sTargetOptions,
					sTargetName;

				EventProvider.apply(this);

				this._mTargets = {};
				this._oConfig = oOptions.config;
				this._oViews = oOptions.views;	

				for (sTargetOptions in oOptions.targets) {
					if (oOptions.targets.hasOwnProperty(sTargetOptions)) {
						this._createTarget(sTargetOptions, oOptions.targets[sTargetOptions]);
					}
				}
				
				for (sTargetName in this._mTargets) {
					if (this._mTargets.hasOwnProperty(sTargetName)) {
						this._addParentTo(this._mTargets[sTargetName]);
					}
				}

			},
			
			destroy : function () {
				var sTargetName;
				EventProvider.prototype.destroy.apply(this);
				
				for (sTargetName in this._mTargets) {
					if (this._mTargets.hasOwnProperty(sTargetName)) {
						this._mTargets[sTargetName].destroy();
					}
				}
				
				this._oViews = null;
				this._oConfig = null;
				this.bIsDestroyed = true;

				return this;
			},
			
			getTarget : function (sName) {
				return this._mTargets[sName];
			},
			
			addTarget : function (sName, oTargetOptions) {
				var oOldTarget = this.getTarget(sName),
					oTarget;

				if (oOldTarget) {
					jQuery.sap.log.error("Target with name " + sName + " already exists", this);
				} else {
					oTarget = this._createTarget(sName, oTargetOptions);
					this._addParentTo(oTarget);
				}

				return this;
			},
			
			display: function(vTargets, vData, sRouteName, vRouteInstancePara) {
				this._display(vTargets, vData, sRouteName, vRouteInstancePara);
			},

	
			//vRouteInstancePara/unit: {targetName1:{aKeyName,oKeyValue,parent}}
			_display: function(vTargets, vData, sRouteName, vRouteInstancePara) {
				var that = this;

				if (jQuery.isArray(vTargets)) {
					jQuery.each(vTargets, function(i, sTarget) {
						that._displaySingleTarget(sTarget, vData, sRouteName, vRouteInstancePara);
					});
				} else {
					this._displaySingleTarget(vTargets, vData, sRouteName, vRouteInstancePara);
				}

				return this;
			},

			//{aKeyName,oKeyValue,parent}
			_displaySingleTarget: function(sName, vData, sRouteName, vRouteInstancePara) {
				var oTarget = this.getTarget(sName);
				var oRouteInstancePara = vRouteInstancePara[sName];
				

				if (oTarget !== undefined) {
					oTarget.display(vData, sRouteName, oRouteInstancePara);
				} else {
					jQuery.sap.log.error("The target with the name \"" + sName + "\" does not exist!", this);
				}
			},
			
			
			_createTarget : function (sName, oTargetOptions) {
				var oTarget,
					oOptions;

				oOptions = jQuery.extend(true, { name: sName }, this._oConfig, oTargetOptions);
				oTarget = this._constructTarget(oOptions);				
				this._mTargets[sName] = oTarget;
				return oTarget;
			},
			
			_addParentTo : function (oTarget) {
				var oParentTarget,
					sParent = oTarget._oOptions.parent;

				if (!sParent) {
					return;
				}

				oParentTarget = this._mTargets[sParent];

				if (!oParentTarget) {
					jQuery.sap.log.error("The target '" + oTarget._oOptions.name + " has a parent '" + sParent + "' defined, but it was not found in the other targets", this);
					return;
				}

				oTarget._oParent = oParentTarget;
			},
			
			_constructTarget : function (oOptions, oParent) {
				return new Target(oOptions, this._oViews, oParent);
			},
			
		});

		return Targets;
		
});		