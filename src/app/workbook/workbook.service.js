(function() {
  'use strict';

  angular
    .module('pf.workbook')
    .factory('workbookService', workbookService);

  workbookService.$inject = ['dataService', 'dimensionsService', 'tableFactory', '$rootScope', 'coreCF','conditionService','$timeout'];
  function workbookService(dataService, dimensionsService, tableFactory, $rootScope, config, conditionService,$timeout) {
    var _workbook = null;
    var service = {
      init:init,
      sync:sync,
      rotate:rotate,
      getWorkBook : function() {return _workbook;},
      handleInitData:handleInitData,
      mapInit:mapInit,
      sort:sort,
      openCollectionFile:openCollectionFile,
      logout:logout
    };
    return service;

    //初始化表格
    function init(param) {
      config.newSheetId = Date.parse(new Date())+'s'+Math.random()*10;
      param.metaColumns = '';
      param.metaRows = '';
      param.sheetId = '';
      param.newSheetId =config.newSheetId;
      param.fix = '';
      param.s1={dealStr:config.basicCtrl.filter};
      param.s2 = {method:'',type:''};
      param.s3 = {index8020:'',fontStyle8020:'',bgColor8020:''};
      param.s4 = {index:'',orderStr:''};
      param.s5 = {dealStr:'',showBackColor:'',showFontStyle:''};
      $rootScope.loading=true;
      $rootScope.sheetName = null;
      param.sid = dataService.getCookieObj('sid');
      param = angular.toJson(param);
      var params = {param:param}
      //params = $.param(params);
      dataService.post('init',params).then(function(data) {
        if(data.isLogin!=undefined&&!data.isLogin) {
          logout();return;
        }
        dimensionsService.setDimensionsData(data[0]);
        _workbook = parse(data[0]);
        $rootScope.$broadcast('workbook',_workbook);
      }).catch(function(res) {
        if(!res.isLogin) {
          logout();return;
        }
      });
      dataService.addDataLog(config.cubeId,3);
    }

    function sync(param) {
      $rootScope.loading=true;
      //param = $.param(param);
      dataService.post('dim',param).then(function(data) {        
        config.conditionId = '201102254';
        if(!data[0].tableVO.values) {
          $rootScope.$broadcast('workbook',null);
          return false;
        }
        _workbook = parseTable(data[0]);
        if(config.cubeName!=data[0].sheetInfo.sheetName) {
          $rootScope.sheetName = data[0].sheetInfo.sheetName;
        } else {
          $rootScope.sheetName = null;
        }
        $rootScope.$broadcast('workbook',_workbook);
      });
      config.syncDims = angular.toJson(config.dimsbak);
      config.mapDims.regionCode = config.dimsbak.regionCode;
      $rootScope.$broadcast('mapRegionChange',true);
      dataService.addDataLog(config.cubeId,2);
    }

    function openCollectionFile(cubeId,data) {
      config.mapType = data.mapType;
      $timeout(function(){
        $rootScope.$emit('mapType',config.mapType);
      },10);
      config.cubeId = cubeId;
      config.mainCtrl.s2 = data.controls.s2;
      config.mainCtrl.s3 = data.controls.s3;
      config.mainCtrl.s4 = data.controls.s4;
      config.mainCtrl.s5 = data.controls.s4;
      config.basicCtrl.filter = data.controls.s1.dealStr;
      for(var i in config.dimsbak) {
        config.dimsbak[i]=[];
      }
      angular.forEach(data.dimensionVOLst,function(v,k) {
          config.dimsbak[v.codeName] = v.codes;
      });
      config.syncDims = angular.toJson(config.dimsbak);
      var dims = angular.toJson(data.dimensionVOLst);
      var metaColumns = data.metaColumn.join('-');
      var metaRows = data.metaRow.join('-');
      var fix = data.metaFixed.join('-');
      var param = {
          cubeId : cubeId,
          s1:data.controls.s1,
          s2:data.controls.s2,
          s3:data.controls.s3,
          s4:data.controls.s4,
          s5:data.controls.s5,
          newSheetId:Date.parse(new Date())+'s'+Math.random()*10,
          dims:dims,
          metaColumns:metaColumns,
          metaRows:metaRows,
          fix:fix,
          sid:dataService.getCookieObj('sid')
      }
      config.newSheetId = param.newSheetId;
      $rootScope.loading=true;
      $rootScope.sheetName = null;
      param = angular.toJson(param);
      var params = {param:param}
      //params = $.param(params);
      dataService.post('init',params).then(function(res) {
        dimensionsService.setDimensionsData(res[0]);
        _workbook = parse(res[0]);
        $rootScope.$broadcast('workbook',_workbook);
        $rootScope.$broadcast('cubeIdChange',true);
      });
      dataService.addDataLog(config.cubeId,3);
    }

    //行列转置
    function rotate() {
      var param = conditionService.getParams();
      var transferVar = param.metaColumns;
      param.metaColumns = param.metaRows;
      param.metaRows = transferVar;
      param.sid = dataService.getCookieObj('sid');
      param = angular.toJson(param);
      var params = {param:param};
      //params = $.param(params);
      $rootScope.loading=true;
      dataService.post('dim',params).then(function(data) {
        dimensionsService.setDimensionsData(data[0]);
        _workbook = parse(data[0]);
        $rootScope.$broadcast('workbook',_workbook);
      });
    }

    function handleInitData(obj) {
        var indicator = {codeName:'indicatorCode',codes:obj.INDICATOR_CODE.split(',')};
        config.dimsbak.indicatorCode = obj.INDICATOR_CODE.split(',');
        var arr=[indicator];
        if(obj.TIME_CODE) {
          var time = {codeName:'timeCode',codes:obj.TIME_CODE.split(',')};
          arr.push(time);
          config.dimsbak.timeCode = obj.TIME_CODE.split(',');
        } else {
          config.dimsbak.timeCode = [];
        }
        if(obj.REGION_CODE) {
          var region = {codeName:'regionCode',codes:obj.REGION_CODE.split(',')};
          arr.push(region);
          config.dimsbak.regionCode = obj.REGION_CODE.split(',');
        } else {
          config.dimsbak.regionCode = [];
        }
        if(obj.CLASSIFY_CODE) {
          var classify = {codeName:'classify_code',codes:obj.CLASSIFY_CODE.split(',')};
          arr.push(classify);
          config.dimsbak.classify_code = obj.CLASSIFY_CODE.split(',');
        } else {
          config.dimsbak.classify_code = [];
        }
        if(obj.INDUSTRY_CODE) {
          var industry = {codeName:'industryCode',codes:obj.INDUSTRY_CODE.split(',')};
          arr.push(industry);
          config.dimsbak.industryCode = obj.INDUSTRY_CODE.split(',');
        } else {
          config.dimsbak.industryCode = [];
        }
        if(obj.COUNTRY_CODE) {
          var country = {codeName:'countryCode',codes:obj.COUNTRY_CODE.split(',')};
          arr.push(country);
          config.dimsbak.countryCode = obj.COUNTRY_CODE.split(',');
        } else {
          config.dimsbak.countryCode = [];
        }
        if(obj.COUNTRY_S_CODE) {
          var countrys = {codeName:'countrySCode',codes:obj.COUNTRY_S_CODE.split(',')};
          arr.push(countrys);
          config.dimsbak.countrySCode = obj.COUNTRY_S_CODE.split(',');
        } else {
          config.dimsbak.countrySCode = [];
        }
        if(obj.COUNTRY_T_CODE) {
          var countryt = {codeName:'countryTCode',codes:obj.COUNTRY_T_CODE.split(',')};
          arr.push(countryt);
          config.dimsbak.countryTCode = obj.COUNTRY_T_CODE.split(',');
        } else {
          config.dimsbak.countryTCode = [];
        }
        if(obj.COMMODITY_CODE) {
          var commodity = {codeName:'commodityCode',codes:obj.COMMODITY_CODE.split(',')};
          arr.push(commodity);
          config.dimsbak.commodityCode = obj.COMMODITY_CODE.split(',');
        } else {
          config.dimsbak.commodityCode = [];
        }
        if(obj.SEX_CODE) {
          var sex = {codeName:'sex_code',codes:obj.SEX_CODE.split(',')};
          arr.push(sex);
          config.dimsbak.sex_code = obj.SEX_CODE.split(',');
        } else {
          config.dimsbak.sex_code = [];
        }
        if(obj.MARKET_CODE) {
          var market = {codeName:'market_code',codes:obj.MARKET_CODE.split(',')};
          arr.push(market);
          config.dimsbak.market_code = obj.MARKET_CODE.split(',');
        } else {
          config.dimsbak.market_code = [];
        }
        if(obj.BOOTH_CODE) {
          var booth = {codeName:'booth_code',codes:obj.BOOTH_CODE.split(',')};
          arr.push(booth);
          config.dimsbak.booth_code = obj.BOOTH_CODE.split(',');
        } else {
          config.dimsbak.booth_code = [];
        }
        if(obj.ENTNATURE_CODE) {
          var entnature = {codeName:'entnature_code',codes:obj.ENTNATURE_CODE.split(',')};
          arr.push(entnature);
          config.dimsbak.entnature_code = obj.ENTNATURE_CODE.split(',');
        } else {
          config.dimsbak.entnature_code = [];
        }
        config.syncDims = angular.toJson(config.dimsbak);
        var dims = angular.toJson(arr);
        return dims;
      }


      function mapInit(){
        config.mapDims = {}
        for(var i in config.dimsbak) {
          if(i==='regionCode'||i==='countryCode') {
              config.mapDims[i] = config.dimsbak[i]; 
          } else {
              if(config.dimsbak[i][0]) {
                config.mapDims[i] = [config.dimsbak[i][0]];
              }
          }
        }
        var params = config.mapDims;
        return params;
      }



    /**
     * 解析源数据, 创建表对象
     * @param  {Object} source 后台源
     * @return {Sheet} 工作表
     */
    function parse(source) {
      var sheetInfo = source.sheetInfo;
      var id = sheetInfo.sheetId;
      var name = sheetInfo.sheetName;
      var cubeId = sheetInfo.cubeId;
      if(source.tableVO.values===undefined) {
        var table = null;
      } else {
        var table = tableFactory.parse(source.tableVO);
      }    
      return table;  
    }

    function parseTable(source) {
      var table = tableFactory.parse(source.tableVO);
      return table;
    }

    function sort(index,type) {
      config.sorts = {index:index,type:type};
      var param = conditionService.getParams('after');
      param.sid = dataService.getCookieObj('sid');
      param = angular.toJson(param);
      var params = {param:param};
      //params = $.param(params);
      $rootScope.loading=true;
      dataService.post('dim',params).then(function(data) {
        config.conditionId = '201102254';
        _workbook = parseTable(data[0]);
        $rootScope.$broadcast('workbook',_workbook);
      });
    }


    function handleParams() {
      var obj = angular.fromJson(config.syncDims);
      var condition = conditionService.getCondition();
      if(obj!=config.dimsbak) {
        angular.forEach(condition.dimensionVOLst,function(v,k) {
          v.codes = obj[v.codeName];
        });
      }
      var dims = JSON.stringify(condition.dimensionVOLst);
      var metaColumns = condition.metaRow.join('-');
      var metaRows = condition.metaColumn.join('-');      
      var params = {cubeId:config.cubeId,dims:dims,metaColumns:metaColumns,metaRows:metaRows};
      if(condition.metaFixed) {
        var metaFixeds = condition.metaFixed.join('-');
        params.metaFixeds = metaFixeds;
      }
      return params;
    }

    function logout() {
      var sid = dataService.getCookieObj('sid');
      dataService.removeCookie('entryType',{path:'/'});
      dataService.removeCookie('clientName',{path:'/'});
      dataService.removeCookie('cubeId',{path:'/'});
      dataService.removeCookie('nickName',{path:'/'});
      dataService.removeCookie('sid',{path:'/'});
      dataService.removeCookie('user',{path:'/'});
      dataService.removeCookie('name',{path:'/'});
      $.ajax({
          type:'get',
          url: config.baseUrl+'user/loginOut',
          data:{sid:sid},
          complete: function () {
              window.location.href='/index.html';
          }
      });
    }
  }

})();