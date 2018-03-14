(function() {
	'use strict';
	angular.module('pf.window')
	.directive('etAnalysis',etAnalysisDirective);
	etAnalysisDirective.$inject = [];
	function etAnalysisDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/etAnalysis.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});

				$(document).click(function(){
					element.find('.list').hide();
					element.find('.colors').hide();
				});
				$('.selectConditons').click(function(e) {
					element.find('.list').toggle();
					e.stopPropagation();
				});
				$('.bgColors').click(function(e) {
					element.find('.bgColors .colors').toggle();
					element.find('.fontColors .colors').hide();
					e.stopPropagation();
				});
				$('.fontColors').click(function(e) {
					element.find('.fontColors .colors').toggle();
					element.find('.bgColors .colors').hide();
					e.stopPropagation();
				});
			}
		};
	}
})();