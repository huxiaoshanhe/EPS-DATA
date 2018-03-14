(function() {
	'use strict';
	angular.module('pf.workbook')
	.directive('tool',toolDirective);
	toolDirective.$inject = [];
	function toolDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			controller:['sheetService',function(sheetService) {
				var that = this;
				that.toolCtrl = function(cmd,type) {
					sheetService.toolCtrl(cmd,type);
				}				
			}],
			controllerAs:'tc',
			scope:{data:'=',ctrl:'='},
			link:function(scope,element,attr,tc) {
				scope.$watch('data',function(data) {
					if(!data) {
						return false;
					}
					element.html('');
					createTools(data.childs,data.key);
				});
				
				function createTools(arr,parentName) {
					angular.forEach(arr,function(value,key) {
						if(value.key) {
							if(value.isType) {//图表
								var a = $('<a>').attr('title',value.text).html('<i class="ico ico-'+value.key+'"></i>').click(function() {
									tc.toolCtrl(value.key,parentName);
								}).addClass('chartType');								
							} else if(value.isAttr) {//部分图表属性
								var a = $('<a>').attr('title',value.text).html('<i class="ico ico-'+value.key+'"></i>').click(function() {
									if($(this).hasClass('on')) {
										$(this).removeClass('on');
									} else {
										$(this).addClass('on');
									}
									tc.toolCtrl(value.key,parentName);
								}).addClass('chartAttr');
								if(value.key=='coordinateAxis'||value.key=='legend') {
									a.addClass('on');
								}
							} else {//表格工具栏
								var a = $('<a>').attr('title',value.text).html('<i class="ico ico-'+value.key+'"></i>').click(function() {
									tc.toolCtrl(value.key,parentName);
								});
								switch(value.key) {
									case 'filter':
										if(scope.ctrl.filter!=='') {
											a.addClass('on');
										}
									break;
									default:
										if(scope.ctrl&&scope.ctrl[value.key]==true) {
											a.addClass('on');
										}
									break;
								}
							}
							
						} else {
							var a = $('<a>').addClass('ico ico-'+value.type);
						}
						element.append(a);
					});
				}
				/*scope.$watch('ctrl',function(data) {
					console.log(data);
				});*/
			}
		};
	}
})();