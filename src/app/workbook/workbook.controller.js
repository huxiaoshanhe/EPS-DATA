(function() {
  'use strict';
  // 工作簿数据展现

  angular
    .module('pf.workbook')
    .controller('WorkBookCtrl', workbookCtrl);

  workbookCtrl.$inject = ['$rootScope', 'conditionService', 'dispatchService', 'workbookService', 'coreCF', 'errorService','dimensionsService','dataService','mapService'];
  function workbookCtrl($rootScope, conditionService, dispatchService, workbookService, config, errorService,dimensionsService,dataService,mapService) {
    var that  = this;
    that.showTable = true;
    that.showCubes = true;
    that.showDimensions = true;
    that.topCutFlag = false;
    //that.menuData = dispatchService.getCoolMenu();

    $rootScope.$on('dimensChange',function(event,data) {
        that.dimensions = data;
    });

    //监听工具栏的刷新按钮
    $rootScope.$on('refreshData',function(e,data) {
        config.sorts = {index:'',type:''};
        config.basicCtrl.filter='empty'; 
        config.mainCtrl = {
            's2':{'method': '','type': ''},
            's3': {'index8020': '0','fontStyle8020': '','bgColor8020': ''},
            's4': {'orderStr': '','index': ''},
            's5': {'dealStr':'','showBackColor':'','showFontStyle':''}
        }
        that.sync();
    });

    //监听所选数据库是否可生成地图，并改变菜单和工具栏
    $rootScope.$on('mapType',function(e,data) {
        var num = null;
        var arr = dispatchService.getCoolMenu();
        if(data!=1&&data!=2) {
            num = 3;
        } else {
            num = 4
        }
        that.menuData = arr.slice(0,num);
    });


    that.sync = function() {
        var conditions = conditionService.getCondition();
        var isHasNull = hasNull(conditions.dimensionVOLst);
        if(!isHasNull) {return false;}
        var totalNum = isCanSync(conditions);
        if(totalNum>5000) {             
            alert('单元格数量超过5000，无法显示');
            return false;
        }
        var sheetId = conditionService.getSheetId();
        if(conditions.metaRow.length==0||conditions.metaColumn.length==0) {
            errorService.showError('行或列必须保证至少一个维度');
            return false;
        }
        var param = conditionService.getParams();
        param.sid = dataService.getCookieObj('sid');
        param = angular.toJson(param);
        var params = {param:param};
        workbookService.sync(params);
    }

    //判断是否有维度为空的情况
    function hasNull(resource) {
        var keepGoing = true;
        var result = true;
        angular.forEach(resource,function(v,k) {
            if(keepGoing) {
                if(v.codes&&v.codes.length==0) {
                    result = false;
                    keepGoing = false;
                    switch(v.codeName) {
                        case 'regionCode':
                            errorService.showError('地区维度不能为空');
                        break;
                        case 'indicatorCode':
                            errorService.showError('指标维度不能为空');
                        break;
                        case 'classify_code':
                            errorService.showError('分类维度不能为空');
                        break;
                        case 'industryCode':
                            errorService.showError('行业维度不能为空');
                        break;
                        case 'commodityCode':
                            errorService.showError('商品维度不能为空');
                        break;
                        case 'timeCode':
                            errorService.showError('时间维度不能为空');
                        break;
                        case 'countryCode':
                            errorService.showError('国家维度不能为空');
                        break;
                        case 'countrySCode':
                            errorService.showError('统计国维度不能为空');
                        break;
                        case 'countryTCode':
                            errorService.showError('贸易国维度不能为空');
                        break;
                        case 'entnature_code':
                            errorService.showError('企业维度不能为空');
                        break;
                        case 'booth_code':
                            errorService.showError('摊位维度不能为空');
                        break;
                        case 'market_code':
                            errorService.showError('市场维度不能为空');
                        break;
                        case 'sex_code':
                            errorService.showError('性别维度不能为空');
                        break;
                    }
                }
            }            
        });
        return result;
    }

    function isCanSync(conditions) {
        var totalNum = 1;
        angular.forEach(conditions.dimensionVOLst,function(v,k) {
            totalNum = totalNum*v.codes.length;
        });
        return totalNum;
    }

    that.goMap = function() {
        $rootScope.$broadcast('newMap',true);
    }


    that.mainStyle = {
        topStyle: {
            height:'103px'
        },
        topHeadStyle:{
            display:'block'
        },
    	cubesStyle:{
    		width:'250px',
            paddingTop: '123px'
    	},
    	dimensionsStyle:{
    		width:'200px',
            paddingTop: '123px'
    	},
    	platformStyle:{
    		paddingLeft:'450px',
            paddingTop: '103px'
    	},
        tableStyle:{
            height:'100%'
        },
        chartStyle: {
            height:'50%'
        },
        mapStyle: {
        },
        switchStyle:{
            top:'103px'
        },
        menuStyle:{
            top:'0'
        }
    };

    $rootScope.$on('changeCube',function(e,data) {
        if(data===true) {
            that.mainStyle.tableStyle.height = '100%';
            that.showTable = true;
            that.showChart = false;
            that.showMap = false;
            config.nowWorkArea = 1;
        }
    });
    //切换到表格
    $rootScope.$on('showTable',function(event,data) {
        if(data===true) {
            config.nowWorkArea = 1;
            that.mainStyle.tableStyle.height = '100%';
            that.showTable = true;
            that.showChart = false;
            that.showMap = false;
            $rootScope.$broadcast('resizeHandsontable',true);
        }
        $rootScope.$apply();
    });

    //切换到表格/图表
    $rootScope.$on('showTableChart',function(event,data) {
        if(data===true) {
            config.nowWorkArea = 2;
            that.showChart = true;
            that.showTable = true;
            that.showMap = false;
            that.mainStyle.tableStyle.height = '50%';
            that.mainStyle.chartStyle.height = '50%';
            $rootScope.$broadcast('resizeHandsontable',true);
        }
        $rootScope.$apply();
    });

    //切换到图表
    $rootScope.$on('showChart',function(event,data) {
        if(data===true) {
            config.nowWorkArea = 3;
            that.showChart = true;
            that.showTable = false;
            that.showMap = false;
            that.mainStyle.chartStyle.height = '100%';
            $rootScope.$broadcast('resizeHandsontable',true);
        }
        $rootScope.$apply();
    });

    //切换到地图
    $rootScope.$on('showMap',function(event,data) {
        if(data===true) {
            config.nowWorkArea = 4;
            that.showChart = false;
            that.showTable = false;
            if(that.showMap) {
                return false;
            } else {
                that.showMap = true;
            }            
            that.mainStyle.mapStyle.height = '100%';
            that.mapParams = workbookService.mapInit();            
            that.mapDimens = dimensionsService.getMapDimens();            
            if(that.mapParams.countryCode.length>0&&that.mapParams.regionCode.length==0) {
                that.mapParams.regionCode = that.mapParams.countryCode;
                that.mapParams.countryCode = [];
            }

            var mapTimes = [];
            var keepGoing = true;
            angular.forEach(that.mapDimens.fixed,function(v,k) {
                if(keepGoing) {
                    if(v.codeName==='timeCode') {
                        mapTimes = v.objLst;
                        keepGoing = false;
                    }
                }
            });
            var freqId = conditionService.getFreqId();
            that.mapTimes = mapHandleTime(mapTimes,freqId);
            mapService.setTimes(that.mapTimes);
            $rootScope.$broadcast('mapTimes',true);            
            that.goMap();
        }
        $rootScope.$apply();
    });

    $rootScope.$on('showWindow',function(event,data) {
        if(data===true) {
            that.showWindow = true;
        } else {
            that.showWindow = false;
        }
    });

    $rootScope.$on('showErrorMsg',function(event,data) {
        if(data.show===true) {
            that.errorMessage = data.msg;
            that.errorShow = true;
        } else {
            that.errorShow = false;
        }
    });


    that.switchs = function(type) {
        if(type=='cube') {
            that.showCubes = !that.showCubes;
        } else if(type=='dimen') {
            that.showDimensions = !that.showDimensions;
        }    	
    	if(that.showCubes==true&&that.showDimensions==true) {
    		that.mainStyle.platformStyle.paddingLeft = '450px';
    		that.mainStyle.cubesStyle.width = '250px';
    		that.mainStyle.dimensionsStyle.width = '200px';
            that.mainStyle.dimensionsStyle.left = '250px';
    	} else if(that.showCubes==false&&that.showDimensions==true) {
    		that.mainStyle.platformStyle.paddingLeft = '220px';
            that.mainStyle.cubesStyle.width = '20px';
            that.mainStyle.dimensionsStyle.width = '200px';
            that.mainStyle.dimensionsStyle.left = '20px';
    	} else if(that.showCubes==true&&that.showDimensions==false) {
            that.mainStyle.platformStyle.paddingLeft = '270px';
            that.mainStyle.cubesStyle.width = '250px';
            that.mainStyle.dimensionsStyle.width = '20px';
            that.mainStyle.dimensionsStyle.left = '250px';
        } else if(that.showCubes==false&&that.showDimensions==false) {
            that.mainStyle.platformStyle.paddingLeft = '40px';
            that.mainStyle.cubesStyle.width = '20px';
            that.mainStyle.dimensionsStyle.width = '20px';
            that.mainStyle.dimensionsStyle.left = '20px';
        }
        $rootScope.$broadcast('resizeHandsontable',true);
    }


    that.showHelp = function() {
        that.showHelpCenter = true;
        $rootScope.$broadcast('showHelp',true);
    }

    $rootScope.$on('initCutTop',function(data) {
        that.topCut(true);
    });
    //头部收起
    that.topCut = function(flag) {
        that.topCutFlag = flag;
        if(flag) {
            that.mainStyle.topStyle.height='0';
            that.mainStyle.topHeadStyle.display='none';
            that.mainStyle.cubesStyle.paddingTop='43px';
            that.mainStyle.dimensionsStyle.paddingTop='43px';
            that.mainStyle.platformStyle.paddingTop ='23px';
            that.mainStyle.switchStyle.top='23px';
            that.mainStyle.menuStyle.top = '0';
            that.mainStyle.topCutStyle={
                borderTop:'5px solid #0d8ccc',
                borderBottom:'none'
            }
        } else {
            that.mainStyle.topStyle.height='103px';
            that.mainStyle.topHeadStyle.display='block';
            that.mainStyle.cubesStyle.paddingTop='123px';
            that.mainStyle.dimensionsStyle.paddingTop='123px';
            that.mainStyle.platformStyle.paddingTop ='103px';
            that.mainStyle.switchStyle.top='103px';
            that.mainStyle.menuStyle.top = '0';
            that.mainStyle.topCutStyle={
                borderBottom:'5px solid #0d8ccc',
                borderTop:'none'
            }
        }
        $rootScope.$broadcast('resizeHandsontable',true);
    }


    function mapHandleTime(data,id) {
        if(data.length>1) {
            if(parseInt(data[0].code)>parseInt(data[1].code)) {
                data = data.reverse();
            }
        }
        
        if(id!==1) {
            var arr = [];
            angular.forEach(data,function(v,k) {
                if(v.childs.length>0) {
                    arr = arr.concat(v.childs);
                }
            });
            return arr;
        } else {
            return data;
        }
    }

    that.goSearch = function() {
        if(!that.keywords) {
             errorService.showError('请输入关键词！');
             return false;
        }
        window.location.href=config.baseUrl+'auth/search.html?keywords='+that.keywords;        
    }


    that.logout = function() {
        workbookService.logout();
    }

    that.closeError = function(msg) {
        that.errorShow = false;
        if(msg =='登录过期，请重新登录') {
            that.logout();
        }
    }

    that.changeLanguage = function() {
        var sid = dataService.getCookieObj('sid');
        var dimensions = conditionService.getParams();
        var dims = angular.fromJson(dimensions.dims);
        var dim = {};
        angular.forEach(dims,function(v,k) {
            var codeName = v.codeName.toUpperCase();
            var arr = codeName.split('CODE');
            if(arr[0].indexOf('_')==-1) {
                codeName=arr[0]+'_CODE';
            } else {
                codeName=arr[0]+'CODE';
            }
            dim[codeName] = v.codes.join(',');
        });
        var params = {
            type:2,
            dims:[dim]
        }
        params = angular.toJson(params);
        var cubeId = dataService.getCookieObj('cubeId');
        $.ajax({
            type:'POST',
            url:config.baseUrl+config.urlMap.userSp,
            data:{cubeId:cubeId,entryType:params,sid:sid},
            success:function(res) {
                var sid = dataService.getCookieObj('sid');
                dataService.removeCookie('entryType',{path:'/'});
                dataService.removeCookie('clientName',{path:'/'});
                dataService.removeCookie('cubeId',{path:'/'});
                dataService.removeCookie('nickName',{path:'/'});
                dataService.removeCookie('sid',{path:'/'});
                dataService.removeCookie('user',{path:'/'});
                dataService.removeCookie('name',{path:'/'});
                location.href=config.chEnUrl+'?sid='+sid;
            }
        });
    }

    that.tabelCtrl = {//表格工具栏操作状态
        filter:'empty',
        highLight:false,
        formatConditions:false,
        calculate:false,
        etAnalysis:false,
        lags:false,
        growthRates:false,
        log:false,
        routineMode:false,
        moneyStyle:false,
        percentStyle:false,
        delimitStyle:true
    }

    $rootScope.$on('tableCtrl',function(e,data) {
        //that.tableCtrl[data.name] = data.value;
        //$rootScope.$apply();
        that.tabelCtrl[data.name] = data.value;
    });

    $rootScope.$on('openCollectFile',function(e,data) {
        var cubeId = data.cubeId;
        delete data.cubeId;
        var params = {
            type:3,
            dims:angular.toJson(data)
        }
        params = angular.toJson(params);
        dataService.putCookieObj('cubeId',cubeId,{path: '/'});
        dataService.putCookieObj('entryType',params,{path: '/'});
        workbookService.openCollectionFile(cubeId,data);
    });
  }

})();