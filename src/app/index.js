(function() {
  'use strict';

  angular
    .module('pf', [
      'pf.workbook'
    ])
    .run(startLogic);

    // 路由启动配置
    

    // 启动逻辑
    startLogic.$inject = ['$rootScope', 'coreCF', 'dataService', 'workbookService','$timeout','$http'];
    function startLogic($rootScope, config, dataService, workbookService,$timeout,$http) {
      var sid = dataService.urlGet('sid');
      var cookieSid = dataService.getCookieObj('sid');
      $rootScope.sid=sid;
      dataService.putCookieObj('sid',sid,{path:'/',expires:0.125});
      //1.先获取登录信息      
      var userName = dataService.getCookieObj('user');
      $rootScope.userNickname = decodeURI(dataService.getCookieObj('name'));
      if($rootScope.userNickname=='undefined') {
        $rootScope.userNickname = null;
      }
      if(userName) {
        var user = angular.fromJson(userName);
        $rootScope.userName = user.userName;
      } else {
        dataService.get('userInfo').then(function(data) {
          $rootScope.userName = data.clientName;
          var userObj = {'userName':data.clientName,'groupUserId':data.groupUserId,'userType':data.userType};
          var userStr = angular.toJson(userObj);
          $rootScope.userNickname = data.userNickName;
          dataService.putCookieObj('clientName',data.clientName,{path:'/'});
          dataService.putCookieObj('name',data.userNickName,{path:'/'});
          dataService.putCookieObj('user',userStr,{path:'/'});
          dataService.setItem('loginResult',{'userInfoBO':data});
        }).catch(function(res) {
          if(!res.isLogin) {
            //workbookService.logout();
          }
        });
      }

      //2.初始化数据
      var cubeId = dataService.getCookieObj('cubeId');
      if(cubeId) {
        config.cubeId = cubeId;
        var entryType = angular.fromJson(dataService.getCookieObj('entryType'));
        if(entryType) {
          if(entryType.type==1) {//首页选择库进来
            initData(cubeId);
          } else if(entryType.type==2) {//通过跨库搜索进来
            var searchParams = angular.fromJson(entryType.dims);
            initSearchData(cubeId,searchParams);
          } else if(entryType.type==3) {//通过打开收藏夹文件
            var params = angular.fromJson(entryType.dims);
            workbookService.openCollectionFile(cubeId,params);
          } else {
            initData(cubeId);
          }
        } else {
          initData(cubeId);
        }
      } else {
        dataService.get('userInfo').then(function(data) {
            if(data) {
              if(data.cubeId) {
                config.cubeId = data.cubeId;
                dataService.putCookieObj('cubeId',data.cubeId,{path:'/'});
                if(data.entryType) {
                  dataService.putCookieObj('entryType',data.entryType,{path:'/'});
                  var entryType = angular.fromJson(data.entryType);
                  var searchParams = angular.fromJson(entryType.dims);
                  initSearchData(data.cubeId,searchParams);
                } else {
                  initData(data.cubeId);
                }              
              } else {
                var firstList = data.cubeList[0];
                if(firstList.childList&&firstList.childList.length>0) {
                  config.cubeId = firstList.childList[0].cubeId;
                  dataService.putCookieObj('cubeId',firstList.childList[0].cubeId,{path:'/'});
                  initData(firstList.childList[0].cubeId);
                } else {
                  config.cubeId = firstList.cubeId;
                  dataService.putCookieObj('cubeId',firstList.cubeId,{path:'/'});
                  initData(firstList.cubeId);
                }
              }              
            } else {
              initData(config.cubeId);
            }
          });       
      }
      
      //获取网站公告
      dataService.get('news').then(function(data) {
        $rootScope.news = data.activeDesc; 
        $rootScope.activeUrl = data.activeUrl;    
      });
      //获取用户ip
      dataService.post('getIp').then(function(data) {
        $rootScope.currentIP = 'IP:'+data.ip;
      });

      function initData(cubeId) {
        dataService.get('getInitIndicator',{cubeId:cubeId}).then(function(data) {
          config.mapType = data[0].MAP_TYPE;
          $rootScope.$broadcast('mapType',config.mapType);
          var dims = workbookService.handleInitData(data[0]);
          var params = {cubeId:cubeId,dims:dims};
          workbookService.init(params);
        }).catch(function(res) {
          if(!res.isLogin) {
            //workbookService.logout();
          }
        });
      }

      function initSearchData(cubeId,obj) {
          var dims = workbookService.handleInitData(obj[0]);
          var params = {cubeId:cubeId,dims:dims};
          workbookService.init(params);
          config.mapType = obj[0].MAP_TYPE;
          $timeout(function(){
            $rootScope.$broadcast('mapType',config.mapType);
          },10);
      }  

      $rootScope.tableSize=new Date();  
      $rootScope.chartSize=new Date();   
      $rootScope.$on('tableSize',function(data) {
        $rootScope.tableSize = new Date();
      });
    }
})();