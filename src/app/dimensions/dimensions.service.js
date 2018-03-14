(function() {
	'use strict';
	angular.module('pf.core')
	.factory('dimensionsService',dimensionsService);
	dimensionsService.$inject = ['$rootScope', 'conditionService','coreCF'];
	function dimensionsService($rootScope, conditionService,config) {
		var _dimensionsData = null;
		var _mapDimensionsData = null;
		var _mapType = 'china';
		var countryCode = [];
		var service = {
			setDimensionsData : setDimensionsData,
			getMapDimens:getMapDimens,
			getMapType:function() {return _mapType;}
		};
		return service;

		function setDimensionsData(obj) {
			var dimensions = {
	          rowDimens : obj.accordionVO.metaColumn,
	          colDimens : obj.accordionVO.metaRow,
	          fixedDimens : []
	        };
	        var mapDimens = {
	        	region:[],
	        	fixed:[]
	        };
	        var metaRowStr = obj.accordionVO.metaRow.join('-');
	        var metaColumnStr = obj.accordionVO.metaColumn.join('-');//此处并非脱了裤子放屁，因为原有数据是引用类型，没法直接赋值，只能使用新的基本类型，转成引用类型开辟新的堆
	        var conditions = {
	        	dimensionVOLst :[],
	        	metaColumn : metaColumnStr.split('-'),
	        	metaRow:metaRowStr.split('-'),
	        };
	        if(obj.accordionVO.metaFixed) {	        	
	        	conditions.metaFixed = obj.accordionVO.metaFixed
	        } else {
	        	conditions.metaFixed = [];
	        }
	        angular.forEach(obj.accordionVO.dimensionVOLst,function(v,k) {
	          if(obj.accordionVO.metaColumn.indexOf(v.codeName)!=-1) {
	          	var data = digui(v.objLst,[]);
	          	v.objLst = data;
	          	if(v.codeName==='timeCode') {
	          		v.objLst = v.objLst.reverse();
	          	}
	          	var num  = dimensions.rowDimens.indexOf(v.codeName);
	          	dimensions.rowDimens[num]=v;
	            var selectedCodes = digui2(data,[]); 
	          	var demo = {
	          		codeName:v.codeName,
	          		codes:selectedCodes
	          	}
	          	conditions.dimensionVOLst.push(demo);
	          	if(config.dimsbak[v.codeName]) {
	          		config.dimsbak[v.codeName] = config.dimsbak[v.codeName].concat(demo.codes);
	          		config.dimsbak[v.codeName] = unique(config.dimsbak[v.codeName]);
	          	} else {
	          		config.dimsbak[v.codeName] = demo.codes;
	          	}
	          } else if(obj.accordionVO.metaRow.indexOf(v.codeName)!=-1) {
	            var data = digui(v.objLst,[]);
	          	v.objLst = data;
	          	if(v.codeName==='timeCode') {
	          		v.objLst = v.objLst.reverse();
	          	}
	          	var num  = dimensions.colDimens.indexOf(v.codeName);
	          	dimensions.colDimens[num]=v;
	          	var selectedCodes = digui2(data,[]); 
	          	var demo = {
	          		codeName:v.codeName,
	          		codes:selectedCodes
	          	}
	          	conditions.dimensionVOLst.push(demo);
	          	if(config.dimsbak[v.codeName]) {
	          		config.dimsbak[v.codeName] = config.dimsbak[v.codeName].concat(demo.codes);
	          		config.dimsbak[v.codeName] = unique(config.dimsbak[v.codeName]);
	          	} else {
	          		config.dimsbak[v.codeName] = demo.codes;
	          	}         	
	          } else {
	          	var data = digui(v.objLst,[]);
	          	v.objLst = data;
	          	if(v.codeName==='timeCode') {
	          		v.objLst = v.objLst.reverse();
	          	}
	            dimensions.fixedDimens.push(v);
	            var selectedCodes = digui2(data,[]);
	          	var demo = {
	          		codeName:v.codeName,
	          		codes:selectedCodes
	          	}
	          	conditions.dimensionVOLst.push(demo);
	          	if(config.dimsbak[v.codeName]) {
	          		config.dimsbak[v.codeName] = config.dimsbak[v.codeName].concat(demo.codes);
	          		config.dimsbak[v.codeName] = unique(config.dimsbak[v.codeName]);
	          	} else {
	          		config.dimsbak[v.codeName] = demo.codes;
	          	}
	          }

	          if(v.codeName==='regionCode') {
	          	mapDimens.region.push(v);
	          } else {
	          	mapDimens.fixed.push(v);
	          }
	        });
	        _dimensionsData = dimensions;
	        _mapDimensionsData = mapDimens;
	        $rootScope.$emit('dimensChange',dimensions);
	        conditionService.setCondition(conditions);
	        conditionService.setSheetId(obj.sheetInfo.sheetId);
	        conditionService.setFreqId(obj.sheetInfo.freqId);
		}

		function digui2(data,arr) {
			angular.forEach(data,function(v,k) {
				if(v.isSelected===true) {
					arr.push(v.code);
				}
				if(v.childs) {
					digui2(v.childs,arr);
				} 				
			});
			return arr;
		}

		function digui(data,arr) {
			angular.forEach(data,function(v,k) {
				var obj = {
					code: v.entity.code,
					disabled: v.entity.disabled,
					isEnd: v.entity.isEnd,
					isVal: v.entity.isVal,
					isParent: v.entity.isParent,
					isSelected: v.entity.isSelected,
					name: v.entity.name,
					childs:digui(v.childTree,[]),
				}
				if(v.entity.isVal==0) {
					obj.chkDisabled = true;
				}
				arr.push(obj);
			});
			return arr;
		}

		function unique(arr){
			var tmp = new Array();
			for(var i in arr){
				if(tmp.indexOf(arr[i])==-1){
					tmp.push(arr[i]);
				}
			}
			return tmp;
		}

		function getMapDimens() {
			if(_mapDimensionsData.region.length===0) {
				var keepGoing = true;
				angular.forEach(_mapDimensionsData.fixed,function(v,k) {
					if(keepGoing) {
						if(v.codeName==='countryCode'||v.codeName==='countryTCode') {
							_mapDimensionsData.region[0] = v;
							_mapDimensionsData.fixed.splice(k,1);
							_mapType = 'world';
							keepGoing = false;
						}
					}
				});
			} else {
				_mapType = 'china';
			}
			return _mapDimensionsData;			
		}
	}
})();