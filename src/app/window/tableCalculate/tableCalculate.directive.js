(function() {
	'use strict';
	angular.module('pf.window')
	.directive('tableCalculate',tableCalculateDirective);
	tableCalculateDirective.$inject = [];
	function tableCalculateDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/tableCalculate.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});				
			}
		};
	}
})();