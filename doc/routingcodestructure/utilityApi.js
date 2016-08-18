var oCommonObject = {};
oCommonObject.display({
	target: 'targetName',
	cacheInstance: true,
	"cacheTime": "with_parent",
	"cacheKey":{
		"selfKey":{
			"instanceId": "{instanceId}"
		},
		p1Key:{
			"employeeId": "employeeIdValue"
		}
	}
});

oCommonObject.getChildTargetViewInstance({
	target: 'targetName',
	cacheKey:{
		"employeeId": "employeeIdValue"
	}	
});


oCommonObject.navTo(routeName, oParameters?, bReplace?, oOptionalComplexValue)