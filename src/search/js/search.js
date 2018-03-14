(function() {
	'use strcit';
	var app = angular.module('pf',[]);
	app.run(startLogic);
	app.factory('dimenService',dimenService);
	app.controller('searchCtrl',searchCtrl);
	app.controller('helpCenterCtrl',helpCenterCtrl);
	app.controller('pageCtrl',pageCtrl);
	app.directive('cubes',cubesDirective);
	app.directive('dimension',dimensionDirective);
	app.directive('infomation',infomationDirective);
	app.directive('helpCenter',helpCenterDirective);
	app.directive('helpResult',helpResultDirective);

	startLogic.$inject = ['dataService','$rootScope','coreCF','dimenService'];
	function startLogic(dataService,$rootScope,config,dimenService) {
		$rootScope.sid = dataService.getCookieObj('sid');
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
					workbookService.logout();
				}
			});
		}
		$rootScope.loadingShow = true;
		dataService.get('cubes').then(function(data) {
			$rootScope.cubes = data;
		});
		var nowUrl = location.href;
		var arr = nowUrl.split('?');
		if(!arr[1]) {
			return false;
		}
		var arr2 = arr[1].split('=');
		$rootScope.keywords = decodeURIComponent(arr2[1]);
		if(!$rootScope.keywords||$rootScope.keywords=='') {
			alert('请输入关键词！');
			history.back();
		}
		var searchParams = {
			'keywords' : $rootScope.keywords,
			'page'    : 1,
			'url': 'stream'
		}
		dataService.searchLog(1,$rootScope.keywords);
		dimenService.setDimens(searchParams);
		dataService.get('search',searchParams).then(function(data) {
			$rootScope.loadingShow = false;
			if(!data.success) {
				$rootScope.noData = '无数据';
				return false;
			}						
			$rootScope.noData = '';
			$rootScope.dimens = data.entity.factMap;
			$rootScope.searchIndicators = data.entity.entityList;
			$rootScope.page =  data.entity.page;
		});
		dataService.addDataLog(config.cubeId,4);
		
		dataService.get('news').then(function(data) {
	        $rootScope.news = data.activeDesc; 
	        $rootScope.activeUrl = data.activeUrl;    
	    });
	}

	cubesDirective.$inject = ['dataService','coreCF'];
	function cubesDirective(dataService,config) {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				scope.$watch('data',function(data) {
					if(!data) {
						return false;
					}
					var htmlStr = compileTree(data.cubes,'');
          			element.html(htmlStr);
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
		                e.stopPropagation();
		                element.find('li.lastLevel').removeClass('currentCube');
		                $(this).addClass('currentCube');
		                dataService.putCookieObj('cubeId',id,{path:'/'});
		                var params = {type:1};
		                params = angular.toJson(params);
		                dataService.putCookieObj('entryType',params,{path:'/'});
		                var sid = dataService.getCookieObj('sid');
		                location.href='/auth/platform.html?sid='+sid;
	            	});
				});


				function compileTree(arr,htmlStr) {
		            angular.forEach(arr,function(value,key) {
		              	if(value.childList && value.childList.length>0) {
		                  	if(value.cubeId===config.cubeId) {              
		                	    htmlStr+='<li class="hasChild closed"><span id="currentCube"><i class="ico"></i>'+value.cubeNameZh+'</span>'+compileTree(value.childList,'')+'</li>';
		                  	} else {
		                	    htmlStr+='<li class="hasChild closed"><span><i class="ico"></i>'+value.cubeNameZh+'</span>'+compileTree(value.childList,'')+'</li>';
		                  	}                
		              	} else {                
		                  	if(value.cubeId===config.cubeId) {
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
	
	dimensionDirective.$inject = [];
	function dimensionDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'search/template/dimens.html',
			controller:['$rootScope','dataService','dimenService',function($rootScope,dataService,dimenService) {
				this.sync = function(obj) {
					$rootScope.loadingShow = true;
					var params = {
							'action' : 'indicator',
							'keywords' : $rootScope.keywords,
							'page'    : 1,
							'url': 'stream'
						}
					for(var i in obj) {
						var a = 'qic.'+i;
						params[a] = obj[i].join(',');
					}
					dimenService.setDimens(params);
					dataService.get('search',params).then(function(data) {
						$rootScope.loadingShow = false;
						if(!data.success) {
							$rootScope.noData = '无数据';
							return false;
						}						
						$rootScope.noData = '';
						$rootScope.searchIndicators = data.entity.entityList;
						$rootScope.page =  data.entity.page;
						$rootScope.$broadcast('newSearch',true);
					});
				}
			}],
			controllerAs:'DimensSelection',
			scope:{'data':'='},
			link:function(scope,element,attr,DimensSelection) {
				scope.$watch('data',function(data) {
					if(!data) {return false}
					scope.dimensions = data;
					var sourceSize = scope.dimensions.sourceList.length;
					var cubeSize = scope.dimensions.cubeList.length;
					if(sourceSize<=5) {
						$('#source dt .ico').hide();
					} else {
						$('#source dd').height(130).css('overflow','hidden');
					}
					if(cubeSize<=5) {
						$('#cube dt .ico').hide();
					} else {
						$('#cube dd').height(130).css('overflow','hidden');
					}
				});
				scope.showList = function(e,id,size) {
					if(size<=5) {return false;}
					if($('#'+id).find('dd').height()==130) {
						$('#'+id).find('dd').css('height','auto');
						$('#'+id).find('.ico').removeClass('closed');
						$('#'+id).find('.ico').addClass('opened');
					} else {
						$('#'+id).find('dd').height(130).css('overflow','hidden');
						$('#'+id).find('.ico').removeClass('opened');
						$('#'+id).find('.ico').addClass('closed');
					}
				}
				scope.qic = {};
				scope.selectDimens = function(value,name) {
					if(name=='cubeId'||name=='isIndustry') {
						if(scope.qic[name]) {
							var num = scope.qic[name].indexOf(value);
							if(num===-1) {
								scope.qic[name] = [value];
							} else {
								scope.qic[name] = [];
							}
						} else {
							scope.qic[name] = [];
							scope.qic[name] = [value];
						}						
					} else {
						if(name=='sourceZh') {
							if(scope.qic['source']) {
								var num = scope.qic['source'].indexOf(value);
								if(num===-1) {
									scope.qic['source'].push(value);
								} else {
									scope.qic['source'].splice(num,1);
								}
							} else {
								scope.qic['source'] = [];
								scope.qic['source'].push(value);
							}
						} else {
							if(scope.qic[name]) {
								var num = scope.qic[name].indexOf(value);
								if(num===-1) {
									scope.qic[name].push(value);
								} else {
									scope.qic[name].splice(num,1);
								}
							} else {
								scope.qic[name] = [];
								scope.qic[name].push(value);
							}
						}						
					}
					
					for(var i in scope.qic) {
						if(scope.qic[i].length===0) {
							delete scope.qic[i];
						}
					}
					DimensSelection.sync(scope.qic);
				}
			}
		}
	}


	searchCtrl.$inject = ['dataService','$timeout','$http','coreCF','$rootScope'];
	function searchCtrl(dataService,$timeout,$http,config,$rootScope) {
		var that  = this;
		that.showCubes = true;
	    that.showDimensions = true;
	    that.topCutFlag = false;
		that.statementStyle = {
			background:'#f4e8d2'
		}
		that.selectedIndicators = {cubeId:0,cubeCheck:false,indicatorCodes:[]};
	  	that.checkedIndicator=function(cubeId,indicatorId) {
	  		if(that.isDisabled(cubeId)) {
	  			that.statementStyle.background = '#eac685';
	  			$timeout(function() {
	  				that.statementStyle.background = '#f4e8d2';
	  			},500);
	  			return false;
	  		}
	  		if(indicatorId!==undefined) {//点击指标的时候执行
	  			var num = that.selectedIndicators.indicatorCodes.indexOf(indicatorId);
	  			if(num===-1) {
	  				that.selectedIndicators.indicatorCodes.push(indicatorId);
	  				that.selectedIndicators.cubeId = cubeId;
	  			} else {
	  				that.selectedIndicators.indicatorCodes.splice(num,1);
	  				if(that.selectedIndicators.indicatorCodes.length===0) {
	  					if(that.selectedIndicators.cubeCheck!==true) {
	  						that.selectedIndicators.cubeId = 0;
	  					} else {
	  						that.selectedIndicators.cubeId = cubeId;
	  					}
	  				}
	  			}
	  		} else {//点击库的时候执行
	  			if(that.selectedIndicators.cubeId === cubeId) {
	  				if(that.selectedIndicators.indicatorCodes.length===0) {
	  					that.selectedIndicators.cubeId = 0;
	  					that.selectedIndicators.cubeCheck = false;
	  				} else {
	  					that.selectedIndicators.cubeId = 0;
	  					that.selectedIndicators.cubeCheck = false;
	  					that.selectedIndicators.indicatorCodes = [];
	  					/*that.selectedIndicators.cubeId = cubeId;
	  					if(that.selectedIndicators.cubeCheck === false) {
	  						that.selectedIndicators.cubeCheck = true;
	  					} else {
	  						that.selectedIndicators.cubeCheck = false;
	  					}*/
	  				}
	  			} else {
	  				that.selectedIndicators.cubeId = cubeId;
	  				that.selectedIndicators.cubeCheck = true;
	  			}
	  		}
	  		that.showDatas();	  		
	  	}

	  	$rootScope.$on('newSearch',function(e,data) {
	  		that.selectedIndicators = {cubeId:0,cubeCheck:false,indicatorCodes:[]};
	  	});

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
	            top:'103px'
	        }
	    };

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
	    	} else if(that.showCubes==false&&that.showDimensions==true) {
	    		that.mainStyle.platformStyle.paddingLeft = '220px';
	            that.mainStyle.cubesStyle.width = '20px';
	            that.mainStyle.dimensionsStyle.width = '200px';
	    	} else if(that.showCubes==true&&that.showDimensions==false) {
	            that.mainStyle.platformStyle.paddingLeft = '270px';
	            that.mainStyle.cubesStyle.width = '250px';
	            that.mainStyle.dimensionsStyle.width = '20px';
	        } else if(that.showCubes==false&&that.showDimensions==false) {
	            that.mainStyle.platformStyle.paddingLeft = '40px';
	            that.mainStyle.cubesStyle.width = '20px';
	            that.mainStyle.dimensionsStyle.width = '20px';
	        }
	    }

	    that.topCut = function(flag) {
	        that.topCutFlag = flag;
	        if(flag) {
	            that.mainStyle.topStyle.height='23px';
	            that.mainStyle.topHeadStyle.display='none';
	            that.mainStyle.cubesStyle.paddingTop='43px';
	            that.mainStyle.dimensionsStyle.paddingTop='43px';
	            that.mainStyle.platformStyle.paddingTop ='53px';
	            that.mainStyle.switchStyle.top='23px';
	            that.mainStyle.menuStyle.top = '23px';
	            that.mainStyle.topCutStyle={
	                borderTop:'5px solid #0d8ccc',
	                borderBottom:'none'
	            }
	        } else {
	            that.mainStyle.topStyle.height='103px';
	            that.mainStyle.topHeadStyle.display='block';
	            that.mainStyle.cubesStyle.paddingTop='123px';
	            that.mainStyle.dimensionsStyle.paddingTop='123px';
	            that.mainStyle.platformStyle.paddingTop ='133px';
	            that.mainStyle.switchStyle.top='103px';
	            that.mainStyle.menuStyle.top = '103px';
	            that.mainStyle.topCutStyle={
	                borderBottom:'5px solid #0d8ccc',
	                borderTop:'none'
	            }
	        }
	    }

	  	that.showDatas = function() {
	  		if(!that.selectedIndicators.cubeId) {
	  			return false;
	  		}
	  		var a = angular.toJson(that.selectedIndicators);
	  		var obj = {cubeId:that.selectedIndicators.cubeId};
	  		var dims = {
	  			codeName:'indicatorCode',
	  			codes:that.selectedIndicators.indicatorCodes
	  		}
	  		dataService.get('getInitIndicator',{cubeId:that.selectedIndicators.cubeId,indicatorCode:that.selectedIndicators.indicatorCodes.join(',')}).then(function(data) {
	  			if(dims.codes&&dims.codes.length>0) {
	  				data[0].INDICATOR_CODE = dims.codes.join(',');
	  			}
	  			var params = {
	  				type:2,
	  				dims:data
	  			}
	  			params = angular.toJson(params);
	  			dataService.removeCookie('cubeId');
	  			dataService.putCookieObj('cubeId',that.selectedIndicators.cubeId,{path:'/'});
		  		dataService.putCookieObj('entryType',params,{path:'/'});
	  			/*$timeout(function() {
	  				dataService.putCookieObj('cubeId',that.selectedIndicators.cubeId,{expires:0.125,path: '/',domain:config.domain});
		  			dataService.putCookieObj('entryType',params,{expires:0.125,path: '/',domain:config.domain});*/
		  			/*var a = $('<a href="platform.html" target="_blank">EPS</a>').get(0);
		            var e = document.createEvent('MouseEvents');
		            e.initEvent( 'click', true, true );
		            a.dispatchEvent(e);*/
		        /*    var formStr = '<form method="get" target="_blank" action="platform.html"></form>';
		            var form = $(formStr);
		            form.appendTo('body');
					form.css('display','none');
				    form.submit();
				    form.remove();
	  			},100);	  */			
	  		});
	  	}

	  	

		that.isDisabled = function(num) {
	  		if(that.selectedIndicators.cubeId!==num&&that.selectedIndicators.cubeId!==0) {
	  			return 'disabled';
	  		}
	  	}

	  	that.showInfo = function(node,e) {
	  		$http.get(config.baseUrl+config.urlMap.getInfomation+'/indicator/'+node.cubeId+'/'+node.indicatorCode).then(function(response) {
	  			var frequent = null;
		  		var area = null;
		  		switch(node.freqId) {
		  			case '1':
		  				frequent = '年度';
		  				break;
		  			case '3':
		  				frequent = '季度';
		  				break;
		  			case '4':
		  				frequent = '月度';
		  				break;
		  		}
		  		
		  		switch(node.regclc) {
		  			case '0':
		  				area = '全球';
		  				break;
		  			case '1':
		  				area = '全国';
		  				break;
		  			case '2':
		  				area = '省级';
		  				break;
		  			case '3':
		  				area = '市级';
		  				break;
		  			case '4':
		  				area = '县级';
		  				break;
		  		}
	  			var position = {x:e.clientX,y:e.clientY};
		  		that.infomation = response.data;
		  		that.infomation.frequent = frequent;
	  			that.infomation.area = area;
	  			that.infomation.position = position;
		  		e.stopPropagation();
	  		});	  		
	  	}

	  	that.toggle = function(id) {
	  		$('#cubeId_'+id).find('ul').toggle();
	  		if($('#cubeId_'+id).find('.opened').hasClass('closed')) {
	  			$('#cubeId_'+id).find('.opened').removeClass('closed');
	  		} else {
	  			$('#cubeId_'+id).find('.opened').addClass('closed');
	  		}
	  	}

	  	that.showHelp = function() {
	        that.showHelpCenter = true;
	        $rootScope.$broadcast('showHelp',true);
	    }


	    that.logout = function() {
	    	var sid = dataService.getCookieObj('sid');
	    	dataService.removeCookie('searchParams',{path:'/'});
	        dataService.removeCookie('clientName',{path:'/'});
	        dataService.removeCookie('cubeId',{path:'/'});
	        dataService.removeCookie('entryType',{path:'/'});
	        dataService.removeCookie('sid',{path:'/'});
	        dataService.removeCookie('user',{path:'/'});
	        dataService.removeCookie('name',{path:'/'});
	        $.ajax({
	          type:'get',
	          url: config.baseUrl+'user/loginOut',
	          data:{sid:sid},
	          complete: function () {
	            window.location.href=config.baseUrl;
	          }
	        });
	    }
	}

	infomationDirective.$inject = [];
	function infomationDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'search/template/infomation.html',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				element.hide();
				scope.$watch('data',function(data) {
					if(!data) {return;}
					element.show();
				});
				scope.close = function() {
					element.hide();
				}
				element.click(function(e) {
					e.stopPropagation();
				});

				$(document).click(function() {
					element.hide();
					scope.data = null;
					scope.$apply();
				});
				$('.sear-list').scroll(function() {
				  	element.hide();
					scope.data = null;
					scope.$apply();
				});
			}
		};
	}


	helpCenterDirective.$inject = [];
	function helpCenterDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'search/template/help.html',
			link:function(scope,element,attr) {
				element.find('.help-search').draggable({containment: 'window'});
				element.find('.search-detail').draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});
			}
		};
	}

	helpResultDirective.$inject = [];
	function helpResultDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			scope:{'data':'='},
			link:function(scope,element,attr) {
				scope.$watch('data',function(data) {
					element.html(data);
				});
			}
		};
	}


	helpCenterCtrl.$inject = ['$scope'];
	function helpCenterCtrl($scope) {
		var that = this;
		that.show = false;
		$scope.$on('showHelp',function(e,data) {
			if(data==true) {
				that.show = true;
			}
		});
		that.hotWords = [
			'跨库搜索',
			'维度设置',
			'行列转置',
			'高亮显示',
			'合并计算',
			'图标显示',
			'数据筛选',
			'条件样式'
		];

		that.hotClick = function(num) {
			that.showDetail = true;
			that.currentKeywords = that.hotWords[num];
			that.htmls = that.currentKeywords;			
		}
	}

	dimenService.$inject = [];
	function dimenService() {
		var _dimens = null;
		var service = {
			setDimens:function(dimens) {_dimens = dimens},
			getDimens:function() {return _dimens;}
		};
		 return service;
	}

	pageCtrl.$inject = ['dimenService','$rootScope','dataService'];
	function pageCtrl(dimenService,$rootScope,dataService) {
		var that = this;
		that.prev = function() {
			var num = $rootScope.page.currentPage-1;
			if(num<1) {return false;}
			var params = dimenService.getDimens();
			params.page = num;
			$rootScope.loadingShow = true;
			dataService.get('search',params).then(function(data) {
				$rootScope.loadingShow = false;
				if(!data.success) {
					$rootScope.noData = '无数据';
					return false;
				}						
				$rootScope.noData = '';
				$rootScope.dimens = data.entity.factMap;
				$rootScope.searchIndicators = data.entity.entityList;
				$rootScope.page =  data.entity.page;
				$rootScope.$broadcast('newSearch',true);
			});
		}
		that.next = function() {
			var num = $rootScope.page.currentPage+1;
			if(num>$rootScope.page.totalPage) {return false;}
			var params = dimenService.getDimens();
			params.page = num;
			$rootScope.loadingShow = true;
			dataService.get('search',params).then(function(data) {
				$rootScope.loadingShow = false;
				if(!data.success) {
					$rootScope.noData = '无数据';
					return false;
				}						
				$rootScope.noData = '';
				$rootScope.dimens = data.entity.factMap;
				$rootScope.searchIndicators = data.entity.entityList;
				$rootScope.page =  data.entity.page;
				$rootScope.$broadcast('newSearch',true);
			});
		}

		that.go = function() {
			if(!that.page) {
				return false;
			}			
			if(that.page>$rootScope.page.totalPage) {
				that.page = $rootScope.page.totalPage;
			}else if(that.page<1) {
				that.page = 1;
			}

			var params = dimenService.getDimens();
			params.page = that.page;
			$rootScope.loadingShow = true;
			dataService.get('search',params).then(function(data) {
				$rootScope.loadingShow = false;
				if(!data.success) {
					$rootScope.noData = '无数据';
					return false;
				}						
				$rootScope.noData = '';
				$rootScope.dimens = data.entity.factMap;
				$rootScope.searchIndicators = data.entity.entityList;
				$rootScope.page =  data.entity.page;
				$rootScope.$broadcast('newSearch',true);
			});
		}
	}
})();