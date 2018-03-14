(function() {
	'use strict';
	angular.module('pf.charts')
	.controller('chartsCtrl',chartsCtrl);
	chartsCtrl.$inject = ['$scope','handsontableService','chartService','coreCF','conditionService','dataService','$timeout'];
	function chartsCtrl($scope,handsontableService,chartService,config,conditionService,dataService,$timeout) {
		var that = this;

		$scope.$on('workbook',function(data) {
			if(config.tabsSwitch.tableChartShow!==false||config.tabsSwitch.chartShow!==false) {
				$timeout(function() {
					chartService.init();
				},10);
			}
			chartService.changedTable(true);
		});

		$scope.$on('changeCube',function(data) {
			chartService.setChartType('Bar');
		});

		

		//框选后绘图
		handsontableService.addAfterSelectionEnd(function(r, c, r1, c1) {
			if(!config.tabsSwitch.tableChartShow) {
				return false;
			}
			var chartsType = chartService.getChartType();
			if(chartsType=='Scatter') {return false;}
			chartService.getCharts(chartsType);
			dataService.addDataLog(config.cubeId,4);
		});
	}
})();