(function() {
	'use strict';

	angular
    .module('pf.workbook')
    .directive('cubes', cubesDirective);
    cubesDirective.$inject = ['coreCF','dataService','$timeout'];
    function cubesDirective(config,dataService,$timeout) {
    	return {
    		restrict:'ECMA',
    		replace: true,
    		template: '<div></div>',
    		controller:['$scope','dataService','coreCF','workbookService',function($scope, dataService, config, workbookService) {
		        var that = this;
		        that.getCubes = function() {
		        	dataService.post('cubes').then(function(data) {
                $scope.$broadcast('cubesChange',data);
              });
		        }

            function setConfigs(id) {
              config.cubeId = id;
              dataService.putCookieObj('cubeId',id,{path:'/'});
              var params = {type:1};
              params = angular.toJson(params);
              dataService.putCookieObj('entryType',params,{path:'/'});
              config.sorts = {index:'',type:''};//切换库后，原来的排序方式清除
              config.basicCtrl.filter='empty'; 
              config.mapDims={};
              config.mainCtrl = {
                's2':{'method': '','type': ''},
                's3': {'index8020': '0','fontStyle8020': '','bgColor8020': ''},
                's4': {'orderStr': '','index': ''},
                's5': {'dealStr':'','showBackColor':'','showFontStyle':''}
              }
            }

            that.selectCube = function(id) {
              setConfigs(id);
              dataService.get('getInitIndicator',{cubeId:id}).then(function(data) {
                var obj = data[0];
                config.mapType = obj.MAP_TYPE;
                $scope.$emit('mapType',config.mapType);
                var dims = workbookService.handleInitData(obj);
                var params = {cubeId:id,dims:dims};
                workbookService.init(params);
                $scope.$emit('changeCube',true);//切换库后，把工作台切换到表格
                $scope.$broadcast('changeCube',true);//切换库后，把工作台菜单切换到表格，如果地图的时间轴处于播放状态，一并取消,图表回到初始化类型
              });              
            }
		    }],
		    controllerAs:'cubesCtrl',
    		link:function(scope,element,attr,cubesCtrl) {
          //禁用光标拖动选择
          element.parent().parent().disableSelection();
          cubesCtrl.getCubes(); 			
          scope.$on('cubesChange',function(event,data) {
              var datas = angular.fromJson(data.cubes);
              var cookieCubeId = dataService.getSessionItem('cubeId');
              if(typeof cookieCubeId == 'number') {
                var nowcubeId = cookieCubeId;
              } else {
                var nowcubeId = config.cubeId;
              }
              var htmlStr = compileTree(data.cubes,'',nowcubeId);
              element.html(htmlStr);
              //找到当前数据库的位置
              $('#currentCube').parent('li').addClass('currentCube');
              scope.cubeName = $('#currentCube').text();
              config.cubeName = scope.cubeName;
              $('#currentCube')
              .parents('li')
              .removeClass('closed')
              .addClass('opened')
              .find('>ul').show();

              element.find('li.hasChild').click(function(e) {
                if($(this).find('>ul').css('display')==='none') {
                  $(this).find('>ul').show();
                  $(this).removeClass('closed');
                  $(this).addClass('opened');
                } else {
                  $(this).find('>ul').hide();
                  $(this).removeClass('opened');
                  $(this).addClass('closed');
                }
                e.stopPropagation();
              });
              element.find('li.lastLevel').click(function(e) {
                var id = $(this).attr('id');
                var title =$(this).text();
                scope.cubeName = title;
                config.cubeName = title;
                e.stopPropagation();
                element.find('li.lastLevel').removeClass('currentCube');
                $(this).addClass('currentCube');
                cubesCtrl.selectCube(id);
              });              
          });

          function compileTree(arr,htmlStr,nowcubeId) {
            angular.forEach(arr,function(value,key) {
              if(value.childList && value.childList.length>0) {
                  if(value.cubeId==nowcubeId) {              
                    htmlStr+='<li class="hasChild closed"><span id="currentCube"><i class="ico"></i>'+value.cubeNameZh+'</span>'+compileTree(value.childList,'',nowcubeId)+'</li>';
                  } else {
                    htmlStr+='<li class="hasChild closed"><span><i class="ico"></i>'+value.cubeNameZh+'</span>'+compileTree(value.childList,'',nowcubeId)+'</li>';
                  }                
              } else {                
                  if(value.cubeId==nowcubeId) {
                    htmlStr+='<li class="lastLevel" id="'+value.cubeId+'"><span id="currentCube">'+value.cubeNameZh+'</span></li>';
                  } else {
                    htmlStr+='<li class="lastLevel" id="'+value.cubeId+'"><span>'+value.cubeNameZh+'</span></li>';
                  }               
              }            
            });
            return '<ul>'+htmlStr+'</ul>';
          }
    		}
    	}
    }
})();