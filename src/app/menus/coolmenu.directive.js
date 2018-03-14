(function() {
	'use strict';
	angular.module('pf.workbook')
	.directive('coolmenu',cooMenuDirective);
	cooMenuDirective.$inject = ['coreCF','sheetService'];
	function cooMenuDirective(config,sheetService) {
		return {
			restrict:'E',
			replace:true,
			template:'<div class="menus"></div>',
			scope:{data:'='},
			link:function(scope,element,attr) {
				scope.$watch('data',function(data) {
					if(!data) {
						return false;
					}
					element.html('');
					creatMenu(data);
				});
				
				function creatMenu(data) {
					angular.forEach(data,function(value,key) {
						var a = $('<a>').text(value.text).click(function() {
							$(this).addClass('current').siblings().removeClass('current');							
							switch(key) {
								case 0:
								scope.$emit('showTable',true);
								config.tabsSwitch.tableShow = true;
								config.tabsSwitch.tableChartShow = false;
								config.tabsSwitch.chartShow = false;
								config.tabsSwitch.mapShow = false;
								break;
								case 1:
								scope.$emit('showTableChart',true);
								config.tabsSwitch.tableShow = false;
								config.tabsSwitch.tableChartShow = true;
								config.tabsSwitch.chartShow = false;
								config.tabsSwitch.mapShow = false;
								sheetService.chartInit();
								break;
								case 2:
								scope.$emit('showChart',true);
								config.tabsSwitch.tableShow = false;
								config.tabsSwitch.tableChartShow = false;
								config.tabsSwitch.chartShow = true;
								config.tabsSwitch.mapShow = false;
								sheetService.chartInit();
								break;
								case 3:
								scope.$emit('showMap',true);
								config.tabsSwitch.tableShow = false;
								config.tabsSwitch.tableChartShow = false;
								config.tabsSwitch.chartShow = false;
								config.tabsSwitch.mapShow = true;
								break;
							}
						});
						
						if(key==0) {
							a.addClass('current');
						}
						element.append(a);	
					});
				}
			}
		};
	}
})();