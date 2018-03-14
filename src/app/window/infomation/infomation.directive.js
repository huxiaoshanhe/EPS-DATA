(function() {
	'use strict';
	angular.module('pf.window')
	.directive('infomation',infomationDirective);
	infomationDirective.$inject = [];
	function infomationDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/infomation.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();