(function() {
	'use strict';
	angular.module('pf.charts')
	.factory('mapService',mapService);

	mapService.$inject = ['dimensionsService','coreCF','dataService','conditionService'];
	function mapService(dimensionsService,config,dataService,conditionService) {
		var _mapTimes = null;
		var service = {
			setTimes:setTimes,
			getTimes:function() {return _mapTimes;},
			getMapParam:getMapParam
		};
		return service;

		function setTimes(times) {
			var freqId = conditionService.getFreqId();
			
			_mapTimes = times;
		}

		function getMapParam() {
			var params = {
	            cubeId:config.cubeId,
	            indicatorCode:config.mapDims.indicatorCode[0],
	            timeCode:config.mapDims.timeCode[0]
	        };
	        if(config.mapDims.regionCode) {
	        	params.regionCode = config.mapDims.regionCode.join(',');	            
	        }
	        if(config.mapDims.industryCode&&config.mapDims.industryCode.length>0) {
	            params.industryCode=config.mapDims.industryCode[0];
	        }
	        if(config.mapDims.classify_code&&config.mapDims.classify_code.length>0) {
	            params.classify_code=config.mapDims.classify_code[0];
	        }
	        if(config.mapDims.commodityCode&&config.mapDims.commodityCode.length>0) {
	            params.commodityCode=config.mapDims.commodityCode[0];
	        }
	        if(config.mapDims.entnature_code&&config.mapDims.entnature_code.length>0) {
	            params.entnature_code=config.mapDims.entnature_code[0];
	        }
	        if(config.mapDims.booth_code&&config.mapDims.booth_code.length>0) {
	            params.booth_code=config.mapDims.booth_code[0];
	        }
	        if(config.mapDims.market_code&&config.mapDims.market_code.length>0) {
	            params.market_code=config.mapDims.market_code[0];
	        }
	        if(config.mapDims.sex_code&&config.mapDims.sex_code.length>0) {
	            params.sex_code=config.mapDims.sex_code[0];
	        }
	        if(config.mapDims.countryCode&&config.mapDims.countryCode.length>0) {
	            if(config.mapDims.regionCode===0) {
	                params.regionCode=config.mapDims.countryCode[0];
	            } else {
	                params.countryCode=config.mapDims.countryCode[0];
	            }            
	        }
	        if(config.mapDims.countryTCode&&config.mapDims.countryTCode.length>0) {
	        	if(config.mapDims.regionCode) {
	        		params.countryTCode = config.mapDims.countryTCode.concat(config.mapDims.regionCode);
	        	} else {
	        		params.countryTCode = config.mapDims.countryTCode
	        	}
	        	params.countryTCode = params.countryTCode.join(',');
	        	params.countrySCode = config.mapDims.countrySCode[0];
	        	delete params.regionCode;
	        }
	        return params;
		}
	}
})();