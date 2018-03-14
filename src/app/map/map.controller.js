(function() {
	'use strict';

	angular.module('pf.charts')
	.controller('mapCtrl',mapCtrl);
	mapCtrl.$inject = ['$scope','mapService','$interval','coreCF','dataService','$http'];
	function mapCtrl($scope,mapService,$interval,config,dataService,$http) {
		var that = this;
		that.switch = false;
		that.selectRecord = {};
		that.currentColor='#007EFE';
		$scope.$on('mapTimes',function(e,data) {
			that.times = mapService.getTimes();
			if(config.mapDims.timeCode[0]) {
				that.selectRecord.time = config.mapDims.timeCode[0];
			} else {
				that.selectRecord.time = that.times[0].code;
			}
			timeLine(that.times);		
		});

		$scope.$on('newMap',function(e,data) {
			that.getMapData();
			that.timeSwitch(true);
		});

		that.getMapData = function() {
			var params = mapService.getMapParam();
			var keepGoing = true;
			angular.forEach(that.times,function(v) {
				if(keepGoing) {
					if(v.code==params.timeCode) {
						that.selectRecord.timeName = v.name;
						keepGoing = false;
					}
				}				
			});
			params.sid = dataService.getCookieObj('sid');
			//params = $.param(params);
			dataService.post('newMap',params).then(function(data) {
				var titleArr = [];
				for(var i in data.title) {
					titleArr.push(data.title[i]);
				}
				that.mapTitle = titleArr.join('---');
				data.mapTitle = titleArr.join('-');
				that.mapData = data;
				that.mapData.baseColor=that.currentColor;
				that.mapData.timeName = that.selectRecord.timeName;
			});
			dataService.addDataLog(config.cubeId,5);
		}

		


		/**
		 *时间轴开关
		 *@param flag[boolean] true则是已开启，通知关闭；false则是已关闭，通知开启
		 */
		that.timeSwitch = function(flag) {
			that.switch = !flag;
			if(flag===false) {
				var num = null;
				angular.forEach(that.times,function(v,k){
					if(v.code===that.selectRecord.time) {
						num = k;
					}
				});
			} else {
				that.cancelPlay = $interval.cancel(that.timePlay);
				return false;
			}

			that.timePlay = $interval(function(){
				nowTime(num)
				that.getMapData();
				num+=1;				
				if(num===that.times.length) {
					num=0;
				}
			},2000);
		}

		/**上一个时间，并停止时间轴播放**/
		that.timePrev = function() {
			var num = null;
			$interval.cancel(that.timePlay);
			angular.forEach(that.times,function(v,k){
				if(v.code===that.selectRecord.time) {
					num = k;
				}
			});
			num=num-1;
			if(num<0) {
				num=that.times.length-1;
			}
			nowTime(num)
			that.getMapData();			
		}

		/**下一个时间，并停止时间轴播放**/
		that.timeNext = function() {
			var num = null;
			$interval.cancel(that.timePlay);
			angular.forEach(that.times,function(v,k){
				if(v.code===that.selectRecord.time) {
					num = k;
				}
			});
			num=num+1;
			if(num>that.times.length-1) {
				num=0;
			}
			nowTime(num)			
			that.getMapData();
		}

		function nowTime(num) {//改变时间轴的当前选中时间
			that.selectRecord.time = that.times[num].code;
			that.selectRecord.timeName = that.times[num].name
			config.mapDims.timeCode[0] = that.times[num].code;
			if(num>=7&&num<that.times.length-1) {
				that.timeListInnerStyle.marginLeft=-80*(num-6)+'px';
			}else if(num>=7&&num===that.times.length-1) {
				that.timeListInnerStyle.marginLeft=-80*(num-7)+'px';
			} else {
				that.timeListInnerStyle.marginLeft='0px';
			}
		}

		/**
		 *当时间或指标改变时，重新绘制地图
		 *@param code[string] 时间或指标code
		 *@param type[string] 判断是时间改变还是指标改变
		 **/
		that.reDrawMap = function(code,type) {			
			that.switch = false;
			$interval.cancel(that.timePlay);
			if(type='timeChange') {
				that.selectRecord.time=code;
				config.mapDims.timeCode[0] = code;
				var keepGoing = true;
				angular.forEach(that.times,function(v,k) {
					if(keepGoing) {
						if(v.code===code) {
							if(k>=7&&k<that.times.length-1) {
								that.timeListInnerStyle.marginLeft=-80*(k-6)+'px';
							}else if(k>=7&&k===that.times.length-1) {
								that.timeListInnerStyle.marginLeft=-80*(k-7)+'px';
							} else {
								that.timeListInnerStyle.marginLeft='0px';
							}
							that.selectRecord.timeName = v.name;
							keepGoing = false;
						}
					}
					
				});
				that.getMapData();
			}			
		}

		/**改变颜色并重新绘制地图**/
		that.selectColor = function(color) {
			that.currentColor = color;
			that.colorOpen=false;
			that.getMapData();
		}

		/**初始化时，时间轴样式**/
		function timeLine(times) {
			var keepGoing = true;
			var num = null;
			angular.forEach(times,function(v,k) {
				if(keepGoing) {
					if(v.code==that.selectRecord.time) {
						keepGoing = false;
						num = k;
					}
				}
			});
			if(times.length<=8) {
				that.timeLineStyle = {
					width:(times.length-1)*80+'px'
				}
				that.timeListStyle= {
					width:times.length*80+'px'
				}
			} else {
				that.timeLineStyle = {
					width:'560px'
				}
				that.timeListStyle= {
					width:'640px'
				}
			}
			that.timeListInnerStyle= {
				width:times.length*80+'px'
			}
			if(num>=7&&num<that.times.length-1) {
				that.timeListInnerStyle.marginLeft=-80*(num-6)+'px';
			}else if(num>=7&&num===that.times.length-1) {
				that.timeListInnerStyle.marginLeft=-80*(num-7)+'px';
			} else {
				that.timeListInnerStyle.marginLeft='0px';
			}
		}

		$scope.$on('changeCube',function(e,data) {
			if(data) {
				that.timeSwitch(true);
			}
		});
	}
})();