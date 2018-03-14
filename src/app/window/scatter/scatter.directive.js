(function() {
	'use strict';
	angular.module('pf.window')
	.directive('scatter',scatterDirective);
	scatterDirective.$inject = [];
	function scatterDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/scatter.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});				
			}
		};
	}
})();