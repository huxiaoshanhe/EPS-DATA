(function() {
	'use strict';
	angular.module('pf.charts')
	.factory('chartService', chartService);

	chartService.$inject = ['dataService','$rootScope','handsontableService', 'conditionService','coreCF']
	function chartService(dataService,$rootScope,handsontableService,conditionService,config) {
		var _chartDatas = null;
		var _chartsType = 'Bar';
		var chartAttrs = ['coordinateAxis','legend'];
		var legendStr = null;
		var xAxisStr = null;
		var _colors = ['#DDDF0D', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'];
		var _isTableChanged = false;
		var _scatterXY = null;
		var _isUserDefined = false;

		return {
			init:chartInit,
			getCharts:getCharts,
			setChartAttr:setChartAttr,
			scatter:scatter,
			getChartType:function(){return _chartsType},
			setDatas:function(data) {_chartDatas = data;},
			userDfined:userDfined,
			getArea:getArea,
			chartData:function() {return _chartDatas},
			setChartType:function(type) {_chartsType = type;},
			getChartAttrs:function() {return chartAttrs;},
			setColors:function(colors) {_colors = colors;},
			getColors:function() {return _colors;},
			changedTable:function(flag) {_isTableChanged = flag;},
			getChangedTable:function() {return _isTableChanged;},
			setScatterXY:function(obj) {_scatterXY = obj},
			getScatterXY:function() {return _scatterXY;},
			getIsUserDefined:function() {return _isUserDefined;}
		};

		function chartInit() {
			_isUserDefined = false;
			var sheetId = config.newSheetId;
			var param = {chartsType:_chartsType,sheetId:sheetId};
			var area = handsontableService.getSelected();			
			if(area) {
				param.p1=area[0]+','+area[1];
				param.p2=area[2]+','+area[3];
			}
			if(_chartsType!='Scatter') {				
				dataService.get('chart',param).then(function(data) {
					_chartDatas = data;
					legendStr = angular.toJson(data.legend.data);
					if(data.xAxis) {
						xAxisStr = angular.toJson(data.xAxis[0].data);
					}
					if(chartAttrs.indexOf('dataValue')!==-1) {
						angular.forEach(_chartDatas.series,function(v,k) {
							v.label={
								normal: {
							        show: true,
							        position: 'insideBottom',
							        distance: 15,
							        align: 'left',
							        verticalAlign: 'middle',
							        rotate: 90,
							        formatter: '{c}',
							        fontSize: 12
							    }
							}
							if(['RotateBar','StackRotateBar','Line','Area'].indexOf(_chartsType)!=-1) {
								v.label.normal.position = 'insideLeft';
								v.label.normal.rotate=0;
							}
						});
					}
					$rootScope.$broadcast('chartData',data);
				});
			}
			dataService.addDataLog(config.cubeId,4);
		}

		function getCharts(key) {
			_isUserDefined = false;
			_chartsType = key;
			var sheetId = config.newSheetId;
			var param = {chartsType:key,sheetId:sheetId};
			var area = handsontableService.getSelected();			
			if(area) {
				param.p1=area[0]+','+area[1];
				param.p2=area[2]+','+area[3];
			}
			dataService.get('chart',param).then(function(data) {
				var commonType = ['Line','Bar','StackLine','Area','StackArea','Bar','StackBar','RotateBar','StackRotateBar'];
				legendStr = angular.toJson(data.legend.data);
				if(data.xAxis) {
					xAxisStr = angular.toJson(data.xAxis[0].data);
				}				
				if(commonType.indexOf(_chartsType)!=-1) {
					if(chartAttrs.indexOf('coordinateAxis')==-1) {
						data.xAxis[0].data = [];
					}
					if(chartAttrs.indexOf('dataValue')!==-1) {
						angular.forEach(_chartDatas.series,function(v,k) {
							v.label={
								normal: {
							        show: true,
							        position: 'insideBottom',
							        distance: 15,
							        align: 'left',
							        verticalAlign: 'middle',
							        rotate: 90,
							        formatter: '{c}',
							        fontSize: 12
							    }
							}
							if(['RotateBar','StackRotateBar','Line','Area'].indexOf(_chartsType)!=-1) {
								v.label.normal.position = 'insideLeft';
								v.label.normal.rotate=0;
							}
						});
					}
				}					
				if(chartAttrs.indexOf('legend')==-1) {
					data.legend.data = [];
				}
				_chartDatas = data;
				$rootScope.$broadcast('chartData',data);
			});
			dataService.addDataLog(config.cubeId,4);
		}

		function userDfined(data,type,legends,xAxis) {
			_chartsType = type;
			_chartDatas = data;
			legendStr = legends;
			xAxisStr = xAxis;
			$rootScope.$broadcast('chartData',data);
			_isUserDefined = true;
		}

		function getArea() {
			var area = handsontableService.getSelected();
			return area;
		}


		function scatter(obj,op) {
			var key = 'Scatter';
			_chartsType = key;
			dataService.get('scatter',obj).then(function(data) {
				var option = {
					    title : {
					        text: op.deptName,
					        x:'center',
				        	y:'bottom',
				        	textStyle:{
				        		fontSize: 14,
							    fontWeight: 'normal',
							    color: '#282828'
				        	}
					    },
					    tooltip : {
					        trigger: 'axis',
					        showDelay : 0,  
					        axisPointer:{
					            show: true,
					            type : 'cross',
					            lineStyle: {
					                type : 'dashed',
					                width : 1
					            }
					        }
					    },
					    legend: {
					        data:op.deptName2,
					        x:'left',
					        y:'15%',
					        itemWidth:0,
					        itemHeight:0,
					        textStyle:{
				        		fontSize: 14,
							    fontWeight: 'bold',
							    color: '#333'
				        	}
					    },
					    toolbox: {
					        show : true,
					        orient : 'vertical',
				        	x: 'right',
				        	y: 'center',
					        feature : {
					            mark : {show: true},
					            saveAsImage : {show: true}
					        }
					    },
					    grid:{
					    	x2: '5%',
						    y2: '15%',
						    x: '10%',
						    y: '20%'
					    },
					    xAxis : [
					        {
					            type : 'value',
					            scale:true,
					            axisLabel : {
					                formatter: '{value}'
					            }
					        }
					    ],
					    yAxis : [
					        {
					            type : 'value',
					            scale:true,
					            axisLabel : {
					                formatter: '{value}'
					            },

					        }
					    ],
					    series:data.series
					};
				$rootScope.$broadcast('chartData',option);
			});
		}

		function setChartAttr(attr) {
			if(_chartsType=='Scatter') {return false;}
			var num = chartAttrs.indexOf(attr);
			if(num==-1) {
				chartAttrs.push(attr);
			} else {
				chartAttrs.splice(num,1);
			}
			var commonType = ['Line','Bar','StackLine','Area','StackArea','Bar','StackBar','RotateBar','StackRotateBar'];
			if(commonType.indexOf(_chartsType)!=-1) {
				if(chartAttrs.indexOf('coordinateAxis')==-1) {
					_chartDatas.xAxis[0].data = [];
				} else {
					_chartDatas.xAxis[0].data = angular.fromJson(xAxisStr);
				}
				if(chartAttrs.indexOf('dataValue')!==-1) {
					angular.forEach(_chartDatas.series,function(v,k) {
						v.label={
							normal: {
						        show: true,
						        position: 'insideBottom',
						        distance: 15,
						        align: 'left',
						        verticalAlign: 'middle',
						        rotate: 90,
						        formatter: '{c}',
						        fontSize: 12
						    }
						}
						if(['RotateBar','StackRotateBar','Line','Area'].indexOf(_chartsType)!=-1) {
							v.label.normal.position = 'insideLeft';
							v.label.normal.rotate=0;
						}
					});
				} else {
					angular.forEach(_chartDatas.series,function(v,k) {
						if(v.label){
							delete v.label;
						}					
					});
				}
			}					
			if(chartAttrs.indexOf('legend')==-1) {
				_chartDatas.legend.data = [];
			} else {
				_chartDatas.legend.data = angular.fromJson(legendStr);
			}
			$rootScope.$broadcast('chartData',_chartDatas);
		}
	}
})();