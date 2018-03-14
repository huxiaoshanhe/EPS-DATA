(function() {
	'use strict';
	angular.module('pf.window')
	.controller('helpCenterCtrl',helpCenterCtrl);
	helpCenterCtrl.$inject = ['$scope','dataService'];
	function helpCenterCtrl($scope,dataService) {
		var that = this;
		that.show = false;
		$scope.$on('showHelp',function(e,data) {
			if(data==true) {
				that.show = true;
			}
		});
		that.hotWords = [
			'跨库搜索',
			'维度设置',
			'行列转置',
			'高亮显示',
			'合并计算',
			'图表显示',
			'数据筛选',
			'条件样式'
		];

		that.hotClick = function(num) {
			that.showDetail = true;
			that.currentKeywords = that.hotWords[num];
			var params = {
				QUESTION_TITLE:that.currentKeywords
			}
			dataService.get('help',params).then(function(data) {
				that.htmls = data.message;
			});			
		}
	}
})();