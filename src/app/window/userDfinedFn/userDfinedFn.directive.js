(function() {
	'use strict';
	angular.module('pf.window')
	.directive('userDefinedFn',userDefinedFnDirective);
	userDefinedFnDirective.$inject = [];
	function userDefinedFnDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/userDefinedFn.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
				$(document).click(function() {
					element.find('.list').hide();
				});
				element.find('.selectConditons').click(function(e) {
					e.stopPropagation();
					element.find('.list').toggle();
				})
			}
		};
	}
})();