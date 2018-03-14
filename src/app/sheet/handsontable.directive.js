(function() {
	'use strict';
	angular.module('pf.workbook')
	.directive('handsontable',handsontaleDirective);
	handsontaleDirective.$inject = ['handsontableService','$timeout','errorService','coreCF'];
	function handsontaleDirective(handsontableService,$timeout,errorService,config) {
		return {
			restrict:'E',
			replace:true,
			template:'<div style="width:100%;height:100%;"></div>',
			scope:{'data':'=','size':'='},
			link:function(scope,element,attr) {
				var _handsontable = null;
		        var _father = element.parent();
				$('*').keydown(function(e) {
					e = window.event || e || e.which;
					if((e.ctrlKey) && (e.keyCode==67)){
				          return false;
				          e.returnValue=false;
				    }
				});
				scope.$watch('data',function(data) {
					var _data = data;
					if (!data&&data!='') {
						var htmlStr = '<div style="line-height:26px;padding-top:30px;color:#f00;text-indent:10px;">';
						htmlStr += '<p>EPS数据平台通过多个维度组合来展示数据。若出现查无数据情况，可能存在以下原因：</p>';
						htmlStr += '<p>1.因经济社会发展引起某些指标从某年起不再统计或更名统计；</p>';
						htmlStr += '<p>2.因政策性原因导致某些指标在某年后不再对社会公布；</p>';
						htmlStr += '<p>3.所选维度组合（时间维度、地区维度、指标维度、其他维度）未发生数据统计。例如：某种商品在某一时间在某一地区未发生出口而导致其出口额为空，又如某些南方省份生长的农作物是不会在北方省份出现统计数据的；</p>';
						htmlStr += '<p>4.维度间匹配不正确。例如在指标维度选择的是省级指标，而在地区维度中却选择了地级市导致错配。';
						htmlStr += '</div>';
						element.html(htmlStr);
						scope.loading = false;//关闭遮罩
						return; 
					} if(data=='') {
						return ;
					}
		            var width = _father.innerWidth()-20, height = _father.height()-10;
		            var settings = angular.extend({
		              width: width,
		              height: height,
		            }, handsontableService.settings(data));
		            if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i)=="9."){ 
						settings.rowHeaders = true;
						settings.width=_father.innerWidth();
						_father.css('padding-left','0');
					}
		            // 变更就重新生成
		            if (_handsontable) { _handsontable.destroy(); }
		            _handsontable = new window.Handsontable(element[0], settings);
		            handsontableService.setHandsontable(_handsontable);
		            scope.$on('resizeHandsontable',function(event,data) {
		            	$timeout(function(){
		            		resizeHeight();
		            	},10);
		            });
		            function resizeHeight() {
		            	settings.width = _father.innerWidth()-20;
		            	settings.height = _father.height()-10;
		            	element.height(_father.height()-10);
		            	element.width(_father.innerWidth()-20);
		            	if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i)=="9."){
		            	 	settings.width = _father.innerWidth();
		            		element.width(_father.innerWidth());
		            	}
		            	if(_handsontable) { _handsontable.render(); }
		            }

		            $(window).resize(function() {
		            	resizeHeight();
		            });

		            scope.$watch('size',function(data) {
						resizeHeight();
					});

					changeTableTool();
				});

				function changeTableTool() {
					if(config.basicCtrl.filter=='') {
						$('.tableTool .ico-filter').parent('a').removeClass('on');
					} else {
						$('.tableTool .ico-filter').parent('a').addClass('on');
					}
					if(config.mainCtrl.s5.dealStr=='') {
						$('.tableTool .ico-highLight').parent('a').removeClass('on');
					} else {
						$('.tableTool .ico-highLight').parent('a').addClass('on');
					}
					if(config.mainCtrl.s2.method=='') {
						$('.tableTool .ico-calculate').parent('a').removeClass('on');
					} else {
						$('.tableTool .ico-calculate').parent('a').addClass('on');
					}
					if(config.mainCtrl.s3.index8020=='0') {
						$('.tableTool .ico-8020Analysis').parent('a').removeClass('on');
					} else {
						$('.tableTool .ico-8020Analysis').parent('a').addClass('on');
					}
				}
			}
		};
	}
})();