(function() {
	'use strict';

	angular.module('pf.charts')
	.directive('map',mapDirective);

	mapDirective.$inject = ['dimensionsService','dataService','coreCF','$timeout'];
	function mapDirective(dimensionsService,dataService,config,$timeout) {
		return {
			restrict:'E',
			replace:true,
			template:'<div height="100%"></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				scope.$on('mapDownload',function(e,data) {
					if(element.text()=='未获取到相关的地图数据') {
						return false;
					}
					var imageData = null;
					
					html2canvas(element[0], {
			            onrendered: function (canvas) {
			            	imageData = canvas.toDataURL("png");
			                var formStr = '<form method="post" target="_blank" action="'+config.loginUrl+config.urlMap.mapDownload+'">';
			                formStr += '<input name="cubeId" type="text" value="'+config.cubeId+'" />';
			                formStr += '<input name="exportType" type="text" value="'+data.type+'" />';
			                formStr += '<input name="indicatorCode" type="text" value="'+config.mapDims.indicatorCode[0]+'" />';
			                formStr += '<input name="imageData" type="text" value="'+imageData+'" />';
			                formStr += '<input name="timeCode" type="text" value="'+config.mapDims.timeCode[0]+'" />';
			                if(config.mapDims.countrySCode&&config.mapDims.countrySCode[0]){formStr += '<input name="countrySCode" type="text" value="'+config.mapDims.countrySCode[0]+'" />'};
			                if(config.mapDims.market_code&&config.mapDims.market_code[0]){formStr += '<input name="market_code" type="text" value="'+config.mapDims.market_code[0]+'" />'};
			                if(config.mapDims.classify_code&&config.mapDims.classify_code[0]){formStr += '<input name="classify_code" type="text" value="'+config.mapDims.classify_code[0]+'" />'};
			                if(config.mapDims.industryCode&&config.mapDims.industryCode[0]){formStr += '<input name="industryCode" type="text" value="'+config.mapDims.industryCode[0]+'" />'};
			                if(config.mapDims.commodityCode&&config.mapDims.commodityCode[0]){formStr += '<input name="commodityCode" type="text" value="'+config.mapDims.commodityCode[0]+'" />'};
			                if(config.mapDims.booth_code&&config.mapDims.booth_code[0]){formStr += '<input name="booth_code" type="text" value="'+config.mapDims.booth_code[0]+'" />'};
			                var form = $(formStr);
			                form.appendTo('body');
        					form.css('display','none');
						    form.submit();
						    form.remove();
			            }
			        });
				});
				
				var myChart = null;
				scope.$watch('data',function(data) {
					if(!data) {
						return false;
					}					
					var chart = data.endMapBO;
					if(chart.mapBOList.length==0) {
            			chart.mapBOList = [];
            			chart.allMaxVal='';
						chart.allMinVal='';
						data.baseColor = '#ffffff';
            		} else if(chart.mapBOList.length==1) {
            			chart.allMinVal = 0;
            		}         		
					myChart = echarts.init(element[0]);
                	if(config.mapType==2) { 
                		var uploadedDataURL =  'assets/data-1493103622881-SyJGN_hCl.json';             		
	                	$.get(uploadedDataURL, function(d) {
	                		echarts.registerMap('china', d);
	                		var option = {
	                			title: {
							        text: data.mapTitle,
							        left: 'left',
							        textStyle:{
							        	fontSize:'12px'
							        }
							    },
							    tooltip: {
							        trigger: 'item'
							    },
							    visualMap: {
							        seriesIndex: 0,
							        min: chart.allMinVal,
							        max: chart.allMaxVal,
							        left: 'left',
							        top: 'bottom',
							        text: ['高','低'],           // 文本，默认为数值文本
							        calculable: true,
							        inRange: {
	                					color: [ '#ffffff',data.baseColor]
	            					}
							    },
							    series: [
							        {
							            zlevel: 1,
							            name: data.timeName,
							            type: 'map',
							            mapType: 'china',
							            roam: true,
							            left: 'center',
							            label: {normal: {show: true},emphasis: {show: true}},
							            data:chart.mapBOList
							        }
							    ]
							};
							myChart.setOption(option);
	                	});
	                	
		            } else if(config.mapType==1) {
		            	var nameMap = {
						    'Afghanistan':'阿富汗',
							'Singapore':'新加坡',
						    'Angola':'安哥拉',
						    'Albania':'阿尔巴尼亚',
						    'United Arab Emirates':'阿联酋',
						    'Argentina':'阿根廷',
						    'Armenia':'亚美尼亚',
						    'French Southern and Antarctic Lands':'法属南半球和南极领地',
						    'Australia':'澳大利亚',
						    'Austria':'奥地利',
						    'Azerbaijan':'阿塞拜疆',
						    'Burundi':'布隆迪',
						    'Belgium':'比利时',
						    'Benin':'贝宁',
						    'Burkina Faso':'布基纳法索',
						    'Bangladesh':'孟加拉国',
						    'Bulgaria':'保加利亚',
						    'The Bahamas':'巴哈马',
						    'Bosnia and Herzegovina':'波斯尼亚和黑塞哥维那',
						    'Belarus':'白俄罗斯',
						    'Belize':'伯利兹',
						    'Bermuda':'百慕大',
						    'Bolivia':'玻利维亚',
						    'Brazil':'巴西',
						    'Brunei':'文莱',
						    'Bhutan':'不丹',
						    'Botswana':'博茨瓦纳',
						    'Central African Republic':'中非共和国',
						    'Canada':'加拿大',
						    'Switzerland':'瑞士',
						    'Chile':'智利',
						    'China':'中国',
						    'Ivory Coast':'象牙海岸',
						    'Cameroon':'喀麦隆',
						    'Democratic Republic of the Congo':'刚果民主共和国',
						    'Republic of the Congo':'刚果共和国',
						    'Colombia':'哥伦比亚',
						    'Costa Rica':'哥斯达黎加',
						    'Cuba':'古巴',
						    'Northern Cyprus':'北塞浦路斯',
						    'Cyprus':'塞浦路斯',
						    'Czech Republic':'捷克共和国',
						    'Germany':'德国',
						    'Djibouti':'吉布提',
						    'Denmark':'丹麦',
						    'Dominican Republic':'多明尼加共和国',
						    'Algeria':'阿尔及利亚',
						    'Ecuador':'厄瓜多尔',
						    'Egypt':'埃及',
						    'Eritrea':'厄立特里亚',
						    'Spain':'西班牙',
						    'Estonia':'爱沙尼亚',
						    'Ethiopia':'埃塞俄比亚',
						    'Finland':'芬兰',
						    'Fiji':'斐',
						    'Falkland Islands':'福克兰群岛',
						    'France':'法国',
						    'Gabon':'加蓬',
						    'United Kingdom':'英国',
						    'Georgia':'格鲁吉亚',
						    'Ghana':'加纳',
						    'Guinea':'几内亚',
						    'Gambia':'冈比亚',
						    'Guinea Bissau':'几内亚比绍',
						    'Equatorial Guinea':'赤道几内亚',
						    'Greece':'希腊',
						    'Greenland':'格陵兰',
						    'Guatemala':'危地马拉',
						    'French Guiana':'法属圭亚那',
						    'Guyana':'圭亚那',
						    'Honduras':'洪都拉斯',
						    'Croatia':'克罗地亚',
						    'Haiti':'海地',
						    'Hungary':'匈牙利',
						    'Indonesia':'印尼',
						    'India':'印度',
						    'Ireland':'爱尔兰',
						    'Iran':'伊朗',
						    'Iraq':'伊拉克',
						    'Iceland':'冰岛',
						    'Israel':'以色列',
						    'Italy':'意大利',
						    'Jamaica':'牙买加',
						    'Jordan':'约旦',
						    'Japan':'日本',
						    'Kazakhstan':'哈萨克斯坦',
						    'Kenya':'肯尼亚',
						    'Kyrgyzstan':'吉尔吉斯斯坦',
						    'Cambodia':'柬埔寨',
						    'South Korea':'韩国',
						    'Kosovo':'科索沃',
						    'Kuwait':'科威特',
						    'Laos':'老挝',
						    'Lebanon':'黎巴嫩',
						    'Liberia':'利比里亚',
						    'Libya':'利比亚',
						    'Sri Lanka':'斯里兰卡',
						    'Lesotho':'莱索托',
						    'Lithuania':'立陶宛',
						    'Luxembourg':'卢森堡',
						    'Latvia':'拉脱维亚',
						    'Morocco':'摩洛哥',
						    'Moldova':'摩尔多瓦',
						    'Madagascar':'马达加斯加',
						    'Mexico':'墨西哥',
						    'Macedonia':'马其顿',
						    'Mali':'马里',
						    'Myanmar':'缅甸',
						    'Montenegro':'黑山',
						    'Mongolia':'蒙古',
						    'Mozambique':'莫桑比克',
						    'Mauritania':'毛里塔尼亚',
						    'Malawi':'马拉维',
						    'Malaysia':'马来西亚',
						    'Namibia':'纳米比亚',
						    'New Caledonia':'新喀里多尼亚',
						    'Niger':'尼日尔',
						    'Nigeria':'尼日利亚',
						    'Nicaragua':'尼加拉瓜',
						    'Netherlands':'荷兰',
						    'Norway':'挪威',
						    'Nepal':'尼泊尔',
						    'New Zealand':'新西兰',
						    'Oman':'阿曼',
						    'Pakistan':'巴基斯坦',
						    'Panama':'巴拿马',
						    'Peru':'秘鲁',
						    'Philippines':'菲律宾',
						    'Papua New Guinea':'巴布亚新几内亚',
						    'Poland':'波兰',
						    'Puerto Rico':'波多黎各',
						    'North Korea':'北朝鲜',
						    'Portugal':'葡萄牙',
						    'Paraguay':'巴拉圭',
						    'Qatar':'卡塔尔',
						    'Romania':'罗马尼亚',
						    'Russia':'俄罗斯',
						    'Rwanda':'卢旺达',
						    'Western Sahara':'西撒哈拉',
						    'Saudi Arabia':'沙特阿拉伯',
						    'Sudan':'苏丹',
						    'South Sudan':'南苏丹',
						    'Senegal':'塞内加尔',
						    'Solomon Islands':'所罗门群岛',
						    'Sierra Leone':'塞拉利昂',
						    'El Salvador':'萨尔瓦多',
						    'Somaliland':'索马里兰',
						    'Somalia':'索马里',
						    'Republic of Serbia':'塞尔维亚',
						    'Suriname':'苏里南',
						    'Slovakia':'斯洛伐克',
						    'Slovenia':'斯洛文尼亚',
						    'Sweden':'瑞典',
						    'Swaziland':'斯威士兰',
						    'Syria':'叙利亚',
						    'Chad':'乍得',
						    'Togo':'多哥',
						    'Thailand':'泰国',
						    'Tajikistan':'塔吉克斯坦',
						    'Turkmenistan':'土库曼斯坦',
						    'East Timor':'东帝汶',
						    'Trinidad and Tobago':'特里尼达和多巴哥',
						    'Tunisia':'突尼斯',
						    'Turkey':'土耳其',
						    'United Republic of Tanzania':'坦桑尼亚',
						    'Uganda':'乌干达',
						    'Ukraine':'乌克兰',
						    'Uruguay':'乌拉圭',
						    'United States of America':'美国',
						    'Uzbekistan':'乌兹别克斯坦',
						    'Venezuela':'委内瑞拉',
						    'Vietnam':'越南',
						    'Vanuatu':'瓦努阿图',
						    'West Bank':'西岸',
						    'Yemen':'也门',
						    'South Africa':'南非',
						    'Zambia':'赞比亚',
						    'Zimbabwe':'津巴布韦'
						};

						var option = {
						    timeline: {
						        axisType: 'category',
						            orient: 'vertical',
						            autoPlay: true,
						            inverse: true,
						            playInterval: 5000,
						            left: null,
						            right: -105,
						            top: 20,
						            bottom: 20,
						            width: 46 
						    },
						    baseOption: {
						        visualMap: {
						        	min:chart.allMinVal,
						            max: chart.allMaxVal,
						            calculable: true,
						            inRange: {
						                color: ['#ffffff', data.baseColor]
						            }
						        },
						        title: {
							        text: data.mapTitle,
							        left: 'left',
							        textStyle:{
							        	fontSize:'12px'
							        }
							    },
							    tooltip: {
							        trigger: 'item',
							        formatter: function (params) {
							        	var value = (params.value + '').split('.');
							            value = value[0];
							            if(params.name!='') {
							            	return  params.name + ' : ' + value;
							            } else {
							            	return null;
							            }							            
							        }
							    },
						        series: [{
						            type: 'map',
						            mapType: 'world',
						            nameMap: nameMap,
						            roam: true,
						            //label:{normal:{show:true}},
						            itemStyle:{
						                emphasis:{label:{show:false}}
						            },
						            data: chart.mapBOList
						        }]
						    }
						};	
						myChart.setOption(option);						
		            }

		                	
	                scope.$on('resizeHandsontable',function(event,data) {
		            	$timeout(function(){
		            		myChart.resize();
		            	},10);
		            });
		            $(window).resize(function() {
		            	myChart.resize();
		            });
		            scope.$on('downloadMapImage',function(data) {
		            	if(element.text()=='未获取到相关的地图数据') {
							return false;
						}
						if(isIE()) {
							var canvas =element[0].children[0].children[1];
							var blob = canvas.msToBlob();
	    					navigator.msSaveBlob(blob, Date.parse(new Date())+'.jpg');
						} else {
							var src = myChart.getDataURL();
							var link = document.createElement('a');
					        link.href = src;
					        link.download = Date.parse(new Date())+'.jpg';
					        document.body.appendChild(link);
					        link.click();
					        document.body.removeChild(link);
						}
					});	  

					function isIE(){
						if (!!window.ActiveXObject || "ActiveXObject" in window){
						    return true;
						}else{
						    return false;
						}
					}          	
				});
			}
		}
	}
})();