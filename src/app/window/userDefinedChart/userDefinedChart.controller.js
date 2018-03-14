(function() {
	'use strict';
	angular.module('pf.window')
	.controller('userDefinedChartCtrl',userDefinedChartCtrl);
	userDefinedChartCtrl.$inject = ['$scope', 'dispatchService','chartService','dataService','conditionService','coreCF','handsontableService'];
	function userDefinedChartCtrl($scope, dispatchService,chartService,dataService,conditionService,config,handsontableService) {
		var that = this;
		var proCubId = 	config.cubeId;//用于当切换库后，是否需要初始化序列，即是否需要请求后台
		that.showlegend = true;//默认显示图例
		var chartColors = chartService.getColors();//图例颜色
		that.currentOrderNum = 0;//当前进行自定义的序列，默认第一条
		//that.orderList：所有序列
		//that.selectedType2 参与自定义的序列
		that.typeList = [
			{name:'line',title:'折线图'},
			{name:'bar',title:'柱状图'},
			{name:'rotatebar',title:'条形图'},
			{name:'stackbar',title:'堆积柱状图'},
			{name:'stackrotatebar',title:'堆积条形图'},
			{name:'area',title:'面积图'},
			{name:'pie',title:'饼图'},
			{name:'radar',title:'雷达图'},
			{name:'mixed',title:'Mixed Chart'}
		];
		that.secondTypeList = [
			{name:'line',title:'折线图'},
			{name:'bar',title:'柱状图'}
		];
		that.orderList = null;
		$scope.$on('showDfinedChart',function(e,data) {
			that.show = true;
			var sheetId = config.newSheetId;
			that.chartsType = chartService.getChartType();
			var param  = {chartsType:'Bar',sheetId:sheetId};
			var area = handsontableService.getSelected();	
			var isTableChanged = chartService.getChangedTable();		
			if(area) {
				param.p1=area[0]+','+area[1];
				param.p2=area[2]+','+area[3];
			}
			//序列已存在，并且不是饼图、环形图、雷达图、填充雷达图中的一种，并且没有切换库，并且没有更新数据维度的情况下，不请求后端
			if(that.orderList&&that.chartsType!='Pie'&&that.chartsType!='Radar'&&proCubId==config.cubeId&&isTableChanged!=true) {
				angular.forEach(that.orderList,function(v,k) {
					var num = k%11;
					v.color = chartColors[num];
				});

				that.selectedOrder = {
					name:that.orderList[0].name,
					index:0
				}
				that.currentOrderNum = 0;
				if(!that.selectedType) {
					that.selectedType = {name:that.orderList[0].type,title:getTypeTitle(that.orderList[0].type)};
				}				
				if(!that.selectedType2) {
					that.selectedType2 = [{index:0,name:that.orderList[0].type,title:getTypeTitle(that.orderList[0].type),color:that.orderList[0].color,isSecond:that.orderList[0].yAxisIndex}];
				}
				that.currentOrder = that.selectedType2[0];
			} else {//请求后端，获取使用柱状图的数据
				dataService.get('chart',param).then(function(data) {
					that.initData = data;
					that.orderList = data.series;
					angular.forEach(that.orderList,function(v,k) {
						var num = k%11;
						v.color = chartColors[num];
					});
					that.selectedOrder = {
						name:data.series[0].name,
						index:0
					}
					that.selectedType = {name:data.series[0].type,title:getTypeTitle(data.series[0].type)};
					that.selectedType2 = [{index:0,name:data.series[0].type,title:getTypeTitle(data.series[0].type),color:data.series[0].color}];
					that.currentOrder = that.selectedType2[0];
					that.currentOrderNum = 0;
				});
			}
			proCubId=config.cubeId;//请求成功后，把本控制器使用的库id同步成当前库id
			$scope.$apply();
		});

		that.colors = dispatchService.getColorBox();//颜色盒
		that.lengendPosition = [
			{name:'bottom',title:'底部'},
			{name:'right',title:'右边'}
		];
		that.selectedPosition = {
			name:'bottom',
			title:'底部'
		};
		that.selectPosition = function(name,title) {
			that.selectedPosition.name = name;
			that.selectedPosition.title = title;
		}

		that.selectType = function(name,title) {
			if(name!='mixed') {
				that.selectedType.name = name;
			} else {
				that.selectedType.name = 'bar';
			}
			that.selectedType.title = title;
			if(name=='line'||name=='bar') {
				angular.forEach(that.selectedType2,function(v,k) {
					v.name = name;
					v.title = title;
				});
				that.currentOrder.name = name;
				that.currentOrder.title = title;
			}
		}

		//对当前被选中的自定义的序列进行选择图表类型
		that.selectType2 = function(name,title) {
			var keepGoing = true;
			var isHasThis = false;
			angular.forEach(that.selectedType2,function(v,k) {
				if(keepGoing) {
					if(v.index==that.currentOrderNum) {
						keepGoing = false;
						v.name = name;
						v.title = title;
						isHasThis = true;
						that.currentOrder = v;
					}
				}
			});
			if(name=='line') {
				that.showLine = true;
			} else {
				that.showLine = false;
			}
			if(title!==that.selectedType.title) {
				that.selectedType.title = 'Mixed chart';
			}
		}

		//选择需要自定义的序列
		that.selectOrder = function(name,num) {
			that.selectedOrder = {
				name:name,
				index:num
			}
			if(!hasThisOrder(num)) {//当前序列不在自定义序列中
				var obj = {
					index:num,
					name:that.orderList[num].type,
					title:getTypeTitle(that.orderList[num].type),
					color:that.orderList[num].color
				}
				that.selectedType2.push(obj);
				that.currentOrder = obj;
				that.currentOrderNum = that.selectedType2.length-1;			
			} else {//当前序列已在自定义序列中
				var keepGoing = true;
				angular.forEach(that.selectedType2,function(v,k) {
					if(keepGoing) {
						if(v.index==that.currentOrderNum) {
							keepGoing = false;
							that.currentOrder = v;
						}
					}
				});
			}
			//线条颜色和填充颜色切换
			if(that.orderList[num].type=='line') {
				that.showLine = true;
			} else {
				that.showLine = false;
			}
		}

		that.selectSecondXAxis = function(flag) {
			if(that.selectedType.title!=='Mixed chart') {
				return false;
			}
			var keepGoing = true;
			angular.forEach(that.selectedType2,function(v,k) {
				if(keepGoing) {
					if(v.index==that.currentOrderNum) {
						v.isSecond = flag;
						that.currentOrder = v;
						keepGoing = false;
					}
				}
			});
		}

		//选择填充颜色或线条颜色
		that.selectColor = function(color) {
			that.selectedType2[that.currentOrderNum].color = color;
		}


		that.goApply = function() {
			var area = chartService.getArea();
			var sheetId = null;
			sheetId = config.newSheetId;
			var params = {
				sheetId:sheetId,
				p1:area[0]+','+area[1],
				p2:area[2]+','+area[3],
				chartsType:getChartType()
			}
			dataService.get('chart',params).then(function(data) {
				var num = that.selectedOrder.index;
				var arr = ['line','bar','area'];
				var option = data;
				var legendStr = angular.toJson(data.legend.data);
				var xAxisStr=null; 
				if(params.chartsType!=='Pie'&&params.chartsType!=='Radar') {
					xAxisStr = angular.toJson(data.xAxis[0].data);
				}
				option.lengendPosition = that.selectedPosition.name;
				var secondNums = [];
				if(that.selectedType.title=='Mixed chart') {
					angular.forEach(that.selectedType2,function(v,k) {
						var num = v.index;
						data.series[num].type = v.name;
						chartColors[num] = v.color;					
						if(v.isSecond) {
							secondNums = secondNums.concat(data.series[num].data);
							option.series[num].yAxisIndex = 1;
						}
					});
					if(secondNums.length>0) {
						option.yAxis[1] = {
				            type: 'value',
				            min: getMin(secondNums),
				            max: getMax(secondNums),
				            axisLabel: {
				                formatter: '{value}'
				            }
				        }
					}				
				} else {
					angular.forEach(that.selectedType2,function(v,k) {
						var num = v.index;
						chartColors[num] = v.color;
					});
				}
				

				that.orderList = data.series;
				option.color = chartColors;
				option.title =  {
			        left: 'center',
			        text: that.chartName
			    };
				if(!that.showGrid) {
					if(getChartType()!='Pie'&&getChartType()!='Radar') {
						angular.forEach(option.yAxis,function(v,k) {
							v.splitLine = {show:false};
							v.splitArea = {show:false};
						});
						option.xAxis[0].splitLine = {show:false};
						option.xAxis[0].splitArea = {show:false};
					}					
				}
				if(that.selectedBgColor) {
					option.backgroundColor=that.selectedBgColor;
				}			
	            if(!that.showlegend) {
	            	option.legend.data = [];
	            }
	            if(that.showDataLabel) {
	            	chartService.setChartAttr('dataValue');	            	
	            }
				chartService.userDfined(option,params.chartsType,legendStr,xAxisStr);
	            chartService.changedTable(false);
	            dataService.addDataLog(config.cubeId,4);
	            that.show = false;
				$scope.$emit('showWindow',false);
			});
		}


		function hasThisOrder(index) {
			var keepGoing = true;
			var result = false;
			angular.forEach(that.selectedType2,function(v,k) {
				if(keepGoing) {
					if(v.index==index) {
						result = true;
						that.currentOrderNum = index;
						keepGoing = false;
					}
				}
			});
			return result;
		}


		function getTypeTitle(name) {
			var keepGoing = true;
			var title = null;
			angular.forEach(that.typeList,function(v,k) {
				if(keepGoing) {
					if(v.name==name) {
						title = v.title;
						keepGoing = false;
					}
				}
			});
			return title;
		}

		function getChartType() {
			var type = null;
			switch(that.selectedType.name) {
				case 'line':
					type = 'Line';
					break;
				case 'bar':
					type = 'Bar';
					break;
				case 'rotatebar':
					type = 'RotateBar';
					break;
				case 'stackbar':
					type = 'StackBar';
					break;	
				case 'stackrotatebar':
					type = 'StackRotateBar';
					break;
				case 'area':
					type = 'Area';
					break;
				case 'pie':
					type = 'Pie';
					break;
				case 'radar':
					type = 'Radar';
					break;
				default:
					type = 'Line';
					break;
			}
			return type;
		}

		function getMin(arr) {
			angular.forEach(arr,function(v,k) {
				if(v=='-') {
					arr[k]=0;
				}
			});
			var min_a = Math.min.apply(null, arr);
			if(min_a>0) {
				return 0;
			} else {
				return min_a;
			}
		}
		function getMax(arr) {
			angular.forEach(arr,function(v,k) {
				if(v=='-') {
					arr[k]=0;
				}
			});
			var max_a = Math.max.apply(null, arr);
			return max_a;
		}

		function getColor() {
			if(that.selectedType2.name==='line') {
				return that.selectedLineColor;
			} else {
				return that.selectedFillColor;
			}
		}
	}
})();