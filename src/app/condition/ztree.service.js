(function() {
	'use strict';
	angular
    .module('pf.condition')
    .factory('ztreeService', ztreeService);

    ztreeService.$inject = ['coreCF','conditionService'];
	function ztreeService(config,conditionService) {
		var service = {
			setParentsStyle:setParentsStyle,
			cancelParentsStyle:cancelParentsStyle,
			getParentsParams:getParentsParams,
			searchTimes:searchTimes,
			searchInDimens:searchInDimens,
			searchInMapDimens:searchInMapDimens,
			getParentUrl:getParentUrl,
			setMapParentsStyle:setMapParentsStyle,
			getParentCodes:getParentCodes
		};
		return service;

		function setParentsStyle(node,codeName) {
			if(node) {
				if(config.dimsbak[codeName].indexOf(node.code)!==-1) {
	    			$('#'+node.tId+'_a').css('border','none');
	    		} else {
	    			$('#'+node.tId+'_a').css('border','1px solid #282828');
	    		}
	    		setParentsStyle(node.getParentNode(),codeName);		        		
	    	}
	    }
	    function setMapParentsStyle(node,codeName) {
			if(node) {
				if(config.mapDims[codeName].indexOf(node.code)!==-1) {
	    			$('#'+node.tId+'_a').css('border','none');
	    		} else {
	    			$('#'+node.tId+'_a').css('border','1px solid #282828');
	    		}
	    		setMapParentsStyle(node.getParentNode(),codeName);		        		
	    	}
	    }

	    function cancelParentsStyle(nodes,urlStr,datas,codeName) {
	    	if(datas.id||datas.classify_code||datas.industryCode||datas.commodityCode) {
		    	$.ajax({
		    		url:urlStr,
		    		data:datas,
		    		type:'POST',
		    		async:false,
		    		success:function(response) {
		    			response = angular.fromJson(response);
		    			if(response&&response.ids) {
		    				config.dimenParentCodes[codeName] = response.ids.split(',');
		    				angular.forEach(nodes,function(v,k) {
		    					if(config.dimenParentCodes[codeName].indexOf(v.code)===-1) {
		    						$('#'+v.tId+'_a').css('border','none').css('background','none');
		    					} else {
		    						$('#'+v.tId+'_a').css('border','1px soid #282828');
		    					}
		    				});		        				
		    			}
		    		}
		    	});
		    } else {
    			config.dimenParentCodes[codeName] = [];
    			angular.forEach(nodes,function(v,k) {
					if(config.dimenParentCodes[codeName].indexOf(v.code)===-1) {
						$('#'+v.tId+'_a').css('border','none');
					} else {
						$('#'+v.tId+'_a').css('border','1px soid #282828');
					}
				});	
		    }
	    }


	    function getParentsParams(type,radio) {
	    	var urlStr = null,datas = null;
	    	if(arguments.length===1) {	    		
				switch(type) {
					case 'indicatorCode':
					urlStr = config.baseUrl+config.urlMap.getAllParentsIndicator;
					datas = {'cubeId':config.cubeId,'id':config.dimsbak.indicatorCode.join(',')};
					break;
					case 'classify_code':
					var urlStr = config.baseUrl+config.urlMap.getAllParentsClassify;
					var datas = {'cubeId':config.cubeId,'classifyCode':config.dimsbak.classify_code.join(',')};
					break;
					case 'industryCode':
					var urlStr = config.baseUrl+config.urlMap.getAllParentsIndustry;
					var datas = {'cubeId':config.cubeId,'industryCode':config.dimsbak.industryCode.join(',')};
					break;
					case 'commodityCode':
					var urlStr = config.baseUrl+config.urlMap.getAllparentsCommodity;
					var datas = {'cubeId':config.cubeId,'commodityCode':config.dimsbak.commodityCode.join(',')};
					break;
				}
	    	} else {	    		
				switch(type) {
					case 'indicatorCode':
					urlStr = config.baseUrl+config.urlMap.getAllParentsIndicator;
					datas = {'cubeId':config.cubeId,'id':config.mapDims.indicatorCode.join(',')};
					break;
					case 'classify_code':
					var urlStr = config.baseUrl+config.urlMap.getAllParentsClassify;
					var datas = {'cubeId':config.cubeId,'classifyCode':config.mapDims.classify_code.join(',')};
					break;
					case 'industryCode':
					var urlStr = config.baseUrl+config.urlMap.getAllParentsIndustry;
					var datas = {'cubeId':config.cubeId,'industryCode':config.mapDims.industryCode.join(',')};
					break;
					case 'commodityCode':
					var urlStr = config.baseUrl+config.urlMap.getAllparentsCommodity;
					var datas = {'cubeId':config.cubeId,'commodityCode':config.mapDims.commodityCode.join(',')};
					break;
				}
	    	}
			return {urlStr:urlStr,datas:datas};
	    }

	    function searchTimes(initDatas,data) {
	    	var datas = null;	        						
			if(data.isNum) {//最近n年
				var num = initDatas.length-data.size;
				if(num>0) {
					var num2 = data.size;
					var arr1 = initDatas.slice(0,num2);
					var arr2 = initDatas.slice(num2,initDatas.length);
					var cancels = diguiCancelTime(arr2);
					var selects = diguiSelectTime(arr1);
					datas = selects.concat(cancels);
				} else {
					datas = diguiSelectTime(initDatas);
				}     						
			} else {//自定义时间
				var keepGoing1 = true;
				var keepGoing2 = true;
				var num1 = null;
				var num2 = null;
				angular.forEach(initDatas,function(v,k) {
					if(keepGoing1) {
						if(parseInt(v.code)<=parseInt(data.size[1])) {
							num1 = k;
							keepGoing1 = false;
						}
					}	        							
				});
				angular.forEach(initDatas,function(v,k) {
					if(keepGoing2) {
						if(parseInt(v.code)<=parseInt(data.size[0])) {
							num2 = k+1;
							keepGoing2 = false;
						}
					}	        							
				});
				if(num2==null) {
					num2 = initDatas.length;
				}
				var num3 = initDatas.length;
				var arr1 = initDatas.slice(0,num1);
				var arr2 = initDatas.slice(num1,num2);
				var arr3 = initDatas.slice(num2,num3);
				var cancels = diguiCancelTime(arr1);
				var selects = diguiSelectTime(arr2); 
				var cancels2 = diguiCancelTime(arr3);
				datas = cancels.concat(selects);
				datas = datas.concat(cancels2);
			}
			return datas;
	    }

	    function searchInDimens(data,codeName) {
	    	var id = data.node.code;
	    	var urlParams = getParentUrl(codeName,id);
			if(data.type==='radio') {
				conditionService.changeRadioDimen(data.codeName,data.node.code);
			} else {
				conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
			}
			if(['industryCode','indicatorCode','commodityCode','classify_code'].indexOf(codeName)==-1) {
				return false;
			}
			$.ajax({
				type:'GET',
				url:urlParams.urlStr,
				data:urlParams.datas,
				async:false,
				success:function(response) {
					var str = angular.fromJson(response).ids;
                	var arr = str.split(',');
  					if(data.type==='radio') {
  						config.dimenParentCodes[codeName] = arr;
  					} else {
  						config.dimenParentCodes[codeName].push.apply(config.dimenParentCodes[codeName],arr);
  					}  					
				}
			});
	    }

	    function searchInMapDimens(data,codeName,mapParentCodes) {
	    	var id = data.node.code;
	    	var urlParams = getParentUrl(codeName,id);
			config.mapDims[codeName] = [id];
			if(['industryCode','indicatorCode','commodityCode','classify_code'].indexOf(codeName)==-1) {
				return false;
			}
			$.ajax({
				type:'GET',
				url:urlParams.urlStr,
				data:urlParams.datas,
				async:false,
				success:function(response) {
					var str = angular.fromJson(response).ids;
                	var arr = str.split(',');
                	mapParentCodes[codeName] = arr;
				}
			});
	    }

	    function getParentUrl(codeName,id) {
	    	var urlStr = null;
	    	var datas = null;
	    	switch(codeName) {
	    		case 'indicatorCode':
	    		urlStr = config.baseUrl+config.urlMap.getParentsIndicator;
	    		datas = {cubeId:config.cubeId,id:id}
	    		break;
	    		case 'classify_code':
	    		urlStr = config.baseUrl+config.urlMap.getParentClass;
	    		datas = {cubeId:config.cubeId,classifyCode:id}
	    		break;
	    		case 'industryCode':
	    		urlStr = config.baseUrl+config.urlMap.getParentsIndustry;
	    		datas = {cubeId:config.cubeId,industryCode:id}
	    		break;
	    		case 'commodityCode':
	    		urlStr = config.baseUrl+config.urlMap.getCommodity;
	    		datas = {cubeId:config.cubeId,commodityCode:id}
	    		break;
	    	}
	    	return {urlStr:urlStr,datas:datas};
	    }

	    function getParentCodes(urlStr,datas,codeName) {
			$.ajax({
            	url:urlStr,
            	type:'POST',
            	data:datas,
            	async:false,
            	success:function(resource) {
            		if(resource) {
	                	var str = angular.fromJson(resource).ids;
	                	var arr = str.split(',');
	                	config.dimenParentCodes[codeName] = arr;                
	                }           
            	},
            	error:function(msg) {
            		config.dimenParentCodes[codeName] = [];
            	}
            });
	    }

	    function diguiSelectTime(datas) {
			angular.forEach(datas,function(v,k) {
				conditionService.changeDimen('timeCode',v.code,true);
				v.isSelected = true;
				if(v.childs) {
					diguiSelectTime(v.childs);
				}
			});
			return datas;
		}
		function diguiCancelTime(datas) {
			angular.forEach(datas,function(v,k) {
				conditionService.changeDimen('timeCode',v.code,false);
				v.isSelected = false;
				if(v.childs) {
					diguiCancelTime(v.childs);
				}
			});
			return datas;
		}
	}
})();