(function() {
	'use strict';
	angular.module('pf.condition')
	.factory('conditionService',conditionService);
	conditionService.$inject = ['coreCF','$rootScope'];
	function conditionService(config,$rootScope) {
		var _sheetId = null;
		var _freqId = null;
		var _condition = null;
		var _linshiDemo = null;
		var _proDimNodes = {};
		var service = {
			getCondition:getCondition,
			getSheetId:function() {return _sheetId;},
			changeDimen:changeDimen,
			dimenSort:dimenSort,
			changAllSel:changAllSel,
			changChildrenSel:changChildrenSel,
			changeRadioDimen:changeRadioDimen,
			setSheetId:function(sheetId) {_sheetId = sheetId;},
			setCondition:setCondition,
			setFreqId :function(freqId) {_freqId = freqId;},
			getFreqId :function() {return _freqId;},
			getParams :getParams,
			paramsExtends:paramsExtends,
			setProDimNodes:setProDimNodes,
			getProDimNodes:getProDimNodes
		};
		return service;
		

		function setCondition(condition) {
			angular.forEach(condition.dimensionVOLst,function(v,k) {
				v.codes = config.dimsbak[v.codeName];
			});
			_condition = condition;
		}


		/**
		 *更改维度的选择项
		 *@param {string} dimen 维度名称
		 *@param  {string} id 
		 *@param  {boolean} flag 选中？取消 
		*/
		function changeDimen (dimen,id,flag) {
			for(var i in _condition) {
				angular.forEach(_condition[i],function(v,k) {
					if(v.codeName == dimen) {
						if(flag ==true) {
							var num = v.codes.indexOf(id);
							if(num===-1) {
								var tds = checkNum(dimen,1);
								v.codes.push(id);
							}							
						} else {
							var num = v.codes.indexOf(id);
							if(num!==-1) {
								v.codes.splice(num,1);
							}
						}
						config.dimsbak[dimen] = v.codes;
					}
				});
			}
		}

		function checkNum(dimen,numa) {
			var num = config.dimsbak[dimen].length+numa+_condition.metaRow.length;
			for(var i in config.dimsbak) {
				if(i!=dimen&&config.dimsbak[i].length>0) {
					num = num*(config.dimsbak[i].length+_condition.metaColumn.length);
				}
			}
			return num;
		}

		//更改维度顺序
		function dimenSort(arr,lan) {
			if(lan=='colDimens') {
				_condition.metaColumn = arr;				
			} else if(lan=='rowDimens') {
				_condition.metaRow = arr;	
			} else if(lan=='fixedDimens') {
				_condition.metaFixed = arr;	
			}
		}

		

		function changeRadioDimen(codeName,code) {
			var keepGoing = true;
			angular.forEach(_condition.dimensionVOLst,function(v,k) {
				if(keepGoing) {
					if(v.codeName==codeName) {						
						v.codes = [code];
						config.dimsbak[codeName] = [code];
						keepGoing = false;
					}
				}				
			});
		}

		function changAllSel(codeName,arr,flag) {
			if(flag) {
				angular.forEach(_condition.dimensionVOLst,function(v,k) {
					if(v.codeName===codeName) {
						v.codes = arr;
						config.dimsbak[codeName] = v.codes;
					}
				});
				//$rootScope.$apply();
			} else {
				angular.forEach(_condition.dimensionVOLst,function(v,k) {
					if(v.codeName===codeName) {
						v.codes = [];						
						config.dimsbak[codeName] = [];
					}
				});
			}
		}

		function changChildrenSel(codeName,arr,flag) {
			if(flag) {
				angular.forEach(_condition.dimensionVOLst,function(v,k) {
					if(v.codeName===codeName) {
						angular.forEach(arr,function(ve,ke) {
							if(v.codes.indexOf(ve)==-1) {
								v.codes.push(ve);
							}
							config.dimsbak[codeName] = v.codes;
						});
					}
				});
				$rootScope.$apply();
			} else {
				angular.forEach(_condition.dimensionVOLst,function(v,k) {
					if(v.codeName===codeName) {
						angular.forEach(arr,function(ve,ke) {
							var num = v.codes.indexOf(ve)
							if(num!==-1) {
								v.codes.splice(num,1);
							}
							config.dimsbak[codeName] = v.codes;
						});
					}
				});
			}
			//
		}


		function getCondition() {
			angular.forEach(_condition.dimensionVOLst,function(v,k) {
				v.codes = config.dimsbak[v.codeName];
			});
			return _condition;
		}

		function getParams(where) {
			var conditions = _condition;
			var params = {cubeId:config.cubeId,sheetId:_sheetId};
			if(arguments.length==1) {
				var dimsSync = angular.fromJson(config.syncDims);
				var arr = [];
				angular.forEach(conditions.dimensionVOLst,function(v,k) {
					var obj = {codeName:v.codeName,codes:dimsSync[v.codeName]};
					arr.push(obj);
				});
				params.dims = angular.toJson(arr)
			} else {
				params.dims = angular.toJson(conditions.dimensionVOLst)
			}
			
	        if(conditions.metaColumn.length!==0) {
	            params.metaColumns = conditions.metaColumn.join('-');
	        }
	        if(conditions.metaRow.length!==0) {
	            params.metaRows = conditions.metaRow.join('-');
	        }
	        if(conditions.metaFixed.length!==0) {
	            params.fix = conditions.metaFixed.join(',');
	        }
	        params = angular.extend(paramsExtends(),params);
	        return params;
		}

		function paramsExtends() {
			var result = {};
			if(config.newSheetId) {
				result.newSheetId = config.newSheetId;
			} else {
				result.newSheetId = '';
			}
			result.s1 = angular.fromJson({dealStr:config.basicCtrl.filter});
			result.s2 = angular.fromJson(config.mainCtrl.s2);
			result.s3 = angular.fromJson(config.mainCtrl.s3);
			result.s4 = angular.fromJson({orderStr:config.sorts.type,index:config.sorts.index});
			result.s5 = angular.fromJson(config.mainCtrl.s5);
			return result;
		}

		/**
		 * 保存维度的原有nodes，以便搜索维度全选等，为原维度添加样式时使用
		 * @param  {String} dimName 维度名
		 * @param  {Array} nodes 节点组
		 */
		function setProDimNodes(dimName,nodes) {
			_proDimNodes[dimName] = nodes;
		}

		/**
		 * 保存维度的原有nodes，以便搜索维度全选等，为原维度添加样式时使用
		 * @param  {String} dimName 维度名
		 */
		function getProDimNodes(dimName) {
			return _proDimNodes[dimName];
		}
		
	}
})();