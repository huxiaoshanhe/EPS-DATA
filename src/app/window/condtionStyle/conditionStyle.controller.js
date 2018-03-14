(function() {
	'use strict';
	angular.module('pf.window')
	.controller('conditionStyleCtrl',conditionStyleCtrl);
	conditionStyleCtrl.$inject = ['$scope','conditionService','handsontableService','dataService','tableFactory','coreCF'];
	function conditionStyleCtrl($scope,conditionService,handsontableService,dataService,tableFactory,config) {
		var that = this;
		that.show = false;
		$scope.$on('showConditionStyle',function(e,data) {
			that.show = true;
			$scope.$apply();
		});

		that.selectedTone = 0;
		that.selectedIcon = 0;

		that.tones = [
			{name:'greenRed',title:'绿=黄-红色阶'},
			{name:'redGreen',title:'红-黄-绿色阶'},
			{name:'yellowOrange',title:'黄-红色阶'},
			{name:'orangeYellow',title:'红-黄色阶'},
			{name:'purpleRed',title:'蓝-黄-红色阶'},
			{name:'redPurple',title:'红-黄-蓝色阶'},
			{name:'greenYellow',title:'绿-黄色阶'},
			{name:'yellowGreen',title:'黄-绿色阶'}
		];

		that.icons = [
			{name:'icona',title:'符号'},
			{name:'iconb',title:'三角形'},
			{name:'iconc',title:'旗帜（类型2）'},
			{name:'icond',title:'旗帜（类型1）'},
			{name:'icone',title:'等级（彩色）'},
			{name:'iconf',title:'等级（灰色）'},
			{name:'icong',title:'箭头（彩色）'},
			{name:'iconh',title:'箭头（灰色）'},
			{name:'iconi',title:'环状填充（彩色）'},
			{name:'iconj',title:'环状填充（灰色）'},
			{name:'iconk',title:'交通灯'},
			{name:'iconl',title:'柱状'}
		];

		that.selectToneNum = function(num) {
			if(that.selectedTone === (num+1)) {
				that.selectedTone = 0;
			} else {
				that.selectedTone = num+1;
			}			
		}
		that.selectIconNum = function(num) {
			if(that.selectedIcon === (num+1)) {
				that.selectedIcon = 0;
			} else {
				that.selectedIcon = num+1;
			}
		}

		that.goApply = function() {
			if(that.selectedTone<1&&that.selectedIcon<1) {
				return false;
			}
			var sheetId = config.newSheetId;
			var user = dataService.getCookieObj('user');
			user = angular.fromJson(user);
			var area = handsontableService.getSelected();
			var p1 = area[0]+','+area[1];
			var p2 = area[2]+','+area[3];
			var params = {sheetId:sheetId,uid:config.conditionId,p1:p1,p2:p2};
			if(that.selectedTone>0) {
				params.toneType = that.selectedTone;
			} else {
				params.toneType = '';
			}
			if(that.selectedIcon>0) {
				params.iconType = that.selectedIcon;
			} else {
				params.iconType = '';
			}
			dataService.get('concss',params).then(function(data) {
				config.conditionId = data.uid;
				var a = tableFactory.parse(data.tableVO);
		    	$scope.$emit('workbook',a);
			});
		    that.show = false;
			$scope.$emit('showWindow',false);
			$scope.$emit('tableCtrl',{name:'formatConditions',value:true});
		}	

		that.clear = function() {
			var sheetId = conditionService.getSheetId();
			var area = handsontableService.getSelected();
			var p1 = area[0]+','+area[1];
			var p2 = area[2]+','+area[3];
			var params = {
				sheetId:config.newSheetId,
				p1:p1,p2:p2,
				toneType:'',
				iconType:'',
				uid:config.conditionId
			};
			dataService.get('concss',params).then(function(data) {
				config.conditionId = data.uid;
				var a = tableFactory.parse(data.tableVO);
		    	$scope.$emit('workbook',a);
			});
			that.selectedTone = 0;
			that.selectedIcon = 0;
			that.show = false;
			$scope.$emit('showWindow',false);
			$scope.$emit('tableCtrl',{name:'formatConditions',value:true});
		}	
	}
})();