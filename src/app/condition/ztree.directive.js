(function() {
	'use strict';

	var _statusChange = {}; // 状态缓存
	var prevent = false;
	var _rightMenuData = [
		{'key': 'sel', 'text': '全选'},
		{'key': 'unsel', 'text': '取消全选'},
		'-',
		{'key': 'sel-peer', 'text': '选择层'},
		{'key': 'unsel-perr', 'text': '取消选择层'},
		'-',
		{'key': 'sel-son', 'text': '选择子项'},
		{'key': 'unsel-son', 'text': '取消选择子项'}
	];
	var _getClickCallback = function(treeId, node,conditionService,config,ztreeService) {
		var ztree = $.fn.zTree.getZTreeObj(treeId);

		/**
		 * 根据操作类型, 对节点数组做全选/反选操作
		 * @param  {Object} nodes 节点组
		 * @param  {String} oper 操作
		 */
		function toggle(nodes, oper) {
			var ary = ['sel', 'sel-peer', 'sel-son'];
			for (var i = 0, ilen = nodes.length; i < ilen; i++) {
		    	var node = nodes[i];
		    	var checked = (ary.indexOf(oper) !==-1 ? true : !node.isSelected);
		    	// 挨个选中, 触发事件, 同步选中属性
		    	if(checked===true) {
		    		ztree.checkNode(node, checked, true, true);
		    	}        
			}
		}

		/**
		 * 根据操作类型，对接点做取消全选操作
		 * @param  {Object} nodes 节点组
		 * @param  {String} oper 操作
		 */
		function untoggle(nodes, oper, treeId) {
		    var ary = ['unsel', 'unsel-perr', 'unsel-son'];
		    for (var i = 0, ilen = nodes.length; i < ilen; i++) {
		    	var node = nodes[i];
		    	var checked = (ary.indexOf(oper) !==-1 ? true : !node.isSelected);
		    	// 挨个选中, 触发事件, 同步选中属性			      
			    
			    if(checked===true) {
			    	ztree.checkNode(node, false, true, true);
			    }     
		    }
		}

		/**
		 *组合nodes的一维数组
		*/
		function duiguiNode(nodes,arr) {
			angular.forEach(nodes,function(v,k) {
				arr.push(v);
				if(v.childs) {
					duiguiNode(v.childs,arr);
				}
			});
			return arr;
		}

		// 返回的点击回调
		return function(key) {
		  var nodes = [];
		  switch(key) {
		    case 'sel':
		    	nodes = ztree.transformToArray(ztree.getNodes());
		  		if(treeId==='ztindicatorCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.getAllIndicators+'?cubeId='+config.cubeId,
		    			success:function(data) {
		    				if(data.message.num>1000) {//
		    					alert('数量过大,无法全选');
		    					return false;
		    				} else {		    					
		    					var codes = data.message.codes.split(',');
		    					conditionService.changAllSel('indicatorCode',codes,true);
		  						toggle(nodes, key);
		  						setParentsStyleInType('indicatorCode',nodes);
		  						var parentUrlParams = ztreeService.getParentsParams('indicatorCode');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'indicatorCode');
		    				}		    				
		    			}
		    		});
		    	} else if(treeId==='ztclassify_code') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.getAllClassifyCodes+'?cubeId='+config.cubeId,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量过大,无法全选');
		    					return false;
		    				} else {		    					
		    					var codes = data.message.codes.split(',');
		    					conditionService.changAllSel('classify_code',codes,true);
		  						toggle(nodes, key);
		  						setParentsStyleInType('classify_code',nodes);
		  						var parentUrlParams = ztreeService.getParentsParams('classify_code');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'classify_code');
		    				}		    				
		    			}
		    		});
		    	} else if(treeId==='ztindustryCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.getAllIndustryCodes+'?cubeId='+config.cubeId,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量过大,无法全选');
		    					return false;
		    				} else {		    					
		    					var codes = data.message.codes.split(',');
		    					conditionService.changAllSel('industryCode',codes,true);
		  						toggle(nodes, key);
		  						setParentsStyleInType('industryCode',nodes);
		  						var parentUrlParams = ztreeService.getParentsParams('industryCode');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'industryCode');
		    				}		    				
		    			}
		    		});
		    	}else if(treeId==='ztcommodityCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.getAllCommodityCodes+'?cubeId='+config.cubeId,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量过大,无法全选');
		    					return false;
		    				} else {		    					
		    					var codes = data.message.codes.split(',');
		    					conditionService.changAllSel('commodityCode',codes,true);
		  						toggle(nodes, key);
		  						setParentsStyleInType('commodityCode',nodes);
		  						var parentUrlParams = ztreeService.getParentsParams('commodityCode');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'commodityCode');
		    				}		    				
		    			}
		    		});
		    	} else {
		    		toggle(nodes, key);
		    	}
		    	break;
		    case 'unsel':
		    	nodes = ztree.transformToArray(ztree.getNodes());
		  		if(treeId==='ztindicatorCode') {
		    		/*$.ajax({
		    			type:'GET',
		    			async:false,
		    			url:config.baseUrl+config.urlMap.getAllIndicators+'?cubeId='+config.cubeId,
		    			success:function(data) {
		    				if(data.success) {
		    					var codes = data.message.codes.split(',');
		    					conditionService.changAllSel('indicatorCode',codes,false);
		    					cancelParentsStyleInType('indicatorCode',nodes, key);
		    				}		    				
		    			}
		    		});*/
		    		conditionService.changAllSel('indicatorCode',[],false);
		    		cancelParentsStyleInType('indicatorCode',nodes, key);
		    	}else if(treeId==='ztclassify_code') {
		    		conditionService.changAllSel('classify_code',[],false);
		    		cancelParentsStyleInType('classify_code',nodes, key);
		    	}else if(treeId==='ztindustryCode') {
		    		conditionService.changAllSel('industryCode',[],false);
		    		cancelParentsStyleInType('industryCode',nodes, key);
		    	} else if(treeId==='ztcommodityCode') {
		    		conditionService.changAllSel('commodityCode',[],false);
		    		cancelParentsStyleInType('commodityCode',nodes, key);
		    	} else {
		    		untoggle(nodes,key);
		    	}
		    	break;
		    case 'sel-peer':
		    	var pnode = node.getParentNode();
		    	if (pnode === null) { nodes = ztree.getNodes(); } else { nodes = pnode.childs; }
		    	toggle(nodes, key);
		    break;
		    case 'unsel-perr':
		    	var pnode = node.getParentNode();
		    	if (pnode === null) { nodes = ztree.getNodes(); } else { nodes = pnode.childs; }
		    	var newCodeName = treeId.substring(2,treeId.length);
		    	cancelParentsStyleInType(newCodeName,nodes, key);
		    	break;
		    case 'sel-son':
		    	nodes = duiguiNode(node.childs,[]);
		    	$('#'+node.tId+'_a').css('border','1px solid #282828');
		    	if(treeId==='ztindicatorCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.indicatorAllChilds+'?cubeId='+config.cubeId+'&indicatorCode='+node.code,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量超过大,无法全选');
		    					return false;
		    				} else {	//	 
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('indicatorCode',codes,true);
		  						toggle(nodes, key);
		  						var parentUrlParams = ztreeService.getParentsParams('indicatorCode');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'indicatorCode');
			        			setParentsStyleInType('indicatorCode',nodes);
		    				}			    				
		    			}
		    		});
		    	} else if(treeId==='ztclassify_code') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.classifyAllChilds+'?cubeId='+config.cubeId+'&classCode='+node.code,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量超过大,无法全选');
		    					return false;
		    				} else {		    					
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('classify_code',codes,true);
		  						toggle(nodes, key);
		  						var parentUrlParams = ztreeService.getParentsParams('classify_code');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'classify_code');
		    					setParentsStyleInType('classify_code',nodes);
		    				}		    				
		    			}
		    		});
		    	} else if(treeId==='ztindustryCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.industryAllChilds+'?cubeId='+config.cubeId+'&industryCode='+node.code,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量超过大,无法全选');
		    					return false;
		    				} else {		    					
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('industryCode',codes,true);
		  						toggle(nodes, key);
		  						var parentUrlParams = ztreeService.getParentsParams('industryCode');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'industryCode');
		    					setParentsStyleInType('industryCode',nodes);
		    				}		    				
		    			}
		    		});
		    	} else if(treeId==='ztcommodityCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.commodityAllChilds+'?cubeId='+config.cubeId+'&commodityCode='+node.code,
		    			success:function(data) {
		    				if(data.message.num>1000) {
		    					alert('数量超过大,无法全选');
		    					return false;
		    				} else {
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('commodityCode',codes,true);
		  						toggle(nodes, key);
		  						var parentUrlParams = ztreeService.getParentsParams('commodityCode');
			        			ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,'commodityCode');
		    					setParentsStyleInType('commodityCode',nodes);
		    				}		    				
		    			}
		    		});
		    	} else {
		    		toggle(nodes, key);
		    	}
		    break;
		    case 'unsel-son': 
		    	nodes = duiguiNode(node.childs,[]); 
		    	$('#'+node.tId+'_a').css('border','none');
		    	conditionService.changChildrenSel();
				if(treeId==='ztindicatorCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.indicatorAllChilds+'?cubeId='+config.cubeId+'&indicatorCode='+node.code,
		    			success:function(data) {
		    				if(data.success) {
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('indicatorCode',codes,false);
		    					cancelParentsStyleInType('indicatorCode',nodes, key);
		    				}		    				
		    			}
		    		});
		    	} else if(treeId==='ztclassify_code') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.classifyAllChilds+'?cubeId='+config.cubeId+'&classCode='+node.code,
		    			success:function(data) {
		    				if(data.success) {
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('classify_code',codes,false);
		    					cancelParentsStyleInType('classify_code',nodes, key);
		    				}		    				
		    			}
		    		});		    		
		    	} else if(treeId==='ztindustryCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.industryAllChilds+'?cubeId='+config.cubeId+'&industryCode='+node.code,
		    			success:function(data) {
		    				if(data.success) {
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('industryCode',codes,false);
		    					cancelParentsStyleInType('industryCode',nodes, key);
		    				}		    				
		    			}
		    		});		    		
		    	} else if(treeId==='ztcommodityCode') {
		    		$.ajax({
		    			type:'GET',
		    			url:config.baseUrl+config.urlMap.commodityAllChilds+'?cubeId='+config.cubeId+'&commodityCode='+node.code,
		    			success:function(data) {
		    				if(data.success) {
		    					var codes = data.message.codes.split(',');
		    					conditionService.changChildrenSel('commodtiyCode',codes,false);
		    					cancelParentsStyleInType('commodityCode',nodes, key);
		    				}		    				
		    			}
		    		});		    		
		    	} else {
		    		untoggle(nodes,key);
		    	}
		    break;
		    default: break;
		  }
		};	

		function setParentsStyleInType(codeName,nodes) {
			angular.forEach(nodes,function(v,k) {
				$('#'+v.tId+'_a').css('border','1px solid #282828');
				if(config.dimsbak[codeName].indexOf(v.code)!==-1) {
					$('#'+v.tId+'_a').css('background','#d1f1ff');
				}
				if(v.childs) {
					setParentsStyleInType(codeName,v.childs);
				}
			});
		}

		function cancelParentsStyleInType(type,nodes, key) {
			prevent = true;
			untoggle(nodes, key);
			var parentsParams = ztreeService.getParentsParams(type);
			ztreeService.cancelParentsStyle(ztree.transformToArray(ztree.getNodes()),parentsParams.urlStr,parentsParams.datas,type);
			prevent = false;
		}	
	};
	

	angular.module('pf.condition')
	.directive('ztree',ztreeDirective)
    .controller('LeftTreeCtrl', LeftTreeCtrl);

	LeftTreeCtrl.$inject = ['$scope'];
	function LeftTreeCtrl($scope) {
		
	}


	ztreeDirective.$inject = ['rightmenuService','conditionService','coreCF','ztreeService'];
	function ztreeDirective(rightmenuService,conditionService,config,ztreeService) {
		return {
			restrict:'E',
			replace:true,
			template:'<div class="childList-inner ztree"></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				var Id = attr.id;
				var commonDimens = ['regionCode','timeCode','countryCode','countryTCode','countrySCode','entnature_code','booth_code','market_code','sex_code'];
				var setting = {
		          view: {showIcon:false, showTitle: false, showLine:true},
		          check: {enable: true, chkboxType: { 'Y': '', 'N': '' },chkStyle:'checkbox'},
		          data: {key: {'name': 'name', 'children': 'childs','checked':'isSelected'}}
		        };
		        setting.callback = {};
		        setting.callback.onCheck = function(e,treeId,node) {
		        	var codeName = treeId.substring(2,treeId.length);		          
		          	if(commonDimens.indexOf(codeName)!==-1) {
		          		var flag = node.isSelected;
		          	} else {
		          		var flag = node.checked;
		          	}
		          	if(node.isVal!=undefined&&node.isVal==0) {
		          		return false;
		          	}
		          	if(setting.check.chkStyle==='checkbox') {
		          		conditionService.changeDimen(codeName,node.code,flag);
		          	}
		          	
		          	if(commonDimens.indexOf(codeName)!==-1) {
		          		setStyle();
		          		noNeedReloadStyle(codeName);
		          	} else {		          		
			          	if(flag) {
			          		$('#'+node.tId+'_a').css('background','#d1f1ff');
			          		ztreeService.setParentsStyle(node.getParentNode(),codeName);
			          	} else {
			          		$('#'+node.tId+'_a').css('background','none');
			          		if(prevent) {
			          			return false;
			          		}
			          		var nodes =ztree.transformToArray(ztree.getNodes());
			          		var parentsParams = ztreeService.getParentsParams(codeName);
        					getParents(parentsParams.urlStr,parentsParams.datas,codeName);
        					ztreeService.cancelParentsStyle(nodes,parentsParams.urlStr,parentsParams.datas,codeName);
			          	}
		          	}
		        }
		        setting.callback.onClick = function(e, treeId, node) {
		        	var codeName = treeId.substring(2,treeId.length);
		        	if(commonDimens.indexOf(codeName)!==-1) {
			        	var flag = node.isSelected;
			        } else {
			          	var flag = node.checked;
			        }
			        if(node.isVal!=undefined&&node.isVal==0) {
		          		return false;
		          	}		          	
		        	ztree.checkNode(node, !flag, true, true);
		        	scope.$apply();
		        };
		        setting.callback.onExpand = function(e, treeId, node) {
		        	var codeName = treeId.substring(2,treeId.length);
		        	if(node.childs) {
		        		angular.forEach(node.childs,function(v,k) {
		        			if(config.dimsbak[codeName].indexOf(v.code)!==-1) {
		        				$('#'+v.tId+'_a').css('background','#d1f1ff');
		        			}
		        		});
		        	}
		        }
		        setting.callback.onRightClick = function(e, treeId, node) {
		        	if (!node) { return; }
		        	var menuData = getRightMenuData(node);
		        	rightmenuService.createMenu(menuData, _getClickCallback(treeId, node,conditionService,config,ztreeService));
		        	rightmenuService.show(e.pageY, e.pageX);
		        	scope.$apply();
		        };
		        var curretCodes = config.dimsbak;
		        var needReloadIds = ['ztindicatorCode','ztclassify_code','ztindustryCode','ztcommodityCode'];
		        if(needReloadIds.indexOf(Id)!==-1) {//需要二次加载的维度
		        	var codeName = Id.substring(2,Id.length);
		        	angular.forEach(scope.data,function(v,k) {
		        		if(curretCodes[codeName].indexOf(v.code)!==-1) {
		        			v.checked = true;
		        		}
		        	});
		        	//根据当前指标查找出其所有父级指标
			        var parentUrlParams = ztreeService.getParentsParams(codeName);
			        getParents(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					switch(codeName) {
						case 'indicatorCode':
							setting.async = {
								enable: true,
								url: function(treeId, treeNode) {
									if(treeNode.code) {
										return config.baseUrl+config.urlMap.indicatorChilds+'?cubeId='+config.cubeId+'&id='+treeNode.code;
									}							
								},
								type:'GET'
							}
						break;
						case 'classify_code':
							setting.async = {
								enable: true,
								url: function(treeId, treeNode) {
									if(treeNode.code) {
										return config.baseUrl+config.urlMap.classifyChilds+'?cubeId='+config.cubeId+'&classCode='+treeNode.code;
									}							
								},
								type:'GET'
							}
						break;
						case 'industryCode':
							setting.async = {
					        	enable: true,
					        	url: function(treeId, treeNode) {return config.baseUrl+config.urlMap.industryChilds+'?cubeId='+config.cubeId+'&industryCode='+treeNode.code;},
					        	type:'GET'
					        }
						break;
						case 'commodityCode':
							setting.async = {
								enable: true,
								url: function(treeId, treeNode) {
									if(treeNode.code) {
										return config.baseUrl+config.urlMap.commodityChilds+'?cubeId='+config.cubeId+'&commodityCode='+treeNode.code;
									}							
								},
								type:'GET'
							}
						break;
					}
					scope.$on('searchSelect',function(e,data) {
						if(data.node.isSelected) {
							addParentsCode(data.node,data.codeName);
						} else {
							removeParentsCode(data.node,data.codeName);
						}						
    					ztreeService.searchInDimens(data,data.codeName);
    					var datas = diguiSelect(ztree.getNodes(),config.dimsbak[data.codeName]);      					
						ztree = $.fn.zTree.init(element, setting, scope.data);//选中之后重新渲染ztree
	        			//保存原维度数据节点，以便搜索选择使用
        				conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
	        		});
					setting.data = {simpleData: {enable: true}};
					setting.callback.beforeExpand=beforeExpand;
					setting.callback.onAsyncSuccess=onAsyncSuccess;
					setting.callback.onAsyncError=onAsyncError;
					setting.callback.onNodeCreated = zTreeOnNodeCreated;
		        } else {
		        	var codeName = Id.substring(2,Id.length);
		        	switch(codeName) {
		        		case 'regionCode':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {
			        				case 'regionCode':
			        					if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
			        					var datas =diguiSelect(scope.data,curretCodes.regionCode);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
        								conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        					setStyle();
			        				break;
			        			}
			        		});
		        		break;
		        		case 'countryCode':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {			        				
			        				case 'countryCode':
			        					if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
					        			var id = data.node.code;
					        			var node  = data.node;
			        					var datas =diguiSelect(scope.data,curretCodes.countryCode);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
        								conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        				break;			        				
			        			}
			        		});
		        		break;
		        		case 'countryTCode':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {
			        				case 'countryTCode':
				        				if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
					        			var id = data.node.code;
					        			var node  = data.node;
			        					var datas =diguiSelect(scope.data,curretCodes.countryTCode);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
        								conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        				break;			        				
			        			}
			        		});
		        		break;
		        		case 'countrySCode':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {			        				
			        				case 'countrySCode':
			        					if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
					        			var id = data.node.code;
					        			var node  = data.node;
			        					var datas =diguiSelect(scope.data,curretCodes.countrySCode);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
						        		conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        				break;			        				
			        			}
			        		});
		        		break;
		        		case 'booth_code':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {
			        				case 'booth_code':
			        					if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
					        			var id = data.node.code;
					        			var node  = data.node;
			        					var datas =diguiSelect(scope.data,curretCodes.booth_code);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
        								conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        				break;
			        			}
			        		});
		        		break;
		        		case 'entnature_code':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {
			        				case 'entnature_code':
			        					if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
					        			var id = data.node.code;
					        			var node  = data.node;
			        					var datas =diguiSelect(scope.data,curretCodes.entnature_code);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
        								conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        				break;			        				
			        			}
			        		});
		        		break;
		        		case 'market_code':
		        			scope.$on('searchSelect',function(e,data) {	       			
			        			switch(data.codeName) {
			        				case 'market_code':
				        				if(data.type==='radio') {
											conditionService.changeRadioDimen(data.codeName,data.node.code);
										} else {
											conditionService.changeDimen(data.codeName,data.node.code,data.node.isSelected);
										}
					        			var id = data.node.code;
					        			var node  = data.node;
			        					var datas =diguiSelect(scope.data,curretCodes.markey_code);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
						        		conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
			        				break;
			        			}
			        		});
		        		break;
		        		case 'timeCode':
		        			scope.$on('searchSelectTime',function(e,data) {
			        			switch(data.codeName) {
			        				case 'timeCode':
			        					var datas = ztreeService.searchTimes(scope.data,data);
			        					ztree = $.fn.zTree.init(element, setting, datas);
			        					//保存原维度数据节点，以便搜索选择使用
        								conditionService.setProDimNodes(data.codeName,ztree.transformToArray(ztree.getNodes()));
        								//setStyle();
		          						noNeedReloadStyle(data.codeName,true);
			        				break;
			        			}
			        		});
		        		break;
		        	}
		        }			

				function diguiSelect(datas,arr) {
					angular.forEach(datas,function(v,k) {
						if(arr.indexOf(v.code)!==-1) {
							v.isSelected = true;
							v.checked = true;
						} else {
							v.isSelected = false;
							v.checked = false;
						}
						if(v.childs) {
							diguiSelect(v.childs,arr);
						}
					});
					return datas;
				}

				function beforeExpand(treeId, treeNode) {}
				var keepGo = {
					indicatorCode:true,
					classify_code:true,
					industryCode:true,
					commodityCode:true
				}
		        function onAsyncSuccess(event, treeId, treeNode, msg) {
		        	var codeName = treeId.substring(2,treeId.length);
		        	angular.forEach(treeNode.children,function(v,k) {
		        		if(curretCodes[codeName].indexOf(v.code)!==-1) {
			            	ztree.checkNode(v, true, true, true);
			            	v.isSelected = true;
			            	$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
			            	if(setting.check.chkStyle==='radio') {
			            		$('#'+treeId+' a').css('background','none');
			            		if(keepGo[codeName]) {
			            			$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
			            			keepGo[codeName] = false;
			            		}			            		
			            	}
		        			ztreeService.setParentsStyle(v,codeName);
			            } else {
			            	v.isSelected = false;
			            }
		        	});
		        	treeNode.childs =treeNode.children;
		        }

		        function zTreeOnNodeCreated(event, treeId, treeNode) {
		        	var codeName = treeId.substring(2,treeId.length);
		        	if(config.dimenParentCodes[codeName].indexOf(treeNode.code)!==-1) {
		        		$('#'+treeNode.tId+'_a').css('border','1px solid #282828');
			        }
			        if(curretCodes[codeName].indexOf(treeNode.code)!==-1) {
			        	$('#'+treeNode.tId+'_a').css('border','none').css('background','#d1f1ff');
			        }
		        }		        

		        function onAsyncError(event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {
		          var zTree = $.fn.zTree.getZTreeObj(Id);
		          errorService.showError("异步获取数据出现异常。");
		          treeNode.icon = "";
		          zTree.updateNode(treeNode);
		        }

		        element.attr('id', Id);
        		var ztree = $.fn.zTree.init(element, setting, scope.data);
        		var codeName = Id.substring(2,Id.length);        		
        		noNeedReloadStyle(codeName);
        		//保存原维度数据节点，以便搜索选择使用
        		conditionService.setProDimNodes(codeName,ztree.transformToArray(ztree.getNodes()));
        		

        		scope.$on('changeFixed',function(e,data) {
        			keepGo.indicatorCode = true; 
        			if(data.id===Id) {
        				var codeName = Id.substring(2,Id.length);
        				if(data.isRadio===true) {
        					setting.callback.onRightClick = false;
	        				setting.callback.onClick = function(e, treeId, node) {
					          	conditionService.changeRadioDimen(codeName,node.code);
					          	if(node.isVal==0) {
					          		return false;
					          	}
					          	ztree.checkNode(node, true, true, true);
					          	$('#'+treeId+' a').css('background','none').css('border','none');
					          	$('#'+node.tId+'_a').css('background','#d1f1ff').css('border','none');
					          	ztreeService.setParentsStyle(node.getParentNode(),codeName);
					        };
					        setting.callback.onExpand = function(e, treeId, node) {
					        	var codeName = treeId.substring(2,treeId.length);
					        	if(node.childs) {
					        		angular.forEach(node.childs,function(v,k) {
					        			if(config.dimsbak[codeName].indexOf(v.code)!==-1) {
					        				$('#'+v.tId+'_a').css('background','#d1f1ff');
					        			}
					        			if(v.isVal==0) {
					        				$('#'+v.tId+'_a').css('color','#999');
					        			}
					        		});
					        	}
					        }
					        scope.data = toRaidoDatas(scope.data,config.dimsbak[codeName][0]);
	        				if(config.dimsbak[codeName][0]) {
	        					config.dimsbak[codeName].splice(1,config.dimsbak[codeName].length);
        					} else {
        						return false;
        					}
        									
        					if(commonDimens.indexOf(codeName)!==-1) {//不需二次加载的维度
        						ztree = $.fn.zTree.init(element, setting, scope.data);
        						//保存原维度数据节点，以便搜索选择使用
        						conditionService.setProDimNodes(codeName,ztree.transformToArray(ztree.getNodes()));
	        					var _nodes = ztree.transformToArray(ztree.getNodes());
	        					keepGo[codeName] = true;
	        					angular.forEach(_nodes,function(v,k) {
	        						if(keepGo[codeName]) {
	        							if(v.code==config.dimsbak[codeName][0]) {
	        								keepGo[codeName] = false;
	        								ztreeService.setParentsStyle(v.getParentNode(),codeName);	        								
	        								$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
	        							}
	        						}
	        						if(v.isVal==0) {
	        							$('#'+v.tId+'_a').css('color','#999');
	        						}
	        					});
	        				} else {//需要二次加载的维度
	        					var parentUrlParams = ztreeService.getParentsParams(codeName);
				        		getParents(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
	        					ztree = $.fn.zTree.init(element, setting, scope.data);
	        					//保存原维度数据节点，以便搜索选择使用
        						conditionService.setProDimNodes(codeName,ztree.transformToArray(ztree.getNodes()));
	        					var parentsParams = ztreeService.getParentsParams(codeName);
        						getParents(parentsParams.urlStr,parentsParams.datas,codeName);
        						var _nodes = ztree.transformToArray(ztree.getNodes());							        
	        					angular.forEach(_nodes,function(v,k) {
	        						if(v.isVal==0) {
	        							$('#'+v.tId+'_a').css('color','#999');
	        						}
	        					});
	        				}
        				} else {
        					setting.callback.onCheck = function(e,treeId,node) {
					        	if(commonDimens.indexOf(codeName)!==-1) {
					          		var flag = node.isSelected;
					          	} else {
					          		var flag = node.checked;
					          	}
					          	if(node.isVal!=undefined&&node.isVal==0) {
					          		return false;
					          	}
					          	if(setting.check.chkStyle==='checkbox') {
					          		conditionService.changeDimen(codeName,node.code,flag);
					          	}
					          	if(commonDimens.indexOf(codeName)!==-1) {
					          		setStyle();
					          	} else {		          		
						          	if(flag) {
						          		$('#'+node.tId+'_a').css('background','#d1f1ff');
						          		ztreeService.setParentsStyle(node.getParentNode(),codeName);
						          	} else {
						          		$('#'+node.tId+'_a').css('background','none');
						          		if(prevent) {
						          			return false;
						          		}
						          		var nodes =ztree.transformToArray(ztree.getNodes());
			          					var parentsParams = ztreeService.getParentsParams(codeName);
        								getParents(parentsParams.urlStr,parentsParams.datas,codeName);
        								ztreeService.cancelParentsStyle(nodes,parentsParams.urlStr,parentsParams.datas);
						          	}
					          	}
					        }
					        setting.callback.onExpand = function(e, treeId, node) {
					        	if(node.childs) {
					        		angular.forEach(node.childs,function(v,k) {
					        			if(config.dimsbak[codeName].indexOf(v.code)!==-1) {
					        				$('#'+v.tId+'_a').css('background','#d1f1ff');
					        			}
					        		});
					        	}
					        }
					        setting.callback.onClick = function(e, treeId, node) {
					        	if(commonDimens.indexOf(codeName)!==-1) {
						        	var flag = node.isSelected;
						        } else {
						          	var flag = node.checked;
						        }
						        if(node.isVal!=undefined&&node.isVal==0) {
					          		return false;
					          	}		          	
					        	ztree.checkNode(node, !flag, true, true);
					        	scope.$apply();
					        };
					        setting.callback.onRightClick = function(e, treeId, node) {
					        	if (!node) { return; }
					        	var menuData = getRightMenuData(node);
					        	rightmenuService.createMenu(menuData, _getClickCallback(treeId, node,conditionService,config,ztreeService));
					        	rightmenuService.show(e.pageY, e.pageX);
					        	scope.$apply();
					        };
					        if(commonDimens.indexOf(codeName)!==-1) {
					        	var _nodes = ztree.transformToArray(ztree.getNodes());
	        					keepGo[codeName] = true;
	        					angular.forEach(_nodes,function(v,k) {
	        						if(keepGo[codeName]) {
	        							if(v.code==config.dimsbak[codeName][0]) {
	        								keepGo[codeName] = false;
	        								ztreeService.setParentsStyle(v.getParentNode(),codeName);	        								
	        								$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
	        							}
	        						}
	        					});
					        } else {
					        	var parentsParams = ztreeService.getParentsParams(codeName);
        						getParents(parentsParams.urlStr,parentsParams.datas,codeName);
					        }
					        var newDatas = rebackCheckBox(codeName,scope.data);
	        				ztree = $.fn.zTree.init(element, setting, newDatas);
	        				//保存原维度数据节点，以便搜索选择使用
        					conditionService.setProDimNodes(codeName,ztree.transformToArray(ztree.getNodes()));
	        				setStyle()
        				}
        				scope.$apply();
        			}
        		});
        		
				function setStyle() {
					element.find('.checkbox_false_part').siblings('a').css('border','1px solid #282828').css('background','none');
					element.find('.checkbox_false_full').siblings('a').css('border','none').css('background','none');
					element.find('.checkbox_true_part').siblings('a').css('border','none').css('background','#d1f1ff');	
					element.find('.checkbox_true_full').siblings('a').css('border','none').css('background','#d1f1ff');						
				}
				function noNeedReloadStyle(codeName,isTime) {
					if(commonDimens.indexOf(codeName)!==-1) {//不需二次加载的维度
						var _nodes = ztree.transformToArray(ztree.getNodes());
						element.find('a').css('background','none').css('border','none');
						angular.forEach(_nodes,function(v,k) {
							if(config.dimsbak[codeName].indexOf(v.code)!==-1) {
								ztreeService.setParentsStyle(v.getParentNode(),codeName);
								if(isTime) {
									$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');$('#'+v.parentTId+'_a').css('background','none').css('border','1px solid #282828');
									$('#'+v.parentTId+'_a').css('background','none').css('border','1px solid #282828');
								} else {
									$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
								}								
							}
						});
					}
				}

				/*搜索时使用，把选中的node的父级添加到维度父级里*/
				function addParentsCode(node,codeName) {
					switch(codeName) {
						case 'indicatorCode':
						case 'classify_code':
						case 'industryCode':
						case 'commodityCode':
							if(node) {
								if(config.dimenParentCodes[codeName].indexOf(node.code)==-1) {
									config.dimenParentCodes[codeName].push(node.code);
								}
								addParentsCode(node.getParentNode(),codeName);
							}
						break;
						default:
							noNeedReloadStyle(codeName);
						break;
					}
					
				}

				/*搜索时使用，把取消的node的父级从维度父级里移除*/
				function removeParentsCode(node,codeName) {
					switch(codeName) {
						case 'indicatorCode':
						case 'classify_code':
						case 'industryCode':
						case 'commodityCode':
							if(node) {
								var num = config.dimenParentCodes[codeName].indexOf(node.code);
								if(num!=-1) {
									config.dimenParentCodes[codeName].splice(num,1);
								}
								removeParentsCode(node.getParentNode(),codeName);
							}
						break;
					}			
				}
			}			
		};

		//维度从固定切换到行或列后，数据需要重新比对所选中的数据
		function rebackCheckBox(codeName,data) {
			angular.forEach(data,function(v,k) {
				if(config.dimsbak[codeName].indexOf(v.code)!=-1) {
					v.checked = true;
					v.isSelected = true;
				} else {
					v.checked = false;
					v.isSelected = false;
				}
				if(v.childs) {
					rebackCheckBox(codeName,v.childs);
				}
			});
			return data;
		}



		function getParents(urlStr,datas,codeName) {
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

		function toRaidoDatas(datas,code) {
			angular.forEach(datas,function(v,k) {
				if(v.code===code) {
					v.isSelected = true;
					v.checked = true;
				} else {
					v.isSelected = false;
					v.checked = false;
				}
				if(v.childs&&v.childs.length!==0) {							
					toRaidoDatas(v.childs,code)
				}
			});
			return datas;
		}
	}

	/**
   	 * 获取指定表下指定类型的树
     * @param {String} sk  SheetId
     * @param {String} type DimeCode
     * @return {Object} 存放
    */
	function getStatus(sk, type) {
		if (!_statusChange[sk]) { _statusChange[sk] = {}; }
		var statusChangeBySheet = _statusChange[sk];
		if (!statusChangeBySheet[type]) { statusChangeBySheet[type] = []; }
		return statusChangeBySheet[type];
	}

	/**
	 * 保存展开状态在表->类型->array->id下
	 * @param {String} sk  SheetId
	 * @param {String} type DimeCode
	 * @param {String} id ElementId
	 * @param {String} oper 操作
	*/
	function setStatus(sk, type, id, oper) {
		var array = getStatus(sk, type);
		var index = array.indexOf(id);
		if (index === -1 && oper === 'add') {
			array.push(id);
		} else if (index !== -1 && oper === 'del') {
			array.splice(index, 1);
		}
	}

	/**
	 * 根据节点的属性获取菜单数据
	 * @param  {Object} node 右键的节点
	 * @return {Array} 菜单数据
	*/
	function getRightMenuData(node) {
		var data = _rightMenuData;
		if (node.childs||node.isParent) {
			data[6].disabled = false;
			data[7].disabled = false;
		} else {
			data[6].disabled = true;
			data[7].disabled = true;
		}
		return data;
	}
})();