(function() {
	'use strict';
	angular.module('pf.charts')
	.directive('chartResize',chartResize);
	chartResize.$inject = [];
	function chartResize() {
		return {
			'restrict':'E',
			'replace':true,
			'template':'<div></div>',
			'link':function(scope,element,attr) {
				var a=null;
				var proChartHeight=null;
				var detHeight=null;
				var proTableHeight = null;
				document.onmouseup=function(){
					if(!a)return;
					document.all?a.releaseCapture():window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
					a='';
					scope.chartSize = new Date();
					scope.$emit('tableSize',true);
				};
				document.onmousemove=function (d){
					$('body').css('user-select','none').css('-webkit-user-select','none').css('-moz-user-select','none');
					if(!a) return;
					if(!d) d=event;
					var newChartHeight = $(window).height()-d.pageY;
					var totalHeight = $('#platform').height();
					var newTableHeight = totalHeight - newChartHeight;
					if(newTableHeight<=150) {return false;}//表格最小高度
					if(newChartHeight<=totalHeight/2) {return false;}//图表最小高度
					$('#platform .chartArea').css('height',(newChartHeight-54)+'px');
					$('#platform .tableArea').css('height',newTableHeight+'px');
				};
    			element[0].onmousedown = function(e){
					a=e;
					document.all?a.setCapture():window.captureEvents(Event.MOUSEMOVE);
					proChartHeight = element.parent().height();
					proTableHeight = $('#platform .tableArea').height();
				};
			}
		};
	}
})();