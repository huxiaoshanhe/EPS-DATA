(function() {
  'use strict';
  // 核心模块, 提供基础功能

  angular
    .module('pf.core', [])
    .constant('coreCF', {
      // 基础链接
      domain: 'olap.epsnet.com.cn',
      baseUrl: 'http://localhost:5323/platform/',
      loginUrl: 'http://olap.epsnet.com.cn/',
      chEnUrl:'http://bfit.epsnet.com.cn/auth/platform.html',
      // 请求地址映射
      urlMap: {
        'cubes':'api/all/cubes.do',
        'init':'center.do',
        'dim':'center.do',
        'chart':'charts.do',
        'indicatorChilds':'dim/indicator/get/indicatorvo2.do',
        'classifyChilds':'api/getclassNode.do',
        'industryChilds':'api/get/childs.do',
        'commodityChilds':'commodity/getCommodityNode.do',
        'getInitIndicator':'searchIndicator.do',
        'getAllIndicators':'dim/indicators/get/allCodesInCube.do',
        'getAllClassifyCodes':'classify/getAllClassifyCodes.do',
        'getAllIndustryCodes':'api/get/allCodesInCube.do',
        'getAllCommodityCodes':'commodity/getAllCommodityCodes.do',
        'indicatorAllChilds':'dim/indicators/get/allItemsCodes.do',
        'classifyAllChilds':'classify/getAllItems.do',
        'industryAllChilds':'api/get/allItemsCodes.do',
        'commodityAllChilds':'commodity/getAllItems.do',
        'getParentsIndicator':'dim/indicator/get/parents.do',
        'getParentsIndustry':'api/get/parents.do',
        'getParentClass':'api/get/classify/parents.do',
        'getCommodity':'commodity/parents.do',
        'calc':'calc.do',
        'timeseries':'timeseries.do',
        'search':'search.do',
        'variable':'variable.do',
        'scatter':'pointCharts.do',
        'concss':'concss.do',
        'download':'download.do',
        'get8020Msg':'get8020Msg.do',
        '8020':'8020.do',
        'newMap':'map/data.do',
        'refresh':'refresh.do',
        'userInfo':'userInfo.do',
        'mapDownload':'map/download',
        'getAllParentsIndicator':'dim/indicator/get/allParents.do',
        'getAllParentsClassify':'api/get/classify/allParents.do',
        'getAllParentsIndustry':'api/get/allParents.do',
        'getAllparentsCommodity':'commodity/allParents.do',
        'dataLog':'log/dataLog',
        'searchLog':'log/searchLog',
        'getInfomation':'information/dims/get.do',
        'news':'info/activities/get.do',
        'help':'help/getListHelp.do',
        'isDownload':'isDownload.do',
        'getIp':'user/getIp',
        'saveFile':'collection/createFile',
        'createFolder':'collection/createFolder',
        'deleteFile':'collection/deleteFile',
        'renameFile':'collection/renameFile',
        'getAllFolders':'collection/getAllFolder',
        'getAllFolder':'collection/getAll',
        'recFile':'collection/getAllCollectionFile',
        'moveFile':'collection/moveFile',
        'searchFile':'collection/searchFile',
        'sendEmailCode':'user/sendEmail.do',
        'sendFindCode':'queryUseCodeByEmail.do',
        'personalReg':'user/register',
        'userLogin':'user/login',
        'resetPwd':'changePwd.do',
        'userSp':'/user/sp'
      },
      cubeId:891,
      mapType:0,
      tabsSwitch:{
        tableShow:true,
        tableChartShow:false,
        chartShow:false,
        mapShow:false
      },
      // 监听事件的关键字
      spreadKey: {
        
      },
      dime:{

      },
      dimsbak:{//初始化后，但选择维度却没有同步数据
        indicatorCode:[],
        industryCode:[],
        classify_code:[],
        regionCode:[],
        timeCode:[],
        countryCode:[],
        countrySCode:[],
        countryTCode:[],
        commodityCode:[],
        entnature_code:[],
        booth_code:[],
        market_code:[],
        sex_code:[]
      },
      syncDims:'',//初始化后，但选择维度并同步数据
      mapDims:{},
      sorts:{
        type:'',
        index:''
      },
      basicCtrl:{//表格工具栏操作状态
        filter:'empty',
        routineMode:false,
        moneyStyle:false,
        percentStyle:false,
        delimitStyle:true
      },
      newSheetId:'',
      conditionId:'201102254',
      dimenParentCodes : {},
      mainCtrl:{//主要的几步请求后台的操作：合并计算，8020分析，排序，高亮显示
        's2':{
          'method': '',
          'type': ''
        },
        's3': {
          'index8020': '0',
          'fontStyle8020': '',
          'bgColor8020': ''
        },
        's4': {
          'orderStr': '',
          'index': ''
        },
        's5': {
          'dealStr':'',
          'showBackColor':'',
          'showFontStyle':''
        }
      },
      nowWorkAarea:1,//当前工作区域，1表格，2表格/图表，3图表，4地图
    });

})();