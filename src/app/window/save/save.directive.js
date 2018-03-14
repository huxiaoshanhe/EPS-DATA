(function() {
	'use strict';
	angular.module('pf.window')
	.directive('saveFile',saveFileDirective);
	saveFileDirective.$inject = [];
	function saveFileDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/save.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}
})();