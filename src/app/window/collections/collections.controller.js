(function() {
	'use strict';
	angular.module('pf.window')
	.controller('collectionsCtrl',collectionsCtrl);
	collectionsCtrl.$inject = ['$scope','dataService','errorService','coreCF'];
	function collectionsCtrl($scope,dataService,errorService,config) {
		var that = this;
		that.show = false;
		$scope.$on('showFolder',function(e,data) {
			that.show = true;
			that.keywords = '';

			dataService.get('getAllFolders').then(function(data) {
				if(data.success) {
					that.allFolders = [
						{
							collectionCode:'all',
							collectionName:'全部文件',
							child:data.entity['0'].child
						}
					];
					that.currentSelected = {collectionCode:that.allFolders[0].collectionCode,collectionName:that.allFolders[0].collectionName};
				} else {
					that.allFolders = [
						{
							collectionCode:'all',
							collectionName:'全部文件'
						}
					];
				}				
			});	
			
			dataService.get('recFile').then(function(data) {
				if(data.success) {
					that.recFiles = {
						today : data.entity.today,
						month : data.entity.month,
						other:data.entity.other
					}
					that.filesList = null;
					that.searchList = null;
				} else {
					if(data.success!=undefined) {
						errorService.showError(data.message);
					}	
				}
			});

			$scope.$apply();
		});
		that.selectedFile = null;
		that.selectedFolder = {collectionCode:'all',collectionName:'全部文件'};
		$scope.$on('selectedFolder',function(res,data) {
			that.selectedFolder = data;
			dataService.get('getAllFolder',{parentId:data.collectionCode}).then(function(res) {
				if(res.success) {
					that.filesList = res.entity;
					that.recFiles = null;
					that.searchList = null;
				} else {
					if(res.success!=undefined) {
						errorService.showError(res.message);
					} else {
						that.filesList = [];
						that.recFiles = null;
						that.searchList = null;
					}
				}
			});
			$scope.$apply();
		});

		//选择文件或打开文件夹
		that.selectFile = function(obj) {
			if(obj.isDirectory) {
				that.selectedFolder = {collectionCode:obj.collectionCode,collectionName:obj.collectionName};
				$scope.$broadcast('goNextLayer',that.selectedFolder);
				that.selectedFile = null;
				dataService.get('getAllFolder',{parentId:obj.collectionCode}).then(function(res) {
					if(res.success) {
						that.filesList = res.entity;
						that.recFiles = null;
						that.searchList = null;
					} else {
						if(res.success!=undefined) {
							errorService.showError(res.message);
						} else {
							that.filesList = [];
							that.recFiles = null;
							that.searchList = null;
						}
					}
				});
			} else {
				that.selectedFile = obj;
			}
		}

		that.goSearch = function() {
			if(that.keywords==''||!that.keywords) {
				dataService.get('getAllFolder').then(function(data) {
					that.searchList = data.entity;
					that.filesList = null;
					that.recFiles = null;
				});
			} else {
				dataService.get('searchFile',{name:that.keywords}).then(function(res) {
					that.searchList = res.entity;
					that.filesList = null;
					that.recFiles = null;
				});
			}
		}

		that.goOpen = function() {
			if(!that.selectedFile) {
				return false;
			}
			var params = angular.fromJson(that.selectedFile.contents);
			$scope.$emit('openCollectFile',params);

			var cubeId = params.cubeId;
			var params2 = {
  				type:3,
  				dims:angular.toJson(params)
  			}
  			params2 = angular.toJson(params2);
  			dataService.putCookieObj('cubeId',cubeId,{path: '/'});
  			dataService.putCookieObj('entryType',params2,{path: '/'});

			that.show = false;
			$scope.$emit('showWindow',false);
		}

		that.dblOpen = function(e) {
			if(e.isDirectory!=1) {
				that.selectedFile = e;
				that.goOpen();
			}
		}

		that.prevent = function(e) {
			e.stopPropagation();
		}
	}


	angular.module('pf.window')
	.directive('dropFolderList',dropFolderListDir);
	dropFolderListDir.$inject = [];
	function dropFolderListDir() {
		return {
			restrict:'E',
			replace:true,
			template:'<div></div>',
			controller:['$scope',function($scope) {
				this.setCurrentFolder = function(id,title) {
					$scope.$emit('selectedFolder',{collectionCode:id,collectionName:title});
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

				scope.$on('goNextLayer',function(res,data) {
					element.find('a').each(function(index,e) {
						$(e).removeClass('on');
						if($(e).attr('data-key')==data.collectionCode) {
							$(e).addClass('on');
							$(e).parents('ul').show().siblings('.switch').removeClass('closed').addClass('opened');
						}
					});
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
						$('.folderList a').removeClass('on');
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
})();