(function() {
	'use strict';
	angular.module('pf.window')
	.directive('userDefinedChart',userDefinedChartDirective);
	userDefinedChartDirective.$inject = [];
	function userDefinedChartDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/userDefinedChart.html',
			link:function(scope,element,attr) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});	
				element.find('.selectType').click(function(e) {
					element.find('.typeList').toggle();
					e.stopPropagation();
				});
				element.find('.selectOrder').click(function(e) {
					element.find('.orderList').toggle();
					e.stopPropagation();
				});
				element.find('.selectType2').click(function(e) {
					element.find('.typeList2').toggle();
					e.stopPropagation();
				});
				element.find('.colorSelect').click(function(e) {
					$(this).find('.colors').toggle();
					e.stopPropagation();
				});
				element.find('.bscolorSelect').click(function(e) {
					$(this).find('.colors').toggle();
					e.stopPropagation();
				});
				element.find('.selectPosition').click(function(e) {
					element.find('.positionList').toggle();
					e.stopPropagation();
				});
				
				$(document).click(function() {
					$('.list').hide();
				});
			}
		};
	}
})();