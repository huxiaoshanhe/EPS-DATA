(function() {
	'use strict';
	angular.module('pf.window')
	.controller('tableCalculateCtrl',tableCalculateCtrl);
	tableCalculateCtrl.$inject = ['$scope','conditionService','dataService','tableFactory','coreCF'];
	function tableCalculateCtrl($scope,conditionService,dataService,tableFactory,config) {
		var that = this;
		that.show = false;
		$scope.$on('showTableCalculate',function(e,data) {
			that.show = true;
			$scope.$apply();
			that.newSheetId = Date.parse(new Date()).toString();			
		});
		$scope.$on('refreshData',function(e,data) {
			that.selectedWays = {colWays:[],rowWays:[]}
		});

		that.selectedWays = {colWays:[],rowWays:[]}

		that.selectWay = function(key,type) {
			if(type==='col') {
				var num = that.selectedWays.colWays.indexOf(key);
				if(num===-1) {
					that.selectedWays.colWays.push(key);
				} else {
					that.selectedWays.colWays.splice(num,1);
				}
			} else if(type==='row') {
				var num = that.selectedWays.rowWays.indexOf(key);
				if(num===-1) {
					that.selectedWays.rowWays.push(key);
				} else {
					that.selectedWays.rowWays.splice(num,1);
				}
			}
		}

		that.colWays = [
			[
				{'key':'sum', 'text': '求和'},
		        {'key':'mean', 'text': '均值'},
		        {'key':'max', 'text': '最大值'},
		        {'key':'min', 'text': '最小值'},
		        {'key':'mode', 'text': '众数'},
		        {'key':'median', 'text': '中位数'},
		        {'key':'variance', 'text': '方差'},
		        {'key':'sd', 'text': '标准差'}
	        ],
	        [
		        {'key':'skewness', 'text': '偏度'},
		        {'key':'kurtosis', 'text': '峰度'},
		        {'key':'range', 'text': '极差'},
		        {'key':'squares', 'text': '平方和'},
		        {'key':'upperdecile', 'text': '下十分位'},
		        {'key':'lowerdecile', 'text': '上十分位'},
		        {'key':'upperquartile', 'text': '下四分位'},
		        {'key':'lowerquartile', 'text': '上四分位'}
	        ]
		];
		that.rowWays = [
			[
				{'key':'sum', 'text': '求和'},
		        {'key':'mean', 'text': '均值'},
		        {'key':'max', 'text': '最大值'},
		        {'key':'min', 'text': '最小值'},
		        {'key':'mode', 'text': '众数'},
		        {'key':'median', 'text': '中位数'},
		        {'key':'variance', 'text': '方差'},
		        {'key':'sd', 'text': '标准差'}
	        ],
	        [
		        {'key':'skewness', 'text': '偏度'},
		        {'key':'kurtosis', 'text': '峰度'},
		        {'key':'range', 'text': '极差'},
		        {'key':'squares', 'text': '平方和'},
		        {'key':'upperdecile', 'text': '下十分位'},
		        {'key':'lowerdecile', 'text': '上十分位'},
		        {'key':'upperquartile', 'text': '下四分位'},
		        {'key':'lowerquartile', 'text': '上四分位'}
	        ]
		];


		that.goApply = function() {
			var sheetId = conditionService.getSheetId();
			var type = null;
			var method = null;
			if(that.selectedWays.colWays.length==0&&that.selectedWays.rowWays.length!=0) {
				type = 'columns'
				method = that.selectedWays.rowWays.join('_');
			} else if(that.selectedWays.colWays.length!=0&&that.selectedWays.rowWays.length==0) {
				type = 'rows'
				method = that.selectedWays.colWays.join('_');
			} else if(that.selectedWays.colWays.length!=0&&that.selectedWays.rowWays.length!=0) {
				type = 'rows_columns';
				method = that.selectedWays.colWays.join('_') +','+ that.selectedWays.rowWays.join('_');
			}
			config.mainCtrl.s2 = {type:type,method:method};
			var param = conditionService.getParams('after');
			param.sid = dataService.getCookieObj('sid');
			param = angular.toJson(param);
			var params = {param:param};
			//params = $.param(params);
			dataService.post('dim',params).then(function(data) {
				config.conditionId = '201102254';
				var datas = tableFactory.parse(data[0].tableVO);
				var oldSheet = sheetId;
				$scope.$emit('workbook',datas);
				that.show = false;
				$scope.$emit('showWindow',false);
			});
		}

		that.clear = function() {
			that.selectedWays = {colWays:[],rowWays:[]}
			that.show = false;
			$scope.$emit('refreshData',true);
			$scope.$emit('showWindow',false);
		}
	}
})();