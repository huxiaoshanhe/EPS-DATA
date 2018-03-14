(function() {
	'use strict';
	angular.module('pf.window')
	.controller('saveFileCtrl',saveFileCtrl);
	saveFileCtrl.$inject = ['$scope','dataService','errorService','conditionService','coreCF','$timeout'];
	function saveFileCtrl($scope,dataService,errorService,conditionService,config,$timeout) {
		var that = this;
		that.show = false;
		//监听打开窗口
		$scope.$on('showSaveFile',function(e,data) {
			that.show = true;
			that.showAddWin = false;
			that.fileName = '';
			//初始化数据
			dataService.get('getAllFolders').then(function(data) {
				if(data.success) {
					that.folderList = [
						{
							collectionCode:'all',
							collectionName:'根目录',
							child:data.entity['0'].child
						}
					];
					that.currentSelected = {collectionCode:that.folderList[0].collectionCode,collectionName:that.folderList[0].collectionName};
				} else {
					that.folderList = [
						{
							collectionCode:'all',
							collectionName:'根目录'
						}
					];
				}				
			});			
			$scope.$apply();
		});

		//监听文件夹选中
		$scope.$on('selectFolder',function(res,data) {
			that.currentSelected = data;			
			$scope.$apply();
		});

		that.needAddFolder = {collectionCode:null,collectionName:'根目录'}
		//监听新建文件夹中所选中的父级目录
		$scope.$on('selectAddFolder',function(res,data) {
			that.needAddFolder = data;
			$scope.$apply();
		});

		//新建文件夹
		that.goAddFolder = function() {
			if(!that.newFolderName||that.newFolderName==='') {
				return false;
			} else {
				if(!checkStr(that.newFolderName)) {
					errorService.showError('文件名中不能包含特殊字符！');
					return false;
				}				
				dataService.get('createFolder',{name:that.newFolderName,parentId:that.needAddFolder.collectionCode}).then(function(res) {
					if(res.success) {
						dataService.get('getAllFolders').then(function(data) {
							if(data.success) {
								that.folderList = [
									{
										collectionCode:'all',
										collectionName:'根目录',
										child:data.entity['0'].child
									}
								];
							} else {
								errorService.showError(data.message);
							}				
						});
						that.showAddWin =false;
						that.currentSelected = {collectionCode:res.entity.collectionCode,collectionName:res.entity.collectionName};
					} else {
						errorService.showError(res.message);
					}
				});
			}
		}

		that.goApply = function() {
			if(!that.fileName||that.fileName==='') {
				return false;
			}
			if(!checkStr(that.fileName)) {
				errorService.showError('文件名中不能包含特殊字符！');
				return false;
			}
			var params = {
				name:that.fileName
			}
			if(that.currentSelected.collectionCode!=='all') {
				params.parentId = that.currentSelected.collectionCode;
			}
			var content = conditionService.getCondition();
			content.controls = config.mainCtrl;
			content.controls.s1 = {dealStr:config.basicCtrl.filter};
			content.cubeId = config.cubeId;
			content.mapType = config.mapType;
			params.content = angular.toJson(content);
			dataService.get('saveFile',params).then(function(data) {
				if(data.success) {
					that.tips = '收藏成功';
					$timeout(function(){
						that.tips = '';
						that.show = false;
						$scope.$emit('showWindow',false);
					},2000);
					
				} else {
					errorService.showError(data.message);
				}
			});
		}

		//阻止事件冒泡
		that.prevent = function(e) {
			e.stopPropagation();
		}


		function checkStr(str) {
			var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
			    regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;

			if(regEn.test(str) || regCn.test(str)) {
			    return false;
			} else {
				return true;
			}
		}

	}



	angular.module('pf.window')
	.directive('folderList',folderListDirective);
	folderListDirective.$inject = [];
	function folderListDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			controller:['$scope',function($scope) {
				this.setCurrentFolder = function(id,title) {
					$scope.$emit('selectFolder',{collectionCode:id,collectionName:title});
				}
			}],
			controllerAs:'foldersListCtrl',
			scope:{'list':'=','show':'='},
			link:function(scope,element,attr,foldersListCtrl) {
				scope.$watch('show',function(data) {
					if(data) {
						element.show();
					} else {
						element.hide();
					}
				});

				$(window).click(function() {
					scope.show = false;
					scope.$apply();
				});

				scope.$watch('list',function(data) {
					var htmlStr =compileTree(data,'',0);				
					element.html(htmlStr);
					element.find('.switch').click(function(e) {
						if($(this).siblings('ul').css('display')=='none') {
							$(this).siblings('ul').show();
							$(this).removeClass('closed').addClass('opened');
						} else {
							$(this).siblings('ul').hide();
							$(this).removeClass('opened').addClass('closed')
						}						
						e.stopPropagation();
					});
					element.find('a').click(function(e) {
						$('.folder-list a').removeClass('on');
						$(this).addClass('on');
						foldersListCtrl.setCurrentFolder($(this).attr('data-key'),$(this).text());						
						//e.stopPropagation();
						scope.show = false;
					});
				});

				function compileTree(arr,htmlStr,level) {
					level+=1;
					angular.forEach(arr,function(v,k) {
						if(v.collectionCode=='all') {
							if(v.child && v.child.length>0) {
					            htmlStr+='<li><span class="switch opened" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" class="on" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a>'+compileTree(v.child,'',level)+'</li>';
							} else {
								htmlStr+='<li><span class="switch none" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" class="on" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a></li>';
							}
						} else {
							if(v.child && v.child.length>0) {
					            htmlStr+='<li><span class="switch closed" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a>'+compileTree(v.child,'',level)+'</li>';
							} else {
								htmlStr+='<li><span class="switch none" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a></li>';
							}
						}
						
			        });
		            return '<ul>'+htmlStr+'</ul>';
		        }
			}
		};
	}



	angular.module('pf.window')
	.directive('addFolder',newFolderDirective);
	newFolderDirective.$inject = [];
	function newFolderDirective() {
		return {
			restrict:'E',
			replace:true,
			templateUrl:'app/template/addFolder.html',
			link:function(scope,element,attr,newFolderCtrl) {
				element.draggable({containment: 'window'});
				element.find('.body').mousedown(function(e) {
					e.stopPropagation();
				});			
			}
		};
	}

	angular.module('pf.window')
	.directive('addFolderList',addFolderListDirective);
	addFolderListDirective.$inject = [];
	function addFolderListDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			controller:['$scope',function($scope) {
				this.setCurrentFolder = function(id,title) {
					$scope.$emit('selectAddFolder',{collectionCode:id,collectionName:title});
				}
			}],
			controllerAs:'addFolderListCtrl',
			scope:{'addlist':'=','show':'='},
			link:function(scope,element,attr,addFolderListCtrl) {
				scope.$watch('show',function(data) {
					if(data) {
						element.show();
					} else {
						element.hide();
					}
				});

				$(window).click(function() {
					scope.show = false;
					scope.$apply();
				});

				scope.$watch('addlist',function(data) {
					var htmlStr =compileTree(data,'',0);		
					element.html(htmlStr);
					element.find('.switch').click(function(e) {
						if($(this).siblings('ul').css('display')=='none') {
							$(this).siblings('ul').show();
							$(this).removeClass('closed').addClass('opened');
						} else {
							$(this).siblings('ul').hide();
							$(this).removeClass('opened').addClass('closed')
						}						
						e.stopPropagation();
					});
					element.find('a').click(function(e) {
						$('.folder-list a').removeClass('on');
						$(this).addClass('on');
						addFolderListCtrl.setCurrentFolder($(this).attr('data-key'),$(this).text());
						//e.stopPropagation();
						scope.show = false;
					});
				});

				function compileTree(arr,htmlStr,level) {
					level+=1;
					angular.forEach(arr,function(v,k) {
						if(v.collectionCode=='all') {
							if(v.child && v.child.length>0) {
					            htmlStr+='<li><span class="switch opened" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" class="on" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a>'+compileTree(v.child,'',level)+'</li>';
							} else {
								htmlStr+='<li><span class="switch none" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" class="on" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a></li>';
							}
						} else {
							if(v.child && v.child.length>0) {
					            htmlStr+='<li><span class="switch closed" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a>'+compileTree(v.child,'',level)+'</li>';
							} else {
								htmlStr+='<li><span class="switch none" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a></li>';
							}
						}
						
			        });
		            return '<ul>'+htmlStr+'</ul>';
		        }
			}
		};
	}
})();