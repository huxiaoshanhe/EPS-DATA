(function() {
	'use strict';
	angular.module('pf.window')
	.controller('hightLightCtrl',hightLightCtrl);
	hightLightCtrl.$inject = ['$scope','dispatchService','conditionService','coreCF','dataService','tableFactory'];
	function hightLightCtrl($scope, dispatchService,conditionService,config,dataService,tableFactory) {
		var that = this;
		that.show = false;
		$scope.$on('showHighLight',function(e,data) {
			that.show = true;
			$scope.$apply();
		});
		that.selectedConditions = {
			value:0,
			name:'无'
		}

		that.selectedBgColor = '#fff';
		that.selectedColor = '#f00';
		that.selectedStyles = ['bolder'];
		that.selectedFontSize = 12;
		that.fontWeight = 'bolder';
		that.fontStyle = 'normal';
		that.textDecoration = 'none';

		that.selectCondition = function(value,name) {
			that.selectedConditions.value = value;
			that.selectedConditions.name = name;
		}

		that.selectStyles = function(str) {
			var num = that.selectedStyles.indexOf(str);
			if(num===-1) {
				that.selectedStyles.push(str);
			} else {
				that.selectedStyles.splice(num,1);
			}
		}

		that.conditions = [
			{value:0,name:'无'},
			{value:1,name:'等于A'},
			{value:2,name:'不等于A'},
			{value:3,name:'大于A'},
			{value:4,name:'小于A'},
			{value:5,name:'大于或等于A'},
			{value:6,name:'小于或等于A'},
			{value:7,name:'A,B之间'},
			{value:8,name:'最大A'},
			{value:9,name:'最小A'}
		];

		that.colors = dispatchService.getColorBox();

		that.fontStyles = [
			{id:'bolder',name:'加粗',style:{fontWeight:'bold'}},
			{id:'italic',name:'斜体',style:{fontStyle:'italic'}},
			{id:'underline',name:'下划线',style:{textDecoration:'underline'}}
		];

		
		that.goApply = function() {
			setConditions();
			var param = conditionService.getParams('after');
			param.sid = dataService.getCookieObj('sid');
			param = angular.toJson(param);
			var params = {param:param};
			//params = $.param(params);
			dataService.post('dim',params).then(function(data) {
				config.conditionId = '201102254';
				var sheetData = tableFactory.parse(data[0].tableVO);
		    	$scope.$emit('workbook',sheetData);		    	
			});
			that.show = false;
			$scope.$emit('showWindow',false);
		}
		that.clear = function() {
			$scope.$emit('refreshData',true);
			that.show = false;
			$scope.$emit('showWindow',false);
		}


		function setConditions() {
			var str = null;
			switch(that.selectedConditions.value) {
				case 1:
					str = 'eq_'+that.numberA;
				break;
				case 2:
					str = 'neq_'+that.numberA;
				break;
				case 3:
					str = 'gt_'+that.numberA;
				break;
				case 4:
					str = 'lt_'+that.numberA;
				break;
				case 5:
					str = 'gte_'+that.numberA;
				break;
				case 6:
					str = 'lte_'+that.numberA;
				break;
				case 7:
					str = 'gte_'+that.numberA+','+'lte_'+that.numberB;
				break;
				case 8:
					str = 'max_'+that.numberA;
				break;
				case 9:
					str = 'min_'+that.numberA;
				break;
			}
			var fontStyles = {
        		color:that.selectedColor,
				fontStyles:that.selectedStyles,
				fontSize:that.selectedFontSize
        	}
        	var stringStyles = angular.toJson(fontStyles);
        	config.mainCtrl.s5 = {
	        	showBackColor:that.selectedBgColor,
	        	showFontStyle:stringStyles,
	        	dealStr:str
	        };
		}
	}
})();