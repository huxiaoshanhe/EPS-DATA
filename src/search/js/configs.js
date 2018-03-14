(function() {
  'use strict';
  // 核心模块, 提供基础功能

  angular
    .module('pf')
    .constant('coreCF', {
      // 基础链接
      domain: 'olap.epsnet.com.cn',
      baseUrl: 'http://olap.epsnet.com.cn/',
      loginUrl: 'http://olap.epsnet.com.cn/',
      // 请求地址映射
      urlMap: {
        'userInfo':'userInfo.do',
        'cubes':'api/all/cubes.do',
        'search':'searchPage.do',
        'getInitIndicator':'searchDimensionsMode.do',
        'dataLog':'log/dataLog',
        'searchLog':'log/searchLog',
        'news':'info/activities/get.do',
        'getInfomation':'information/dims/get.do'
      }
    });

})();