(function() {
	'use strict';
	angular.module('pf.window')
	.directive('loginWin',loginWinDirective);
	loginWinDirective.$inject = [];
	function loginWinDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/loginWin.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();