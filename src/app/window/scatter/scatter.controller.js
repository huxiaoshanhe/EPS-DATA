(function() {
	'use strict';
	angular.module('pf.window')
	.controller('scatterCtrl',scatterCtrl);
	scatterCtrl.$inject = ['$scope','conditionService','dataService','chartService','coreCF'];
	function scatterCtrl($scope,conditionService,dataService,chartService,config) {
		var that = this;
		that.show = false;
		$scope.$on('showScatterWin',function(e,data) {
			that.show = true;
			var params = {
				action:'regression',
				sheetId:conditionService.getSheetId()
			};
			dataService.get('variable',params).then(function(data) {
				data.indeptVars.splice(0,1);
				that.indepts = data.indeptVars;
			});

			$scope.$apply();
		});	

		that.selected = {
			x:null,
			y:null
		}

		

		
		that.goApply = function() {
			if(that.selected.x==null||that.selected.y==null) {
				return false;
			}
			if(that.selected.x===that.selected.y) {
				return false;
			}
			chartService.setScatterXY(that.selected);
			var params = {
				xStr:that.selected.x,
				yStr:that.selected.y,
				sheetId:conditionService.getSheetId()
			}
			var deptName = null;
			var deptName2 = null;
			angular.forEach(that.indepts,function(v,e) {
				if(v.index===that.selected.x) {
					var arr1 = v.name.split(':');
					deptName = arr1[1];
				}
				if(v.index===that.selected.y) {
					var arr1 = v.name.split(':');
					deptName2 = arr1[1];
				}
			});

			chartService.scatter(params,{deptName:deptName,deptName2:deptName2});
			that.selected = {
				x:null,
				y:null
			}
			that.show = false;
			$scope.$emit('showWindow',false);
		}
	}
})();