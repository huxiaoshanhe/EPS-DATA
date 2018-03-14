(function() {
	'use strict';
	angular
    	.module('pf.core')
    	.factory('dispatchService', dispatchService);

    dispatchService.$inject = [];
    function dispatchService() {
    	var menuData = [
		    {'key': 'table', 'text': '表格', 'childs': [
		      {'key':'folder', 'text': '打开报表…'},
		      {'key':'save', 'text': '另存为…'},
		      {'key':'refresh', 'text': '刷新'},
		      {'type': 'line'},
		      {'key':'downloadDoc', 'text': '下载excel文档'},
		      //{'key':'downloadPdf', 'text': '下载pdf文档'},
		      {'type': 'line'},
		      {'key':'rotate', 'text': '转置表格'},
		      {'key':'filter', 'text': '筛选'},
		      {'key':'highLight', 'text': '高亮显示…'},
		      {'key':'formatConditions', 'text': '条件样式'},
		      {'key':'calculate', 'text': '合并计算'},
		      {'key':'8020Analysis', 'text': '80/20分析'},
		      /*{'key':'lags', 'text': '滞后'},
		      {'key':'growthRates', 'text': '增长率'},
		      {'key':'log', 'text': '对数'},*/
		      /*{'key':'userDefinedFn', 'text': '自定义函数'},*/
		      {'type': 'line'},
		      {'key':'routineMode', 'text': '常规模式'},
		      {'key':'moneyStyle', 'text': '货币格式'},
		      {'key':'percentStyle', 'text': '百分比格式'},
		      {'key':'delimitStyle', 'text': '分隔符格式'},
		      {'key':'addPoint', 'text': '增加小数点'},
		      {'key':'decreasePoint', 'text': '减少小数点'}
		    ]},
		    {'key': 'table-chart', 'text': '表格/图表'},
		    {'key': 'chart', 'text': '图表', 'childs': [
		      {'key': 'Line', 'text': '折线图','isType':true},
		      {'key': 'Bar', 'text': '柱形图','isType':true},
		      {'key': 'RotateBar', 'text': '条形图','isType':true},
		      {'key': 'StackBar', 'text': '堆积柱形图','isType':true},
		      {'key': 'StackRotateBar', 'text': '堆积条形图','isType':true},
		      {'key': 'Area', 'text': '面积图','isType':true},
		      {'key': 'Pie', 'text': '饼图','isType':true},
		      {'key': 'Ring', 'text': '环形图','isType':true},
		      {'key': 'Radar', 'text': '雷达图','isType':true},
		      {'key': 'FillRadar', 'text': '填充雷达图','isType':true},
		      {'key': 'Scatter', 'text': '散点图','isType':true},
		      {'key': 'dataValue', 'text': '数据值标签','isAttr':true},
		      {'key': 'legend', 'text': '图例','isAttr':true},
		      {'key': 'userDefinedChart', 'text': '自定义图表','isAttr':true},
		      {'key':'downloadImage','text':'下载图片'}
		    ]},
		    {'key': 'map', 'text': '地图',childs:[
		      /*{'key':'folder', 'text': '打开报表…'},
		      {'key':'save', 'text': '另存为…'},
		      {'key':'refresh', 'text': '刷新'},
		      {'type': 'line'},*/
		      {'key':'downloadDoc', 'text': '下载excel文档'},
		      {'key':'downloadPdf', 'text': '下载pdf文档'},
		      {'key':'downloadMapImage','text':'下载图片'}
		    ]}
		];

		var colorBox = {
			commonUseColor:['#ffffff','#000000','#EEECE1','#1F497D','#4F81BD','#C0504D','#9BBB59','#8064A2','#4BACC6','#F79646'],
			colorList:[
				['#F2F2F2','#D8D8D8','#BFBFBF','#A5A5A5','#7F7F7F'],
				['#7F7F7F','#595959','#3F3F3F','#262626','#0C0C0C'],
				['#DDD9C3','#C4BD97','#938953','#494429','#1D1B10'],
				['#C6D9F0','#8DB3E2','#548DD4','#17365D','#0F243E'],
				['#DBE5F1','#B8CCE4','#95B3D7','#366092','#244061'],
				['#F2DCDB','#E5B9B7','#D99694','#953734','#632423'],
				['#EBF1DD','#D7E3BC','#C3D69B','#76923C','#4F6128'],
				['#4F6128','#CCC1D9','#B2A2C7','#5F497A','#3F3151'],
				['#DBEEF3','#B7DDE8','#92CDDC','#31859B','#205867'],
				['#FDEADA','#FBD5B5','#FAC08F','#E36C09','#974806']
			],
			otherColor:['#C00000','#FF0000','#FFC000','#FFFF00','#92D050','#00B050','#00B0F0','#0070C0','#002060','#7030A0']
		};
    	var service = {
	    	'getCoolMenu': function(){ return menuData; },
	    	'getColorBox': function(){ return colorBox;}
	    };
	    return service;


    }
})();