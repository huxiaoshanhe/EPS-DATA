(function() {
	'use strict';
	angular.module('pf.window')
	.directive('collections',collectionsDirective);
	collectionsDirective.$inject = [];
	function collectionsDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/collections.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();