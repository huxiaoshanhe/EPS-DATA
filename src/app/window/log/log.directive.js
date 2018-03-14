(function() {
	'use strict';
	angular.module('pf.window')
	.directive('log',logDirective);
	logDirective.$inject = [];
	function logDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/log.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();