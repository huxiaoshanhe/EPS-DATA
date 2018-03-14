(function() {
	'use strict';
	angular.module('pf.analysis')
	.directive('logarithm',logarithmDirective)
	.controller('logarithmCtrl',logarithmCtrl);

	logarithmDirective.$inject = [];
	function logarithmDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/analysis/logarithm.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}

	logarithmCtrl.$inject = [];
	function logarithmCtrl() {

	}
})();