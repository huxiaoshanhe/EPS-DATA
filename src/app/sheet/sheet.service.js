(function() {
  'use strict';

  angular
    .module('pf.workbook')
    .factory('sheetService', sheetService);

  sheetService.$inject = ['$rootScope','handsontableService','chartService','workbookService','toolService','coreCF','dataService'];
  function sheetService($rootScope,handsontableService,chartService,workbookService,toolService,config,dataService) {
   	var service = {
      toolCtrl:toolCtrl,
      chartInit:chartInit
    };
    return service;
    function toolCtrl(cmd,type) {
      switch(type) {
        case 'table':
          switch(cmd) {
            case 'folder':
                $rootScope.$emit('showWindow',true);
                var user = dataService.getCookieObj('user');
                user = angular.fromJson(user);
                if(user.userType=='GROUP'&&(user.groupUserId==''||user.groupUserId==null||user.groupUserId==undefined)) {
                    $rootScope.$broadcast('loginPersonal',true);
                } else {
                    $rootScope.$broadcast('showFolder',true);
                }                
                break;
            case 'save':
                $rootScope.$emit('showWindow',true);
                var user = dataService.getCookieObj('user');
                user = angular.fromJson(user);
                if(user.userType=='GROUP'&&(user.groupUserId==''||user.groupUserId==null||user.groupUserId==undefined)) {
                    $rootScope.$broadcast('loginPersonal',true);
                } else {
                    $rootScope.$broadcast('showSaveFile',true);
                } 
                break;
            case 'downloadDoc':
                toolService.excelDownload();
                break;
            case 'refresh':
                $rootScope.$emit('refreshData',true);
                $rootScope.$broadcast('refreshData',true);
                config.basicCtrl = {
                    filter:true,
                    percent:false,
                    moneyStyle:false
                }
                break;
            case 'rotate':
                workbookService.rotate();
                break;
            case 'filter':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showFilter',true);
                break;
            case 'highLight':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showHighLight',true);
                break;
            case 'formatConditions':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showConditionStyle',true);
                break;
            case 'calculate':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showTableCalculate',true);
                break;
            case '8020Analysis':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showEtAnalysis',true);
                break;
            case 'lags':
                toolService.lag();
                break;
            case 'growthRates':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showGrowthRate',true);
                break;
            case 'log':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showLog',true);
                break;
            case 'userDefinedFn':
                $rootScope.$emit('showWindow',true);
                $rootScope.$broadcast('showUserDefinedFn',true);
                break;
            case 'routineMode':
                handsontableService.routineMode(true);
                break;
            case 'addPoint':
                handsontableService.adjustFloatSize(1);
                break;
            case 'decreasePoint':
                handsontableService.adjustFloatSize(-1);
                break;
            case 'percentStyle':
                config.basicCtrl.moneyStyle = false;
                config.basicCtrl.percentStyle = !config.basicCtrl.percentStyle;
                handsontableService.addSelectedAreaCalc({percent:config.basicCtrl.percentStyle});
                break;
            case 'delimitStyle':
                handsontableService.adjustFloatSize(0);
                break;
            case 'moneyStyle':
                config.basicCtrl.percentStyle = false;
                config.basicCtrl.moneyStyle = !config.basicCtrl.moneyStyle;
                handsontableService.moneyStyle(config.basicCtrl.moneyStyle);
                break;
          }
        break;
        case 'chart':
          switch(cmd) {           
            case 'userDefinedChart':
            $rootScope.$emit('showWindow',true);
            $rootScope.$broadcast('showDfinedChart',true);
            break;
            case 'dataValue':
            case 'legend':
            chartService.setChartAttr(cmd);
            break;
            case 'Scatter':
            $rootScope.$emit('showWindow',true);
            $rootScope.$broadcast('showScatterWin',true);
            break;
            case 'downloadImage':
            $rootScope.$broadcast('downloadImage',true);
            break;
            default:
            chartService.getCharts(cmd);
            break;
          }
          break;
          case 'map':
            switch(cmd) {
                case 'downloadDoc':
                    $rootScope.$broadcast('mapDownload',{type:'excel'});
                break;
                case 'downloadPdf':
                    $rootScope.$broadcast('mapDownload',{type:'pdf'});
                break;
                case 'downloadMapImage':
                $rootScope.$broadcast('downloadMapImage',true);
                break;
            }
      }
    }

    function chartInit() {
        chartService.init();
    }
  }

})();