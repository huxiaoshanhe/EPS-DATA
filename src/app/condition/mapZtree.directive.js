(function() {
	'use strict';
	var _statusChange = {}; // 状态缓存
	var mapParentCodes = {
    	indicatorCode:[],
        classify_code:[],
        industryCode:[],
        commodityCode:[],
        regionCode:[]
    };
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
	var _getClickCallback = function(treeId, node, config) {
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
	        if(checked==true) {
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
	        	var checked = (ary.indexOf(oper) !==-1 ? true : !node.checked);
	        	if(checked==true) {
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
	    			toggle(nodes, key);
	          		break;
	        	case 'unsel':
	          		nodes = ztree.transformToArray(ztree.getNodes());
	          		untoggle(nodes, key);
	          		break;
	        	case 'sel-peer':
	        		var pnode = node.getParentNode();
	        		if (pnode === null) { nodes = ztree.getNodes(); }
	           		else { nodes = pnode.childs; }
	    			toggle(nodes, key);
	        		break;
	        	case 'unsel-perr':
	        		var pnode = node.getParentNode();
	        		if (pnode === null) { nodes = ztree.getNodes(); }
	           		else { nodes = pnode.childs; }
	           		untoggle(nodes, key);
	        		break;
	        	case 'sel-son':
	        		nodes = duiguiNode(node.childs,[]);
	    			toggle(nodes, key);
	        		break;
	        	case 'unsel-son': 
	        		nodes = duiguiNode(node.childs,[]);
	    			untoggle(nodes, key);
	        		break;
        		default: break;
	    	}
	    };
	};
	angular.module('pf.condition')
	.directive('mapZtree',mapZtreeDirective)
	.directive('mapRadioZtree',mapRadioZtreeDirective);
	mapZtreeDirective.$inject = ['rightmenuService','coreCF'];
	function mapZtreeDirective(rightmenuService,config) {
		return {
			restrict:'E',
			replace:true,
			template:'<div class="childList-inner ztree"></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {	
				scope.data = diguiSelect(scope.data,config.mapDims['regionCode']);
				var Id = attr.id;
				var setting = {
		        	view: {showIcon:false, showTitle: false, showLine:true},
		        	check: {enable: true, chkboxType: { 'Y': '', 'N': '' },chkStyle:'checkbox'},
		        	data: {key: {'name': 'name', 'children': 'childs','checked':'isSelected'}}
		        };
		        setting.callback = {};
		        setting.callback.onClick = function(e, treeId, node) {
		        	ztree.checkNode(node, !node.isSelected, true, true);
		        	scope.$apply();
		        };
		        setting.callback.onCheck = function(e, treeId, node) {
		        	var num = config.mapDims.regionCode.indexOf(node.code);
		        	if(node.isSelected) {
		        		if(num===-1) {
		        			config.mapDims.regionCode.push(node.code);
		        		}
		        	} else {
		        		config.mapDims.regionCode.splice(num,1);
		        	}
		        	setStyle();
		        	noNeedReloadStyle('regionCode');
		        };
		        setting.callback.onExpand = function(e, treeId, node) {
		        	var codeName = treeId.substring(3,treeId.length);
		        	if(node.childs) {
		        		angular.forEach(node.childs,function(v,k) {
		        			if(config.mapDims[codeName].indexOf(v.code)!==-1) {
		        				$('#'+v.tId+'_a').css('background','#d1f1ff');
		        			}
		        		});
		        	}
		        	noNeedReloadStyle('regionCode');
		        }
		        setting.callback.onRightClick = function(e, treeId, node) {
		        	if (!node) { return; }
		        	var menuData = getRightMenuData(node);
		        	rightmenuService.createMenu(menuData, _getClickCallback(treeId, node, config));
		        	rightmenuService.show(e.pageY, e.pageX);
		        	scope.$apply();
		        };
		        var ztree = $.fn.zTree.init(element, setting, scope.data);
		    	setStyle();
		        noNeedReloadStyle('regionCode');

		        scope.$on('mapRegionChange',function(e,data) {
					var datas = diguiSelect(ztree.getNodes(),config.mapDims['regionCode']);
					ztree = $.fn.zTree.init(element, setting, datas);//选中之后重新渲染ztree
        			noNeedReloadStyle('regionCode');
        		});
		    	

		    	/**维度内搜索**/
				scope.$on('mapSearchSelectRegion',function(e,data) {
					config.mapDims['regionCode'].push(data.node.code);
					var datas = diguiSelect(ztree.getNodes(),config.mapDims['regionCode']);
					ztree = $.fn.zTree.init(element, setting, datas);//选中之后重新渲染ztree
        			noNeedReloadStyle('regionCode');
        		});

		    	function setStyle() {
					element.find('.checkbox_false_part').siblings('a').css('border','1px solid #282828').css('background','none');
					element.find('.checkbox_false_full').siblings('a').css('border','none').css('background','none');
					element.find('.checkbox_true_part').siblings('a').css('border','none').css('background','#d1f1ff');	
					element.find('.checkbox_true_full').siblings('a').css('border','none').css('background','#d1f1ff');						
				}
				function noNeedReloadStyle(codeName) {
					var _nodes = ztree.transformToArray(ztree.getNodes());
					element.find('a').css('background','none').css('border','none');
					angular.forEach(_nodes,function(v,k) {
						if(config.mapDims[codeName].indexOf(v.code)!==-1) {
							setParentsStyle(v.getParentNode(),codeName);
							$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
						}
					});
				}
				function setParentsStyle(node,codeName) {
					if(node) {
						if(config.mapDims[codeName].indexOf(node.code)!==-1) {
			    			$('#'+node.tId+'_a').css('border','none');
			    		} else {
			    			$('#'+node.tId+'_a').css('border','1px solid #282828');
			    		}
			    		setParentsStyle(node.getParentNode(),codeName);		        		
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
		    }
		    
		}
	}

	mapRadioZtreeDirective.$inject = ['coreCF','ztreeService'];
	function mapRadioZtreeDirective(config,ztreeService) {
		return {
			restrict:'E',
			replace:true,
			template:'<div class="childList-inner ztree"></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				var Id = attr.id;
				var setting = {
		        	view: {
						showIcon: showIconForTree, showLine:true
					},
					data: {
						simpleData: {
							enable: true
						},key: {'name': 'name', 'children': 'childs','checked':'isSelected'}}
		        };
		        function showIconForTree(treeId, treeNode) {
					return !treeNode.isParent;
				};

		        setting.callback = {};
		        setting.callback.onClick = function(e, treeId, node) {
		        	var codeName = treeId.substring(7,treeId.length);
		        	config.mapDims[codeName] = [node.code];
		        	if(node.isVal!=undefined&&node.isVal==0) {
		          		return false;
		          	}
		        	$('#'+treeId+' a').css('background','none').css('border','none');
					$('#'+node.tId+'_a').css('background','#d1f1ff').css('border','none');
					ztreeService.setMapParentsStyle(node.getParentNode(),codeName);
		        };

		        var currentMapCodes= config.mapDims;
		        var needReloadIds = ['map-in-indicatorCode','map-in-classify_code','map-in-industryCode','map-in-commodityCode'];
		        if(needReloadIds.indexOf(Id)!==-1) {//需要二次加载的维度
		        	var codeName = Id.substring(7,Id.length);
		        	angular.forEach(scope.data,function(v,k) {
		        		if(currentMapCodes[codeName].indexOf(v.code)!==-1) {
		        			v.checked = true;
		        		}
		        	});
		        	//根据当前指标查找出其所有父级指标
			        var parentUrlParams = ztreeService.getParentsParams(codeName,'single');
			        getParents(mapParentCodes,parentUrlParams.urlStr,parentUrlParams.datas,codeName);
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

					/**维度内搜索**/
					scope.$on('mapSearchSelect',function(e,data) {
						config.mapDims[data.codeName] = [data.node.code];
						var id = data.node.code;
				    	var urlParams = ztreeService.getParentUrl(data.codeName,id);
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
						var datas = diguiSelect(ztree.getNodes(),config.mapDims[data.codeName]);
						ztree = $.fn.zTree.init(element, setting, datas);//选中之后重新渲染ztree
	        		});
					setting.data = {simpleData: {enable: true}};
					setting.callback.beforeExpand=beforeExpand;
					setting.callback.onAsyncSuccess=onAsyncSuccess;
					setting.callback.onAsyncError=onAsyncError;
					setting.callback.onNodeCreated = zTreeOnNodeCreated;
		        } else {
        			scope.$on('mapSearchSelect',function(e,data) {			        			
	        			config.mapDims[data.codeName] = [data.node.code];
	        			var datas = diguiSelect(ztree.getNodes(),config.mapDims[data.codeName]);
	        			ztree = $.fn.zTree.init(element, setting, datas);
	        			setStyle();
	        		});
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
		        	var codeName = treeId.substring(7,treeId.length);
		        	angular.forEach(treeNode.children,function(v,k) {
		        		if(currentMapCodes[codeName].indexOf(v.code)!==-1) {
			            	$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
			            	$('#'+treeId+' a').css('background','none');
		            		if(keepGo[codeName]) {
		            			$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
		            			keepGo[codeName] = false;
		            		}
			            } else {
			            	v.isSelected = false;
			            }
		        	});
		        	treeNode.childs =treeNode.children;
		        }


		        function zTreeOnNodeCreated(event, treeId, treeNode) {
		        	var codeName = treeId.substring(7,treeId.length);
		        	if(mapParentCodes[codeName].indexOf(treeNode.code)!==-1) {
		        		$('#'+treeNode.tId+'_a').css('border','1px solid #282828');
			        }
			        if(config.mapDims[codeName].indexOf(treeNode.code)!==-1) {
			        	$('#'+treeNode.tId+'_a').css('border','none');
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
		        var commonDimens = ['timeCode','countryCode','countryTCode','countrySCode','entnature_code','booth_code','market_code','sex_code'];
		        if(commonDimens.indexOf(codeName)!==-1) {//不需二次加载的维度
					var _nodes = ztree.transformToArray(ztree.getNodes());
					angular.forEach(_nodes,function(v,k) {
						if(config.mapDims[codeName].indexOf(v.code)!==-1) {
							ztreeService.setParentsStyle(v.getParentNode(),config.dimsbak[codeName]);	        								
							$('#'+v.tId+'_a').css('background','#d1f1ff').css('border','none');
						}
					});
				}
		    }
		}

		function getParents(mapParentCodes,urlStr,datas,codeName,needReturn) {
			$.ajax({
            	url:urlStr,
            	type:'POST',
            	data:datas,
            	async:false,
            	success:function(resource) {
            		if(resource) {
	                	var str = angular.fromJson(resource).ids;
	                	var arr = str.split(',');
	                	mapParentCodes[codeName] = arr;                
	                }           
            	},
            	error:function(msg) {
            		mapParentCodes[codeName] = [];
            	}
            });
            if(needReturn) {
            	var arr = mapParentCodes[codeName];
            	return arr;
            }
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