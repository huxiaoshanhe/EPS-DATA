(function() {
	'use strict';
	angular.module('pf.window')
	.controller('userDefinedFnCtrl',userDefinedFnCtrl);
	userDefinedFnCtrl.$inject = ['$scope'];
	function userDefinedFnCtrl($scope) {
		var that = this;
		that.show = false;
		$scope.$on('showUserDefinedFn',function(e,data) {
			that.show = true;
			$scope.$apply();
		});	

		that.selectedConditions = ['ln'];
		that.selectConditons = function(str) {
			var num = that.selectedConditions.indexOf(str);
			if(num===-1) {
				that.selectedConditions.push(str);
			} else {
				that.selectedConditions.splice(num,1);
			}
		}

		that.conditions = [
			{name:'ln',title:'自然对数'},
			{name:'log2',title:'以2为底的对数'},
			{name:'log10',title:'以10为底的对数'}
		];
	}
})();