(function() {
	'use strict';
	angular.module('pf.workbook')
	.factory('toolService',toolService);
	toolService.$inject = ['handsontableService','conditionService','dataService','tableFactory','$rootScope','coreCF','errorService','chartService'];
	function toolService(handsontableService,conditionService,dataService,tableFactory,$rootScope,config,errorService,chartService) {
		var service = {
			'lag':lag,
			'excelDownload':excelDownload
		}
		return service;

		function lag() {
			var fixedNum = handsontableService.getFixedNum();
			var area = handsontableService.getSelected();
            if(area) {
                var num = prompt('请输入滞后阶数');
                if(!num) {
                	return false;
                } 
                var sheetId = conditionService.getSheetId();
                var params = {
                    action:'lag',
                    lag:num,
                    method:'lag',
                    p1:area[0]+','+area[1],
                    p2:area[2]+','+area[3],
                    sheetId:sheetId
                }
            } else {
                alert('请选择一片区域');
                return false;
            }
			dataService.get('timeseries',params).then(function(data) {
				var datas = tableFactory.parse(data);
				datas.fixedColumnsLeft = fixedNum.left;
				datas.fixedRowsTop = fixedNum.top;
				$rootScope.$emit('workbook',datas);
			});
		}

		function excelDownload() {
			dataService.get('isDownload',{cubeId:config.cubeId}).then(function(data) {
				if(data.isDownload ==true) {
					var sheetId = config.newSheetId;
            		dataService.addDataLog(config.cubeId,1);
            		var sid = dataService.getCookieObj('sid');
            		if($('.chartArea').css('display')=='block') {
            			var imageType = chartService.getChartType();
            			if(imageType=='Scatter') {
							var scatterXY = chartService.getScatterXY();
							imageType += ','+scatterXY.x+','+scatterXY.y;
						}
						var isUserDefined = chartService.getIsUserDefined();
						var chartAttrs = chartService.getChartAttrs();
						if(isUserDefined||chartAttrs.indexOf('dataValue')!=-1) {
							html2canvas($('.chartWrap '), {
					            onrendered: function (canvas) {
					            	var imageData = canvas.toDataURL("png");
					                var formStr = '<form method="post" target="_blank" action="'+config.baseUrl+config.urlMap.download+'">';
					                formStr += '<input name="action" type="text" value="table" />';
					                formStr += '<input name="sheetId" type="text" value="'+sheetId+'" />';
					                formStr += '<input name="type" type="text" value="EXCEL" />';
					                formStr += '<input name="exportType" type="text" value="EXCEL" />';
					                formStr += '<input name="imageData" type="text" value="'+imageData+'" />';
					                var form = $(formStr);
					                form.appendTo('body');
		        					form.css('display','none');
								    form.submit();
								    form.remove();
					            }
					        });
						} else {
							location.href=config.baseUrl+config.urlMap.download+'?action=table&sheetId='+sheetId+'&type=EXCEL&exportType=EXCEL&imageType='+imageType+'&sid='+sid;
						}		            	
		            } else {
		            	location.href=config.baseUrl+config.urlMap.download+'?action=table&sheetId='+sheetId+'&type=EXCEL&exportType=EXCEL&sid='+sid;
		            }            		
				} else {
					errorService.showError('你没有下载权限！');
				}
			});
			return ;			
		}
	}
})();