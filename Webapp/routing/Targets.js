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

			},
			
			destroy : function () {
				var sTargetName;
				EventProvider.prototype.destroy.apply(this);
				
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