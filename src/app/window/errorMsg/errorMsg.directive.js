(function() {
	'use strict';
	angular.module('pf.window')
	.directive('errorMsg',errorMsgDirective);
	errorMsgDirective.$inject = [];
	function errorMsgDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/errorMsg.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();