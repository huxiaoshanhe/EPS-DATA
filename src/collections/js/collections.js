(function() {
	'use strcit';
	var app = angular.module('pf',[]);
	app.run(startLogic);
	app.controller('mainCtrl',mainCtrl);
	app.directive('allFolders',allFoldersDirective);
	app.directive('newFolder',newFolderDirective);
	app.directive('newFolder2',newFolder2Directive);
	app.directive('folderList',folderListDirective);

	startLogic.$inject = ['dataService','$rootScope','coreCF'];
	function startLogic(dataService,$rootScope,config) {
		var user = dataService.getCookieObj('name');
		if(user) {
			$rootScope.userNickname = decodeURI(user);
		}	
	}

	mainCtrl.$inject = ['$scope','dataService','coreCF','$timeout'];
	function mainCtrl($scope,dataService,config,$timeout) {
		var that = this;
		//获取左侧文件夹列表
		function getAllFolders() {
			dataService.get('getAllFolders').then(function(data) {
				if(data.success) {
					that.allFolders = [
						{
							collectionCode:'all',
							collectionName:'全部文件',
							child:data.entity['0'].child
						}
					];
				} else {
					that.allFolders = [
						{
							collectionCode:'all',
							collectionName:'全部文件'
						}
					];
				}		
			});	
		}
		getAllFolders();		


		that.showType = 2;//默认矩阵展示
		//初始化右侧列表
		dataService.get('getAllFolder').then(function(data) {
			that.list = data.entity;
		});
		//文件操作的父级目录，即所选中的目录
		that.parentsFolders = [{code:'all',name:'全部文件'}];
		$scope.$on('folderChange',function(res,data) {
			dataService.get('getAllFolder',{parentId:data.collectionCode}).then(function(responce) {
				that.list = responce.entity;
			});
			that.parentsFolders = data.folders;
			that.currentSelected = [];//清空选中的
			that.newFolderShow = false;//目录更改就要关闭新建
		});

		//面包屑导航的进入目录
		that.goThisFolder = function(code,index) {
			if(index==that.parentsFolders.length-1) {
				return false;
			}
			//改变左侧选中状态
			$scope.$broadcast('folderCheck',{code:code});

			//进入目录
			if(code=='all') {
				dataService.get('getAllFolder').then(function(responce) {
					that.list = responce.entity;
				});
			} else {
				dataService.get('getAllFolder',{parentId:code}).then(function(responce) {
					that.list = responce.entity;
				});
			}

			//清除父级目录中的后面部分
			var keepGoing = true;
			var num = null;
			angular.forEach(that.parentsFolders,function(v,k) {
				if(keepGoing) {
					if(v.code == code) {
						num = k+1;
						keepGoing = false;
					}
				}
			});
			var length = that.parentsFolders.length-num;
			that.parentsFolders.splice(num,length);
			that.currentSelected = [];//清空选中的

			that.newFolderShow = false;//目录更改就要关闭新建
		}

		that.goBack = function() {
			var index = that.parentsFolders.length-2;
			var code = that.parentsFolders[index].code;
			if(code=='all') {
				dataService.get('getAllFolder').then(function(responce) {
					that.list = responce.entity;
				});
			} else {
				dataService.get('getAllFolder',{parentId:code}).then(function(responce) {
					that.list = responce.entity;
				});
			}
			$scope.$broadcast('folderCheck',{code:code});
			that.parentsFolders.splice(index+1,1);
			that.currentSelected = [];//清空选中的
			that.newFolderShow = false;//目录更改就要关闭新建
		}



		that.currentSelected = [];
		//搜索
		that.goSearch = function() {
			if(that.keywords==''|!that.keywords) {
				dataService.get('getAllFolder').then(function(data) {
					that.list = data.entity;
				});
			} else {
				dataService.get('searchFile',{name:that.keywords}).then(function(res) {
					that.list = res.entity;
				});
			}			
		}

		//打开选中项
		that.goSelected = function(obj) {
			if(obj.isDirectory) {//打开目录
				dataService.get('getAllFolder',{parentId:obj.collectionCode}).then(function(responce) {
					that.list = responce.entity;
				});
				that.currentSelected = [];//清空选中的
				that.newFolderShow = false;//目录更改就要关闭新建
				that.parentsFolders.push({code:obj.collectionCode,name:obj.collectionName});
				$scope.$broadcast('goNextLayer',obj.collectionCode);
			} else {//打开文件
				var contents = angular.fromJson(obj.contents);
				var cubeId = contents.cubeId;
				delete contents.cubeId;
				var params = {
	  				type:3,
	  				dims:angular.toJson(contents)
	  			}
	  			params = angular.toJson(params);
  				dataService.removeCookie('cubeId');
	  			$timeout(function() {
	  				dataService.putCookieObj('cubeId',cubeId,{path:'/'});
		  			dataService.putCookieObj('entryType',params,{path:'/'});
		  			var sid = dataService.getCookieObj('sid');
		  			/*var a = $('<a href="index.html?sid="'+sid+' target="_blank">EPS</a>').get(0);
		            var e = document.createEvent('MouseEvents');
		            e.initEvent( 'click', true, true );
		            a.dispatchEvent(e);*/
		            window.location.href="/auth/platform.html?sid="+sid;
	  			},100);
	  			
			}
		}

		//单选
		that.singleSelect = function(id) {
			that.currentSelected = [id];
			that.showRenameForm = false;
		}

		//复选
		that.multiSelect = function(id,e) {
			var index = that.currentSelected.indexOf(id);
			if(index==-1) {
				that.currentSelected.push(id);
			} else {
				that.currentSelected.splice(index,1);
			}
			e.stopPropagation();
			that.showRenameForm = false;
		}

		//全选
		that.selectAll = function() {
			if(that.list.length!=that.currentSelected.length) {
				angular.forEach(that.list,function(v,k) {
					var index = that.currentSelected.indexOf(v.collectionCode);
					if(index==-1) {
						that.currentSelected.push(v.collectionCode);
					}
				});
			} else {
				that.currentSelected = [];
			}			
		}

		//显示新建文件夹
		that.showNewFolder = function() {
			that.newFolderShow = true;
			that.newFolderName = '新建文件夹';
			$scope.$broadcast('newFolderFocus');
		}
		//执行新建文件夹
		that.goNewFolder = function() {
			var index = that.parentsFolders.length-1;
			var name = that.newFolderName;
			var code = that.parentsFolders[index].code;
			if(name==''||!name) {
				return false;
			}
			if(!checkStr(name)) {
				alert('文件夹名称不能包含特殊字符！');
				return false;
			}
			if(code=='all') {
				dataService.get('createFolder',{name:name}).then(function(res) {
					if(res.success) {
						if(!that.list) {
							that.list = [];
						}
						//that.list.push(res.entity);
						dataService.get('getAllFolder').then(function(responce) {
							that.list = responce.entity;
						});
						that.newFolderShow = false;
						that.newFolderName = '新建文件夹';
						res.entity.parentCode = 'all';
						getAllFolders();
					}
				});
			} else {
				dataService.get('createFolder',{name:name,parentId:code}).then(function(res) {
					if(res.success) {
						if(!that.list) {
							that.list = [];
						}
						//that.list.push(res.entity);
						dataService.get('getAllFolder',{parentId:code}).then(function(responce) {
							that.list = responce.entity;
						});
						that.newFolderShow = false;
						that.newFolderName = '新建文件夹';
						getAllFolders();
					}
				});
			}
		}

		//删除文件、文件夹
		that.delete = function() {
			var ids = that.currentSelected.join(',');
			if(ids.length==0) {return false;}
			if(!confirm('你确定要删除吗？')) {return false;}
			var index = that.parentsFolders.length-1;
			var name = that.newFolderName;
			var code = that.parentsFolders[index].code;
			dataService.get('deleteFile',{ids:ids,parentId:code}).then(function(res) {
				if(res.success) {
					dataService.get('getAllFolder',{parentId:code}).then(function(data) {
						that.list = data.entity;
						that.currentSelected = [];
						getAllFolders();
					});
				}
			});
		}

		//显示重命名
		that.showRename = function() {
			if(that.currentSelected.length!==1) {
				return false;
			}
			that.showRenameForm = true;
			var keepGoing = true;
			angular.forEach(that.list,function(v,k) {
				if(keepGoing) {
					if(v.collectionCode==that.currentSelected[0]) {
						that.renameText = v.collectionName;
						keepGoing = false;
					}
				}
			});
		}
		//隐藏重命名
		that.hideRename = function(e){
			that.showRenameForm = false;
			e.stopPropagation();
		}

		//执行重命名
		that.goRename = function() {
			if(that.renameText=='') {
				return false;
			}

			if(!checkStr(that.renameText)) {
				alert('文件或文件夹名称不能包含特殊字符！');
				return false;
			}

			var id = that.currentSelected[0];
			var newName = that.renameText;

			dataService.get('renameFile',{newName:newName,id:id}).then(function(data) {
				if(data.success) {
					var keepGoing = true;
					angular.forEach(that.list,function(v,k) {
						if(keepGoing) {
							if(v.collectionCode==id) {
								v.collectionName = newName;
								keepGoing = false;
							}
						}
					});
					that.showRenameForm = false;
				}
			});
		}

		//显示移动窗口
		that.toShowMoveWin = function() {
			if(that.currentSelected.length==0) {
				return false;
			}
			that.showMoveWin = true;
		}

		//隐藏移动窗口
		that.toHidMoveWin = function() {
			that.showMoveWin = false;
			that.moveTaget = {id:null,name:null};
		}

		//监听要移动到的文件夹，并得到新的临时父级目录以便移动成功后替换父级目录
		$scope.$on('selectedMoveTaget',function(res,data) {
			that.moveTaget = {id:data.id,name:data.name};
			that.temporaryParents = data.newParents;
		});

		//监听左侧点击目录后，改变面包屑导航
		$scope.$on('toNewParents',function(res,data) {
			that.parentsFolders = data;
		});

		//移动文件或文件夹
		that.goMove = function() {
			if(that.moveTaget.id) {
				var targetId = null;
				var parentId = null;
				if(that.moveTaget.id=='all') {
					targetId = 0;
				} else {
					targetId = that.moveTaget.id;
				}
				var index = that.parentsFolders.length-1;
				if(that.parentsFolders[index]=='all') {
					parentId = 0;
				} else {
					parentId = that.parentsFolders[index].code;
				}
				var ids = that.currentSelected.join(',');
				dataService.get('moveFile',{parentId:parentId,ids:ids,targetId:targetId}).then(function(res) {
					if(res.success) {
						that.showMoveWin = false;
						that.currentSelected = [];
						dataService.get('getAllFolder',{parentId:targetId}).then(function(data) {
							if(data.success) {
								that.list = data.entity;
							}
						});
						that.parentsFolders = that.temporaryParents;//替换新的目录
						getAllFolders();
					}
				});
			} else {
				return false;
			}
		}

		//阻止事件冒泡
		that.prevent = function(e) {
			e.stopPropagation();
		}

		that.logout = function() {
			dataService.removeCookie('entryType', {'domain': config.domain,'path':'/'});
	        dataService.removeCookie('clientName', {'domain': config.domain,'path':'/'});
	        dataService.removeCookie('cubeId');
	        dataService.removeCookie('nickName', {'domain': config.domain,'path':'/'});
	        dataService.removeCookie('sid', {'domain': config.domain,'path':'/'});
	        dataService.removeCookie('user', {'domain': config.domain,'path':'/'});
	        dataService.removeCookie('name', {'domain': config.domain,'path':'/'});
	        dataService.removeCookie('name', {'domain': config.domain,'path':'/auth'});
	        $.ajax({
	            type:'get',
	            url: config.baseUrl+'user/loginOut',
	            complete: function () {
	                window.location.href=config.baseUrl;
	            }
	        });
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

	//矩阵式新建文件夹dom元素指令
	newFolderDirective.$inject = [];
	function newFolderDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<dl class="newFolder" ng-show="mc.newFolderShow"><dt class="folder"></dt><dd><form ng-submit="mc.goNewFolder()"> <input type="text" ng-model="mc.newFolderName" maxlength="50" /><i class="go" ng-click="mc.goNewFolder()"></i> <i class="cancel" ng-click="mc.newFolderShow = false"></i></form></dd></dl>',
			link:function(scope,element,attr) {
				scope.$on('newFolderFocus',function() {
					element.find('input').focus(function() {
						element.find('input').select();
					});					
				})
			}
		}
	}

	//列表式新建文件夹dom元素指令
	newFolder2Directive.$inject = [];
	function newFolder2Directive() {
		return {
			restrict:'E',
			replace:true,
			template:'<div class="newfolder2" ng-show="mc.newFolderShow"><form ng-submit="mc.goNewFolder()"><i class="ico" style="border:none;background:none;"></i><span class="folder"></span><input type="text" ng-model="mc.newFolderName" maxlength="50" /><i class="go" ng-click="mc.goNewFolder()"></i> <i class="cancel" ng-click="mc.newFolderShow = false"></i></form><div>',
			link:function(scope,element,attr) {
				scope.$on('newFolderFocus',function() {
					element.find('input').focus(function() {
						element.find('input').select();
					});					
				})
			}
		}
	}

	//左侧文件夹树
	allFoldersDirective.$inject = [];
	function allFoldersDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			controller:['$scope',function($scope) {
				var that = this;
				that.setCurrentFolder = function(id,arr) {
					var obj = {
						collectionCode:id,
						folders:arr
					}
					$scope.$emit('folderChange',obj);
				}
			}],
			controllerAs:'foldersListCtrl',
			scope:{'folders':'=','parents':'='},
			link:function(scope,element,attr,foldersListCtrl) {
				scope.$watch('folders',function(data) {
					var index = scope.parents.length-1;
					var parentsId = scope.parents[index].code;					
					var htmlStr =compileTree(data,'',0,parentsId);					
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
						$('.sideNav a').removeClass('on');
						$(this).addClass('on');
						var arr = [];
						$(this).parents('li').each(function(index,e) {
							var dom = $(e).find('>a');
							var obj = {code:dom.attr('data-key'),name:dom.text()};
							arr.push(obj);
						});
						arr.reverse();
						foldersListCtrl.setCurrentFolder($(this).attr('data-key'),arr);
					});
					element.find('a.on').parents('ul').show();
					element.find('a.on').siblings('ul').show()
				});

				//面包屑导航点击后，更改左侧选中项
				scope.$on('folderCheck',function(res,data) {
					$('.sideNav a').removeClass('on').each(function(index,e) {
						if($(e).attr('data-key')==data.code) {
							$(e).addClass('on');
							return false;
						}
					});
				});

				//主体部分点击文件夹进入，改变左侧选中项
				scope.$on('goNextLayer',function(res,data) {
					element.find('a').each(function(index,e) {
						$(e).removeClass('on');
						if($(e).attr('data-key')==data) {
							$(e).addClass('on');
							$(e).parents('ul').show().siblings('.switch').removeClass('closed').addClass('opened');
							var arr = [];
							$(e).parents('li').each(function(index,ev) {
								var dom = $(ev).find('>a');
								var obj = {code:dom.attr('data-key'),name:dom.text()};
								arr.push(obj);
							});
							arr.reverse();
							scope.$emit('toNewParents',arr);
						}
					});
				});

				function compileTree(arr,htmlStr,level,parentsId) {
					level+=1;
					angular.forEach(arr,function(v,k) {
						if(parentsId == v.collectionCode ) {
							if(v.child && v.child.length>0) {
					            htmlStr+='<li><span class="switch opened" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" class="on" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a>'+compileTree(v.child,'',level,parentsId)+'</li>';
							} else {
								htmlStr+='<li><span class="switch none" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" class="on" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a></li>';
							}
						} else {
							if(v.child && v.child.length>0) {
					            htmlStr+='<li><span class="switch closed" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a>'+compileTree(v.child,'',level,parentsId)+'</li>';
							} else {
								htmlStr+='<li><span class="switch none" style="left:'+level*12+'px"></span><a data-key="'+v.collectionCode+'" style="padding-left:'+(level*12+12)+'px"><span class="folder"></span>'+v.collectionName+'</a></li>';
							}
						}
						
			        });
		            return '<ul>'+htmlStr+'</ul>';
		        }
			}
		}
	}

	folderListDirective.$inject = [];
	function folderListDirective() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			controller:['$scope',function($scope) {
				var that = this;
				that.setCurrentFolder = function(id,name,arr) {
					var obj = {
						id:id,
						name:name,
						newParents:arr
					}
					$scope.$emit('selectedMoveTaget',obj);
				}
			}],
			controllerAs:'selectFolderListCtrl',
			scope:{'list':'=','show':'='},
			link:function(scope,element,attr,selectFolderListCtrl) {
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
						var arr = [];
						$(this).parents('li').each(function(index,e) {
							var dom = $(e).find('>a');
							var obj = {code:dom.attr('data-key'),name:dom.text()};
							arr.push(obj);
						});
						arr.reverse();
						selectFolderListCtrl.setCurrentFolder($(this).attr('data-key'),$(this).text(),arr);
						scope.show = false;
					});
				});
			}
		}


		function compileTree(arr,htmlStr,level) {
			level+=1;
			angular.forEach(arr,function(v,k) {
				if(v.collectionCode=='all' ) {
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
})();