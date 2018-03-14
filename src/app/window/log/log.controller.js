(function() {
	'use strict';
	angular.module('pf.window')
	.controller('logCtrl',logCtrl);
	logCtrl.$inject = ['$scope','handsontableService','conditionService','dataService','tableFactory'];
	function logCtrl($scope,handsontableService,conditionService,dataService,tableFactory) {
		var that = this;
		that.show = false;
		$scope.$on('showLog',function(e,data) {
			that.show = true;
			$scope.$apply();
		});	

		/*that.selectedConditions = ['ln'];
		that.selectConditons = function(str) {
			var num = that.selectedConditions.indexOf(str);
			if(num===-1) {
				that.selectedConditions.push(str);
			} else {
				that.selectedConditions.splice(num,1);
			}
		}*/
		that.selectedConditions = 'ln_';

		that.conditions = [
			{name:'ln_',title:'自然对数'},
			{name:'log_10_',title:'以10为底的对数'}
		];

		that.goApply = function() {
			var fixedNum = handsontableService.getFixedNum();
			var method = that.selectedConditions;
			var sheetId = conditionService.getSheetId();
			var area = handsontableService.getSelected();
			var params = {
				'action':'logarithm',
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