(function(){
	'use strict';
	angular.module('pf.window')
	.directive('helpCenter',helpCenterDirective)
	.directive('helpResult',helpResultDirective);
	helpCenterDirective.$inject = [];
	function helpCenterDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/help.html',
			link:function(scope,element,attr) {
				element.find('.help-search').draggable({containment: 'window'});
				element.find('.search-detail').draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}

	helpResultDirective.$inject = [];
	function helpResultDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				scope.$watch('data',function(data) {
					element.html(data);
				});
			}
		};
	}
})();