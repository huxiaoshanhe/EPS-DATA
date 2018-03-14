(function() {
	'use strict';

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
		function untoggle(nodes, oper) {
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

		function setParentsStyleInType(codeName,nodes,parentsCodes) {
			angular.forEach(nodes,function(v,k) {
				if(parentsCodes&&parentsCodes.indexOf(v.code)!==-1) {
					$('#'+v.tId+'_a').css('border','1px solid #282828');
				} else {
					$('#'+v.tId+'_a').css('border','none');
				}
				
				if(config.dimsbak[codeName].indexOf(v.code)!==-1) {
					$('#'+v.tId+'_a').css('background','#d1f1ff');
				}
				if(v.childs) {
					setParentsStyleInType(codeName,v.childs);
				}
			});
		}

		function getAllChilds(node,arr) {
			if(node.childs) {
				node.childs.forEach(function(v,k) {
					arr.push(v);
					if(v.childs) {
						getAllChilds(v,arr);
					}
				});
			}
			return arr;
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

		return function(key) {
			var nodes = [];
		    var codeName = treeId.substring(10,treeId.length);
			switch(key) {
		    	case 'sel':
		    		nodes = ztree.transformToArray(ztree.getNodes());
		    		switch(codeName) {
		    			case 'indicatorCode':
		    			case 'classify_code':
		    			case 'industryCode':
		    			case 'commodityCode':		    				
				    		angular.forEach(nodes,function(v,k) {
				    			if(!v.chkDisabled) {
				    				if(config.dimsbak[codeName].indexOf(v.code)===-1) {
				    					config.dimsbak[codeName].push(v.code);
				    					v.isSelected = true;
				    				}
				    			}
				    		});
				    		ztree.refresh();
				    		var proNodes = conditionService.getProDimNodes(codeName);
				    		var parentUrlParams = ztreeService.getParentsParams(codeName);
					        ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					        setParentsStyleInType(codeName,proNodes,config.dimenParentCodes[codeName]);	
		    			break;
		    			default:
		    				toggle(nodes, key);
		    			break;
		    		}		    		    		
		    	break;
		    	case 'unsel':
		    		nodes = ztree.transformToArray(ztree.getNodes());
		    		switch(codeName) {
		    			case 'indicatorCode':
		    			case 'classify_code':
		    			case 'industryCode':
		    			case 'commodityCode':		    				
				    		angular.forEach(nodes,function(v,k) {
				    			if(!v.chkDisabled) {
				    				var num = config.dimsbak[codeName].indexOf(v.code);
				    				if(num!==-1) {
				    					config.dimsbak[codeName].splice(num,1);
				    					v.isSelected = false;
				    				}
				    			}
				    		});
				    		ztree.refresh();
				    		var proNodes = conditionService.getProDimNodes(codeName);
				    		var parentUrlParams = ztreeService.getParentsParams(codeName);
					        ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					        setParentsStyleInType(codeName,proNodes,config.dimenParentCodes[codeName]);
		    			break;
		    			default:
		    				untoggle(nodes, key);
		    			break;
		    		}		    		
		    	break;
		    	case 'sel-peer':
		    		switch(codeName) {
		    			case 'indicatorCode':
		    			case 'classify_code':
		    			case 'industryCode':
		    			case 'commodityCode':
		    				var pnode = node.getParentNode();
				    		angular.forEach(pnode.childs,function(v,k) {
				    			if(!v.chkDisabled) {
				    				if(config.dimsbak[codeName].indexOf(v.code)===-1) {
				    					config.dimsbak[codeName].push(v.code);
				    					v.isSelected = true;
				    				}
				    			}
				    		});
				    		ztree.refresh();
				    		var proNodes = conditionService.getProDimNodes(codeName);
				    		var parentUrlParams = ztreeService.getParentsParams(codeName);
					        ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					        setParentsStyleInType(codeName,proNodes,config.dimenParentCodes[codeName]);
		    			break;
		    			default:
		    				var pnode = node.getParentNode();
		    				if (pnode === null) { nodes = ztree.getNodes(); } else { nodes = pnode.childs; }
		    				toggle(nodes, key);
		    			break;
		    		}		    		
		    	break;
		    	case 'unsel-perr':
		    		switch(codeName) {
		    			case 'indicatorCode':
		    			case 'classify_code':
		    			case 'industryCode':
		    			case 'commodityCode':
		    				var pnode = node.getParentNode();
				    		angular.forEach(pnode.childs,function(v,k) {
				    			if(!v.chkDisabled) {
				    				var num = config.dimsbak[codeName].indexOf(v.code);
				    				if(num!==-1) {
				    					config.dimsbak[codeName].splice(num,1);
				    					v.isSelected = false;
				    				}
				    			}
				    		});
				    		ztree.refresh();
				    		var proNodes = conditionService.getProDimNodes(codeName);
				    		var parentUrlParams = ztreeService.getParentsParams(codeName);
					        ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					        setParentsStyleInType(codeName,proNodes,config.dimenParentCodes[codeName]);
		    			break;
		    			default:
		    				var pnode = node.getParentNode();
		    				if (pnode === null) { nodes = ztree.getNodes(); } else { nodes = pnode.childs; }
		    				untoggle(nodes, key);
		    			break;
		    		}		    		
		    	break;
		    	case 'sel-son':
		    		switch(codeName) {
		    			case 'indicatorCode':
		    			case 'classify_code':
		    			case 'industryCode':
		    			case 'commodityCode':
		    				nodes = getAllChilds(node,[]);
				    		angular.forEach(nodes,function(v,k) {
				    			if(!v.chkDisabled) {
				    				if(config.dimsbak[codeName].indexOf(v.code)===-1) {
				    					config.dimsbak[codeName].push(v.code);
				    					v.isSelected = true;
				    				}
				    			}
				    		});
				    		ztree.refresh();
				    		var proNodes = conditionService.getProDimNodes(codeName);
				    		var parentUrlParams = ztreeService.getParentsParams(codeName);
					        ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					        setParentsStyleInType(codeName,proNodes,config.dimenParentCodes[codeName]);	    		
		    			break;
		    			default:
		    				nodes = duiguiNode(node.childs,[]);
		    				toggle(nodes, key);
		    			break;
		    		}		    		
		    	break;
		    	case 'unsel-son':;
		    		switch(codeName) {
		    			case 'indicatorCode':
		    			case 'classify_code':
		    			case 'industryCode':
		    			case 'commodityCode':
		    				nodes = getAllChilds(node,[]);
				    		angular.forEach(nodes,function(v,k) {
				    			if(!v.chkDisabled) {
				    				var num = config.dimsbak[codeName].indexOf(v.code);
				    				if(num!==-1) {
				    					config.dimsbak[codeName].splice(num,1);
				    					v.isSelected = false;
				    				}
				    			}
				    		});
				    		ztree.refresh();
				    		var proNodes = conditionService.getProDimNodes(codeName);
				    		var parentUrlParams = ztreeService.getParentsParams(codeName);
					        ztreeService.getParentCodes(parentUrlParams.urlStr,parentUrlParams.datas,codeName);
					        setParentsStyleInType(codeName,proNodes,config.dimenParentCodes[codeName]);
		    			break;
		    			default:
		    				nodes = duiguiNode(node.childs,[]);
		    				untoggle(nodes, key);
		    			break;
		    		}		    		
		    	break;
			}
		}
	}

	

	angular
    .module('pf.core')
    .directive('dimensions', dimensionsDir);

	dimensionsDir.$inject = ['conditionService','dataService','coreCF','ztreeService','rightmenuService'];
	function dimensionsDir(conditionService,dataService,config,ztreeService,rightmenuService) {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/dimensions/dimensions.template.html',
			controller:['conditionService',function(conditionService) {
				var that = this;
				that.changConditions = function(a) {
					conditionService.update(a);
				}
				that.getConditions = function() {
					return conditionService.getCondition();
				}
				that.sort = function(dimenName,lan) {
					conditionService.dimenSort(dimenName,lan);
				}
			}],
			controllerAs:'dimensionsCtrl',
			link:function(scope,element,attr,dimensionsCtrl) {
				//禁用光标拖动选择
				element.disableSelection();
				scope.selectedNums = config.dimsbak;
				//实现维度的行、列、固定的切换与顺序调整
				$( "#colDimens, #rowDimens, #fixedDimens" ).sortable({
			      connectWith: ".dimensionConnect",
			      update:function(e) {
			      	if($('#colDimens .dimen-ls-control').length!==0) {
			      		var colArr = [];
			      		$('#colDimens .dimen-ls-control').each(function(index,e) {
				      		var name = $(e).attr('id');
				      		colArr.push(name);
				      	});

				      	dimensionsCtrl.sort(colArr,'colDimens');
			      	} else {
			      		dimensionsCtrl.sort([],'colDimens');
			      	}
			      	
			      	if($('#rowDimens .dimen-ls-control').length!==0) {
			      		var rowArr = [];
			      		$('#rowDimens .dimen-ls-control').each(function(index,e) {
				      		var name = $(e).attr('id');
				      		rowArr.push(name);
				      	});
				      	dimensionsCtrl.sort(rowArr,'rowDimens');
			      	} else {
			      		dimensionsCtrl.sort([],'rowDimens');
			      	}
			      	
			      	if($('#fixedDimens .dimen-ls-control').length!==0) {
			      		var fixedArr = [];
			      		$('#fixedDimens .dimen-ls-control').each(function(index,e) {
				      		var name = $(e).attr('id');
				      		fixedArr.push(name);
				      	});
				      	dimensionsCtrl.sort(fixedArr,'fixedDimens');
			      	} else {
			      		dimensionsCtrl.sort([],'fixedDimens');
			      	}			      	
			      },
			      receive:function(e,ui) {
			      	if($(e.target).attr('id')==='fixedDimens') {
			      		var id = $(e.toElement).parent('.dimen-ls-control').find('.childList-inner').attr('id');
			      		scope.$broadcast('changeFixed',{id:id,isRadio:true});
			      	} else {
			      		var id = $(e.toElement).parent('.dimen-ls-control').find('.childList-inner').attr('id');
			      		scope.$broadcast('changeFixed',{id:id,isRadio:false});
			      	}			      	
			      },
			      start:function(e,ui) {
			      	$(ui.item).find('.dimen-ls-control').css('box-shadow','3px 3px 2px #888888');
			      },
			      stop:function(e,ui) {
			      	$(ui.item).find('.dimen-ls-control').css('box-shadow','none');
			      }
			    }).disableSelection();

				//维度操作部分阻止上下拖动
			    scope.preventMove = function(e) {
			    	e.stopPropagation();
			    }
			    //
			    scope.preventHide = function(e) {
			    	e.stopPropagation();
			    }

			    //显示或隐藏维度列表
			    scope.toggleList=function(id,e,type) {//
			    	$('.childList').not('#list-'+id).hide();
			    	if(type=='table') {
			    		$('#zt'+id).show();
			    	} else if(type=='map') {
			    		var arr = id.split('-');
			    		$('#'+arr[0]+'-in-'+arr[1]).show();
			    	} else if(type=='mapRegion') {
			    		$('#mapregionCode').show();
			    	}		    	
			    	$('#map-in-'+'indicatorCode').show();
			    	$('#list-'+id).toggle().resizable({
			    		minWidth:180,
			    		minHeight:200,
			    		maxWidth:800
			    	});
			    	scope.selectedTimeStr = '';
			    	e.stopPropagation();
			    	if($(e.currentTarget).hasClass('opened')){
			    		$(e.currentTarget).removeClass('opened');
			    	} else {
			    		$(e.currentTarget).addClass('opened');
			    	}
			    	element.find('.sear .txt').focus(function(e) {
				    	if(element.find('.timeSearch')) {
				    		var id = $(this).parents('.dimensionConnect').attr('id');
				    		if(id!='fixedDimens') {
				    			element.find('.timeSearch').show();
				    		}				    		
				    	}
				    });
				    $('.childList-inner').click(function() {
				    	element.find('.timeSearch').hide();	
				    });
			    }

			    scope.selectTime = function(num,str) {
					scope.$broadcast('searchSelectTime',{
						codeName:'timeCode',
						size:num,
						isNum:true,
						freqId:conditionService.getFreqId()
					});
					scope.selectedTimeStr = str;
					element.find('.timeSearch').hide();
				}
				scope.selectTime2 = function(num1,num2) {
					if(!num1||!num2||num1>num2||num1==num2) {
						return false;
					}
					var startTime = num1+'010101';
					var endTime = num2+'010101';
					scope.$broadcast('searchSelectTime',{
						codeName:'timeCode',
						size:[startTime,endTime],
						isNum:false,
						freqId:conditionService.getFreqId()
					});
					element.find('.timeSearch').hide();	
					scope.selectedTimeStr = num1+'-'+num2;
				}

				scope.dimenTreeState = {
					indicatorCode:true,
					classify_code:true,
					industryCode:true,
					timeCode:true,
					regionCode:true,
					countryCode:true,
					countryTCode:true,
					countrySCode:true,
					entnature_code:true,
					booth_code:true,
					market_code:true
				}

			    scope.goSearch = function(id) {
			    	var keywords = $('#sear-'+id).val();
			    	var params = {keywords:keywords,cubeId:config.cubeId,codeName:id};
			    	var setting = {
		          		view: {showIcon:false, showTitle: false, showLine:true},
		        		check: {enable: true, chkboxType: { 'Y': '', 'N': '' },chkStyle:'checkbox'},
		        		data: {key: {'name': 'name', 'children': 'childs','checked':'isSelected'}}
		        	};
		        	setting.callback = {};
		        	setting.callback.onCheck = function(e,treeId,node) {
		        		var codeName = treeId.substring(10,treeId.length);
		        		scope.$broadcast('searchSelect',{
		        			type:setting.check.chkStyle,
		        			node:node,
		        			codeName:codeName,
		        		});
		        	}

		        	setting.callback.onClick = function(e,treeId,node) {
		        		var ztree = $.fn.zTree.getZTreeObj(treeId);
		        		ztree.checkNode(node, !node.isSelected, true, true);
		        	}
			    	setting.callback.onRightClick = function(e, treeId, node) {
			        	if (!node) { return; }
			        	var menuData = getRightMenuData(node);
			        	rightmenuService.createMenu(menuData, _getClickCallback(treeId, node,conditionService,config,ztreeService));
			        	rightmenuService.show(e.pageY, e.pageX);
			        	scope.$apply();
			        };
			    	var parent =$('#sear-'+id).parents('#fixedDimens');
    				if(parent[0]) {
    					setting.check.chkStyle = 'radio';
    				}

			    	switch(id) {
			    		case 'regionCode':
			    			params.action = 'region';
			    		break;
			    		case 'countryCode':
			    		case 'countryTCode':
			    		case 'countrySCode':
			    			params.action = 'country';
			    		break;
			    		case 'indicatorCode':
			    			params.action = 'indicator';
			    		break;
			    		case 'classify_code':
			    			params.action = 'classify';
			    		break;
			    		case 'industryCode':
			    			params.action = 'industry';
			    		break;
			    		case 'commodityCode':
			    			params.action = 'commodity';			    			
			    		break;
			    		case 'market_code':
			    			params.action = 'market';
			    		break;
			    		case 'booth_code':
			    			params.action = 'booth';
			    		break;
			    		case 'entnature_code':
			    			params.action = 'entnature';
			    		break;
			    	}
			    	dataService.searchLog(0,keywords);
			    	dataService.get('search',params).then(function(data) {
		    			var result = digui(data,[],params.codeName);
		    			var ztree = $.fn.zTree.init($('#sear-list-'+id), setting, result);
	    				/*scope.$on('changeFixed',function(e,data) { 
		        			if(data.isRadio) {
		        				setting.check.chkStyle = 'radio';
		        				ztree = $.fn.zTree.init($('#sear-list-'+id), setting, result);
		        			} else {
		        				setting.check.chkStyle = 'checkbox';
		        				ztree = $.fn.zTree.init($('#sear-list-'+id), setting, result);
		        			}
		        		});*/
	    			});
			    	$('#sear-list-'+id).show();
			    	$('#zt'+id).hide();
			    };


			    scope.goSearchUp = function(e,id) {
			    	if(e.keyCode===13) {
			    		scope.goSearch(id);
			    	}
			    }

			    scope.goSearchMap = function(id) {			    	
			    	var keywords = $('#sear-map-'+id).val();
			    	var params = {keywords:keywords,cubeId:config.cubeId,codeName:id};
			    	var setting = {
		          		view: {showIcon:false, showTitle: false, showLine:true},
		        		check: {enable: true, chkboxType: { 'Y': '', 'N': '' },chkStyle:'checkbox'},
		        		data: {key: {'name': 'name', 'children': 'childs','checked':'isSelected'}}
		        	};
		        	setting.callback = {};
		        	setting.callback.onCheck = function(e,treeId,node) {
		        		var codeName = treeId.substring(3,treeId.length);
		        		scope.$broadcast('mapSearchSelect',{
		        			type:setting.check.chkStyle,
		        			node:node,
		        			codeName:codeName,
		        		});
		        		$('#'+treeId+' a').css('background','none').css('border','none');
						$('#'+node.tId+'_a').css('background','#d1f1ff').css('border','none');
						ztreeService.setParentsStyle(node.getParentNode(),config.mapDims[codeName]);
		        	}

		        	setting.callback.onClick = function(e,treeId,node) {
		        		var ztree = $.fn.zTree.getZTreeObj(treeId);
		        		ztree.checkNode(node, !node.isSelected, true, true);
		        	}
			    	
			    	var parent =$('#sear-map-'+id).parents('#fixedDimens');
    				if(parent[0]) {
    					setting.check.chkStyle = 'radio';
    				}

			    	switch(id) {
			    		case 'regionCode':
			    			params.action = 'region';
			    		break;
			    		case 'countryCode':
			    		case 'countryTCode':
			    		case 'countrySCode':
			    			params.action = 'country';
			    		break;
			    		case 'indicatorCode':
			    			params.action = 'indicator';
			    		break;
			    		case 'classify_code':
			    			params.action = 'classify';
			    		break;
			    		case 'industryCode':
			    			params.action = 'industry';
			    		break;
			    		case 'commodityCode':
			    			params.action = 'commodity';
			    			
			    		break;
			    		case 'market_code':
			    			params.action = 'market';
			    		break;
			    		case 'booth_code':
			    			params.action = 'booth';
			    		break;
			    		case 'entnature_code':
			    			params.action = 'entnature';
			    		break;
			    	}
			    	dataService.get('search',params).then(function(data) {			    				
		    			var result = digui(data,[],params.codeName);
	    				var ztree = $.fn.zTree.init($('#sml'+id), setting, result);
	    				/*scope.$on('changeFixed',function(e,data) { 
		        			if(data.isRadio) {
		        				setting.check.chkStyle = 'radio';
		        				ztree = $.fn.zTree.init($('#sear-list-'+id), setting, result);
		        			} else {
		        				setting.check.chkStyle = 'checkbox';
		        				ztree = $.fn.zTree.init($('#sml'+id), setting, result);
		        			}
		        		});*/
	    			});
			    	$('#sml'+id).show();
			    	$('#map-in-'+id).hide();
			    };

			    scope.goSearchMapUp = function(e,id) {
			    	if(e.keyCode===13) {
			    		scope.goSearchMap(id);
			    	}
			    }

			    scope.goSearchRegion = function(id) {
			    	var keywords = $('#sear-map-'+id).val();
			    	var params = {keywords:keywords,cubeId:config.cubeId,codeName:id};
			    	var setting = {
		          		view: {showIcon:false, showTitle: false, showLine:true},
		        		check: {enable: true, chkboxType: { 'Y': '', 'N': '' },chkStyle:'checkbox'},
		        		data: {key: {'name': 'name', 'children': 'childs','checked':'isSelected'}}
		        	};
		        	setting.callback = {};
		        	setting.callback.onCheck = function(e,treeId,node) {
		        		var codeName = treeId.substring(3,treeId.length);
		        		scope.$broadcast('mapSearchSelectRegion',{
		        			type:setting.check.chkStyle,
		        			node:node,
		        			codeName:codeName,
		        		});
		        		$('#'+treeId+' a').css('background','none').css('border','none');
						$('#'+node.tId+'_a').css('background','#d1f1ff').css('border','none');
						ztreeService.setParentsStyle(node.getParentNode(),config.mapDims[codeName]);
		        	}

		        	setting.callback.onClick = function(e,treeId,node) {
		        		var ztree = $.fn.zTree.getZTreeObj(treeId);
		        		ztree.checkNode(node, !node.isSelected, true, true);
		        	}
			    	
			    	var parent =$('#sear-map-'+id).parents('#fixedDimens');
    				if(parent[0]) {
    					setting.check.chkStyle = 'radio';
    				}

			    	switch(id) {
			    		case 'regionCode':
			    			params.action = 'region';
			    		break;
			    		case 'countryCode':
			    		case 'countryTCode':
			    		case 'countrySCode':
			    			params.action = 'country';
			    		break;
			    	}
			    	dataService.get('search',params).then(function(data) {			    				
		    			var result = digui(data,[],params.codeName);
	    				var ztree = $.fn.zTree.init($('#sml'+id), setting, result);
	    			});
			    	$('#sml'+id).show();
			    	$('#mapregionCode').hide();
			    }

			    scope.goSearchRegionUp = function(e,id) {
			    	if(e.keyCode===13) {
			    		scope.goSearchRegion(id);
			    	}
			    }


			    


			    

			    //点击其他部分隐藏维度列表
			    $(document).click(function(e) {
			    	if(e.which==1) {
			    		$('.childList').hide();
			    		$('.show-tree').removeClass('opened');
			    		$('.search-list').hide();
			    		element.find('.timeSearch').hide();	
			    	}		    	
			    });


			    function digui(datas,arr,codeName) {
			    	angular.forEach(datas,function(v,k) {
			    		var obj = {
			    			code:v.entity.code,
					    	name:v.entity.name,
					    	parentCode:v.entity.parentCode,
					    	disabled:v.entity.disabled,
					    	isEnd:v.entity.isEnd,
					    	isParent:v.entity.isParent,
					    	allItems:v.entity.allItems,
					    	subItems:v.entity.subItems,
					    	open:true,
					    	chkDisabled:v.entity.chkDisabled,
					    	childs:digui(v.childTree,[],codeName)
			    		}
			    		if(config.dimsbak[codeName].indexOf(v.entity.code)!==-1) {
			    			obj.isSelected = true;
			    		} else {
			    			obj.isSelected = false;
			    		}
			    		arr.push(obj)
			    	});
			    	return arr;
			    }
			}
		};
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