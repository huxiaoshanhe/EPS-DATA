(function() {
	'use strict';
	angular.module('pf.window')
	.controller('infomationCtrl',infomationCtrl);
	infomationCtrl.$inject = ['$scope','$http','coreCF'];
	function infomationCtrl($scope,$http,config) {
		var that = this;
		that.show = false;
		$scope.$on('showInfomation',function(e,data) {
			that.show = true;
			$http.get(config.baseUrl+config.urlMap.getInfomation+'/'+data.type+'/'+config.cubeId+'/'+data.code).then(function(response) {
				var result = response.data
				that.title = null;
				that.indicator =null;
				that.region = null;
				that.time = null;
				that.industry = null;
				that.classify = null;
				that.country = null;
				that.commodity = null;
				that.booth = null;
				that.entnature = null;
				that.markey = null;
				that.sex = null;
				switch(data.type) {
					case 'indicator':
						that.title = '指标信息';
						that.indicator = result;
					break;
					case 'region':
						that.title = '地区信息';
						that.region = result;
					break;
					case 'time':
						that.title = '时间信息';
						that.time = result;
					break;
					case 'industry':
						that.title = '行业信息';
						that.industry = result;
					break;
					case 'classify':
						that.title = '分类信息';
						that.classify = result;
					break;
					case 'country':
						that.title = '国家信息';
						that.country = result;
					break;
					case 'commodity':
						that.title = '商品信息';
						that.commodity = result;
					break;
					case 'booth':
						that.title = '摊位信息';
						that.booth = result;
					break;
					case 'entnature':
						that.title = '企业信息';
						that.entnature = result;
					break;
					case 'markey':
						that.title = '市场信息';
						that.markey = result;
					break;
					case 'sex':
						that.title = '性别信息';
						that.sex = result;
					break;
				}
			});
			$scope.$apply();
		});	
	}
})();