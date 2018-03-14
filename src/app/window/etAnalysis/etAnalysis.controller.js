(function() {
	'use strict';
	angular.module('pf.window')
	.controller('etAnalysisCtrl',etAnalysisCtrl);
	etAnalysisCtrl.$inject = ['$scope', 'dispatchService','dataService','conditionService','coreCF','tableFactory','handsontableService','$timeout'];
	function etAnalysisCtrl($scope, dispatchService,dataService,conditionService,config,tableFactory,handsontableService,$timeout) {
		var that = this;
		that.show = false;
		$scope.$on('showEtAnalysis',function(e,data) {
			that.show = true;
			var sheetId = config.newSheetId;
			dataService.get('get8020Msg',{sheetId:sheetId}).then(function(data) {
	        	that.cols = data;
	        });
	        that.selectedCols ={
				index:null,
				name:'无'
			}
			$scope.$apply();
		});	

		that.selectCols = function(index,name) {
			that.selectedCols.index = index;
			that.selectedCols.name = name;
		}
		
		that.selectedBgColor = '#92D050';
		that.selectedColor = '#282828';
		that.selectedStyles = [];
		that.selectedFontSize = 12;

		that.selectStyles = function(str) {
			var num = that.selectedStyles.indexOf(str);
			if(num===-1) {
				that.selectedStyles.push(str);
			} else {
				that.selectedStyles.splice(num,1);
			}
		}

		that.colors = dispatchService.getColorBox();
		that.fontStyles = [
			{id:'bolder',name:'加粗',style:{fontWeight:'bold'}},
			{id:'italic',name:'斜体',style:{fontStyle:'italic'}},
			{id:'underline',name:'下划线',style:{textDecoration:'underline'}}
		];

		that.goApply = function() {
			if(!that.selectedCols.index) {
				return false;
			}			
			var conditions = conditionService.getCondition();
	        if(conditions.metaRow.length==0||conditions.metaColumn.length==0) {
	            errorService.showError('行或列必须保证至少一个维度');
	            return false;
	        }
	        var fontStyles = {
        		color:that.selectedColor,
				fontStyles:that.selectedStyles,
				fontSize:that.selectedFontSize
        	}
        	var stringStyles = angular.toJson(fontStyles);
	        config.mainCtrl.s3 = {
	        	index8020:that.selectedCols.index,
	        	bgColor8020:that.selectedBgColor,
	        	fontStyle8020:stringStyles
	        };
	        var param = conditionService.getParams('after');
	        param.sid = dataService.getCookieObj('sid');
	        param = angular.toJson(param);
			var params = {param:param};
			//params = $.param(params);
	        dataService.post('dim',params).then(function(data) {
				config.conditionId = '201102254';
				var tableData = data[0].tableVO;
				var sheetData = tableFactory.parse(tableData);
		    	$scope.$emit('workbook',sheetData);
		    	var area = [];
		    	area[0] = tableData.fixedRowsTop;
		    	area[1] = that.selectedCols.index;
		    	area[2] = tableData.values.length-1;
		    	area[3] = that.selectedCols.index;		    	
			});
			that.show = false;
			$scope.$emit('showWindow',false);
		}

		that.clear = function() {
			that.show = false;
			$scope.$emit('refreshData',true);
			$scope.$emit('showWindow',false);
		}
	}
})();