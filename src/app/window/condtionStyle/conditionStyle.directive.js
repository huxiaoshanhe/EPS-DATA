(function() {
	'use strict';
	angular.module('pf.window')
	.directive('conditionStyle',conditionStyleDirective);
	conditionStyleDirective.$inject = [];
	function conditionStyleDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/conditionStyle.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});				
			}
		};
	}
})();