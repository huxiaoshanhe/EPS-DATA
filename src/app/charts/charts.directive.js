(function() {
	'use strict';
	angular.module('pf.charts')
	.directive('chart',chartsDirective);
	chartsDirective.$inject = ['chartService','$timeout','coreCF'];
	function chartsDirective(chartService,$timeout,config){
		return {
			'restrict':'E',
			'replace':true,
			'template':'<div style="width:100%;height:100%;" class="chartWrap"><div class="imgArea"></div><div class="legendsArea"></div></div>',
			'scope':{'size':'='},
			'link':function(scope,element,attr) {
				var myChart = echarts.init(element[0].children[0]);
				var lengendPosition = 'bottom';
				//监听是否触动下载图片的按钮，在sheetService传递过来
				scope.$on('downloadImage',function(data) {
					var colors = myChart.getOption().color;
					var imgData = myChart.getDataURL();
					var legends = myChart.getOption().legend[0].data;
					var chartAttrs = chartService.getChartAttrs();
					var chartType = chartService.getChartType().toLowerCase();
					var img = new Image();
					img.src = imgData;
					img.onload=function() {
						var c = document.createElement('canvas');
						if(chartType!='scatter') {
							if(lengendPosition=='bottom') {//在底部
								c.width=img.width+100;
								if(chartAttrs.indexOf('legend')!=-1) {//有图例
									var letters = [];
									legends.forEach(function(e) {
										letters.push(e.length);
									});
									var legendItemLength = Math.max.apply(null, letters)*12+30;
									var rows = Math.floor(c.width/legendItemLength);
									c.height = img.height+Math.ceil(legends.length/rows)*30+10;
									
									var cxt=c.getContext("2d");
									cxt.fillStyle = '#fff';
									cxt.fillRect(0,0,c.width,c.height);
									cxt.drawImage(img,0,0);

									var num_x = 0;
									var num_y = 0;
									legends.forEach(function(e,i) {
										if((num_x+1)*legendItemLength+100>(c.width-50)) {
											num_x = 0;
											num_y+=1;
										}
										var index = i%colors.length;
										var bgcolor = colors[index];
										cxt.fillStyle=bgcolor;
										cxt.fillRect(num_x*legendItemLength+80,num_y*30+img.height-50,12,12); 
										cxt.fillStyle='#222';
										cxt.font="12px Arial";
										cxt.fillText(e,num_x*legendItemLength+100,num_y*30+img.height-40);
										num_x +=1;
									});
								} else {//无图例
									c.height = img.height+20;
									var cxt=c.getContext("2d");
									cxt.fillStyle = '#fff';
									cxt.fillRect(0,0,c.width,c.height);
									cxt.drawImage(img,50,0);
								}							
							} else {//在右侧
								if(chartAttrs.indexOf('legend')!=-1) {
									var letters = [];
									legends.forEach(function(e) {
										letters.push(e.length);
									});
									var legendItemLength = Math.max.apply(null, letters)*12+30;
									c.width = img.width+50+legendItemLength;
									if(img.height>(legends.length*30)) {
										c.height = img.height;
									} else {
										c.height = legends.length*30;
									}
									var cxt=c.getContext("2d");
									cxt.fillStyle = '#fff';
									cxt.fillRect(0,0,c.width,c.height);
									cxt.drawImage(img,50,0);

									legends.forEach(function(e,i) {
										var index = i%colors.length;
										var bgcolor = colors[index];
										cxt.fillStyle=bgcolor;
										cxt.fillRect(img.width+50,i*30+40,12,12); 
										cxt.fillStyle='#222';
										cxt.font="12px Arial";
										cxt.fillText(e,img.width+80,i*30+50);
										num_x +=1;
									});

								} else {
									c.width = img.width;
									c.height = img.height;
									var cxt=c.getContext("2d");
									cxt.fillStyle = '#fff';
									cxt.fillRect(0,0,c.width,c.height);
									cxt.drawImage(img,50,0);
								}
							}
						} else {
							c.width = img.width;
							c.height = img.height;
							var cxt=c.getContext("2d");
							cxt.fillStyle = '#fff';
							cxt.fillRect(0,0,c.width,c.height);
							cxt.drawImage(img,50,0);
						}
						
						if(isIE()) {
							var blob = c.msToBlob();
			    			navigator.msSaveBlob(blob, Date.parse(new Date())+'.jpg');
						} else {
							var a = c.toDataURL('image/png');
							var link = document.createElement('a');
					        link.href = a;
					        link.download = Date.parse(new Date())+'.jpg';
					        document.body.appendChild(link);
					        link.click();
					        document.body.removeChild(link);
						}

					}
				});

				//判断用户使用的浏览器是否为IE浏览器
				function isIE(){
					if (!!window.ActiveXObject || 'ActiveXObject' in window){
					    return true;
					}else{
					    return false;
					}
				}

				scope.$on('chartData',function(e,data) {
					if(!data.color) {
						data.color = chartService.getColors();
					}
					myChart = echarts.init(element[0].children[0]);
					myChart.clear();
		        	data.toolbox = {
				        show: true,
				        orient: 'vertical',
				        left: 'right',
				        top: 'center',
				        feature: {}
				    }
					var menuKey = chartService.getChartType().toLowerCase();
		            if(menuKey!='scatter') {
			            data.tooltip.trigger = 'item';		        
			            myChart = echarts.init(element[0].children[0]);			            
			            var chartAttrs = chartService.getChartAttrs();
			            data.legend.show = false;
			            if(chartAttrs.indexOf('legend')!==-1) {
			            	if(['pie','ring'].indexOf(menuKey)==-1) {
			            		data.legend.data = repeatDeal(data.legend.data);//指标名称重复处理
						        var divLegends = $('<div class="chartLegends"></div>');
						        if(data.lengendPosition!='right') {
						        	lengendPosition = 'bottom';
						        	data.grid = {top:30,bottom:90,right:100,left:100};
						        	$('.legendsArea').removeClass('right').addClass('bottom');
						        } else {
						        	lengendPosition = 'right';
						        	data.grid = {top:30,bottom:20,right:300,left:100};
						        	$('.legendsArea').removeClass('bottom').addClass('right');
						        }
						        angular.forEach(data.legend.data,function(i, l){
					        		var num = l%data.color.length;
				                	var color = data.color[num];
				                	var labelLegend = $('<label class="legend">' + '<span class="label" style="background-color:'+color+'"></span>'+i+'</label>');
				                	divLegends.append(labelLegend);
				            	});
				            	$('.legendsArea').html(divLegends);
			            	} else {
			            		$('.legendsArea').html('');
			            	}				        	
				        } else {
			            	data.grid = {top:30,bottom:30,right:100,left:100};
				        	$('.legendsArea').html('');
				        }
				        
				        
			        	if(['line','bar','rotatebar','stackbar','stackrotatebar','area'].indexOf(menuKey)!==-1) {
			        		angular.forEach(data.series,function(v,k) {
			        			/*if(data.legend.data[k]) {
			        				v.name = data.legend.data[k].name;
			        			}	*/
			        			if(v.type=='bar') {
				        			v.barMaxWidth = 30; 
				        		}
				        		if(chartService.getChartAttrs().indexOf('dataValue')!==-1) {
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
									if(['rotatebar','stackrotatebar','line','area'].indexOf(menuKey)!=-1) {
										v.label.normal.position = 'insideLeft';
										v.label.normal.rotate=0;
									}
				        		}
				        		
			        		});
			        	}else if(['pie','ring'].indexOf(menuKey)!=-1){
			        		data.series[0].center = ['50%','50%'];
			        		data.title.x='center';
			        	}else if(['fillradar','radar'].indexOf(menuKey)!=-1) {
			        		if(lengendPosition == 'right') {
			        			data.polar[0].center = ['45%','50%'];
			        		} else {
			        			data.polar[0].center = ['50%','45%'];
			        		}
			        	}
			        	if(data.xAxis) {
			        		data.xAxis[0].axisLabel = {show:true,interval:'auto'};
			        	}
			        	if(data.yAxis) {
			        		data.yAxis[0].axisLabel = {show:true,interval:'auto'};
			        	}			        	
		        	} else {
		        		$('.legendsArea').html('');
		        		data.tooltip.trigger = 'none';
		        		data.legend.show = false;
		        		data.title.show = false;
		        		data.xAxis = {
					        type: 'value',
					        name: data.title.text,
					        nameLocation: 'middle',
					        nameGap: 25					        
					    };
		        		data.yAxis = {
							type: 'value',
							name: data.legend.data,
							nameLocation: 'middle',
							nameRotate:'90',
							nameGap: 45,			        
					    };
					    data.series[0].name='';
		        	}
			        myChart.setOption(data);
		            var chartAttrs = chartService.getChartAttrs();
		            if(chartAttrs.indexOf('dataValue')==-1) {
		            	$('.chartTool .ico-dataValue').parent('.chartAttr').removeClass('on');
		            } else {
		            	$('.chartTool .ico-dataValue').parent('.chartAttr').addClass('on');
		            }
		            if(chartAttrs.indexOf('legend')==-1) {
		            	$('.chartTool .ico-legend').parent('.chartAttr').removeClass('on');
		            } else {
		            	$('.chartTool .ico-legend').parent('.chartAttr').addClass('on');
		            }
				});

				
				scope.$on('resizeHandsontable',function(event,data) {
	            	$timeout(function(){
	            		myChart.resize();
	            	},10);
	            });
				$(window).resize(function() {
					myChart.resize();
				});

				scope.$watch('size',function(data) {
					myChart.resize();
				});

				function repeatDeal(arr) {
					for(var i=0;i<arr.length;i++) {
						var a = 0;
						for(var j=i+1;j<arr.length;j++) {
							if(arr[i]==arr[j]) {
								a=a+1;
								arr[j]=arr[j]+'('+a+')';
							}
						}
					}
					return arr;
				}

			}
		};
	}
})();