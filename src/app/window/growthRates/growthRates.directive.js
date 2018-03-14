(function() {
	'use strict';
	angular.module('pf.window')
	.directive('growthRate',growthRateDirective);
	growthRateDirective.$inject = [];
	function growthRateDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/growthRates.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();