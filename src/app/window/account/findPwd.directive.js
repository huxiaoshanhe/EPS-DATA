(function() {
	'use strict';
	angular.module('pf.window')
	.directive('findPwd',findPwdDirective);
	findPwdDirective.$inject = [];
	function findPwdDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/findPwd.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();