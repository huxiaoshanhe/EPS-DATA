(function() {
	'use strict';
	angular.module('pf.window')
	.controller('filterCtrl',filterCtrl);
	filterCtrl.$inject = ['$scope','conditionService','workbookService','coreCF','dataService'];
	function filterCtrl($scope,conditionService,workbookService,config,dataService) {
		var that = this;
		that.show = false;
		that.selectedConditions = [config.basicCtrl.filter];
		$scope.$on('showFilter',function(e,data) {
			that.show = true;
			that.selectedConditions = [config.basicCtrl.filter];
			$scope.$apply();
		});	

		
		that.selectConditons = function(str) {
			var num = that.selectedConditions.indexOf(str);
			if(num===-1) {
				that.selectedConditions.push(str);
			} else {
				that.selectedConditions.splice(num,1);
			}
		}
		
		that.conditions = [
			{
				name:'0',
				title:'隐藏0单元格'
			},
			{
				name:'empty',
				title:'隐藏空单元格'
			}
		];

		that.otherConditions = [
			{value:0,name:'无'},
			{value:'eq',name:'等于A'},
			{value:'neq',name:'不等于A'},
			{value:'gt',name:'大于A'},
			{value:'lt',name:'小于A'},
			{value:'gte',name:'大于或等于A'},
			{value:'lte',name:'小于或等于A'},
			{value:'bt',name:'A,B之间'},
			{value:'nbt',name:'小于A或者大于B'}
		];
		that.otherSelected = {
			value:0,
			name:'无'
		}
		that.selectOtherCondition = function(value,name) {
			that.otherSelected.value = value;
			that.otherSelected.name = name;
		}

		that.goApply = function() {
			var isCanGo = canGo();
			if(!isCanGo.can) {
				alert(isCanGo.msg);
				return false;
			}
			var dealStr = that.selectedConditions.join(',');
			if(that.otherSelected.value!==0) {
				if(dealStr) {
					switch(that.otherSelected.value) {
						case 'bt':
						dealStr+=',between_'+that.numberA+'|'+that.numberB;
						break;
						case 'nbt': 
						dealStr+=',out_'+that.numberA+'|'+that.numberB;
						break;
						default:
						dealStr+=','+that.otherSelected.value+'_'+that.numberA;
						break;
					}
				} else {
					switch(that.otherSelected.value) {
						case 'bt':
						dealStr+='between_'+that.numberA+'|'+that.numberB;
						break;
						case 'nbt': 
						dealStr+='out_'+that.numberA+'|'+that.numberB;
						break;
						default:
						dealStr+=that.otherSelected.value+'_'+that.numberA;
						break;
					}
				}				
			}
			config.basicCtrl.filter = dealStr;			
			var param = conditionService.getParams('after');
			param.sid = dataService.getCookieObj('sid');
			param = angular.toJson(param);
        	var params = {param:param};
			workbookService.sync(params);
			that.show = false;
			$scope.$emit('showWindow',false);
		}

		that.goClear = function() {
			that.selectedConditions = [];
			that.otherSelected = {value:0,name:'无'}
			that.numberA = null;
			that.numberB = null;
			config.basicCtrl.filter = '';			
			var param = conditionService.getParams('after');
			param.sid = dataService.getCookieObj('sid');
			param = angular.toJson(param);
        	var params = {param:param};
			workbookService.sync(params);
			that.show = false;
			$scope.$emit('showWindow',false);
		}

		function dealCondition() {
			that.otherSelected.value=0;
			var cond = conditionService.getCondition();
			var sheetId = conditionService.getSheetId();
			var params = {
				dims:angular.toJson(cond.dimensionVOLst),
				metaColumns:cond.metaColumn.join('-'),
				fix:cond.metaFixed.join(','),
				metaRows:cond.metaRow.join('-'),
				sheetId:sheetId,
				cubeId:config.cubeId
			}
			return params;
		}


		function canGo() {
			switch(that.otherSelected.value) {
				case 0:
				return {can:true};
				break;
				case 'bt':
				case 'nbt':
				if(that.numberA>that.numberB||that.numberA===that.numberB) {
					return {can:false,msg:'数据A必须小于数据B'};
				} else {
					return {can:true};
				}
				break;
				default:
				if(that.numberA===null||that.numberA===undefined||that.numberA===false) {
					return {can:false,msg:'数据A不能为空'};
				} else {
					return {can:true};
				}
				break;
			}
		}
	}
})();