(function() {
	'use strict';
	angular.module('pf.window')
	.directive('registerWin',registerWinDirective);
	registerWinDirective.$inject = [];
	function registerWinDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/registerWin.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();