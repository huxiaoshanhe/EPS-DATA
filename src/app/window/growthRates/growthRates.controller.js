(function() {
	'use strict';
	angular.module('pf.window')
	.controller('growthRateCtrl',growthRateCtrl);
	growthRateCtrl.$inject = ['$scope','handsontableService','conditionService','dataService','tableFactory'];
	function growthRateCtrl($scope,handsontableService,conditionService,dataService,tableFactory) {
		var that = this;
		that.show = false;
		$scope.$on('showGrowthRate',function(e,data) {
			that.show = true;
			$scope.$apply();
		});	

		that.selectedConditions = 'ln_';

		that.conditions = [
			{name:'grytd',title:'年比增长率'},
			{name:'grpop',title:'环比增长率'},
			{name:'gryoy',title:'同比增长率'}
		];

		that.goApply = function() {
			var fixedNum = handsontableService.getFixedNum();
			var method = that.selectedConditions;
			var sheetId = conditionService.getSheetId();
			var area = handsontableService.getSelected();
			var params = {
				'action':'gr',
				'method':method,
				'sheetId': sheetId,
				'p1':area[0]+','+area[1],
				'p2':area[2]+','+area[3]
			}
			dataService.get('timeseries',params).then(function(data) {
				var datas = tableFactory.parse(data);
				datas.fixedColumnsLeft = fixedNum.left;
				datas.fixedRowsTop = fixedNum.top;
				$scope.$emit('workbook',datas);
				that.show = false;
				$scope.$emit('showWindow',false);
			});
		}

		that.clear = function() {
			var fixedNum = handsontableService.getFixedNum();
			var sheetId = conditionService.getSheetId();
			var params = {
				sheetId:sheetId,
				type:'trans',
				action:'clear'
			}
			dataService.get('refresh',params).then(function(data) {
				var datas = tableFactory.parse(data);
				datas.fixedColumnsLeft = fixedNum.left;
				datas.fixedRowsTop = fixedNum.top;
				$scope.$emit('workbook',datas);
				that.selectedConditions = null;
				that.show = false;
				$scope.$emit('showWindow',false);
			});			
		}
	}
})();