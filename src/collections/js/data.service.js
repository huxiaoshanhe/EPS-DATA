(function() {
  'use strict';
  // 数据服务, 提供本地后台数据交互

  angular
    .module('pf')
    .factory('dataService', dataService);

  dataService.$inject = ['$http', '$q', '$templateCache', 'coreCF'];
  function dataService($http, $q, $templateCache, config) {
    var _urlMap = config.urlMap; // 请求地址映射
    var _logUrl = config.logUrl;
    var service = {
      'get': get,
      'post': post,
      'getHtml': getHtml,
      'getItem': getItem,
      'setItem': setItem,
      'removeCookie': removeCookie,
      'getCookieObj': getCookieObj,
      'putCookieObj': putCookieObj,
      'getLog':getLog,
      'addDataLog':addDataLog,
      'searchLog':searchLog,
      'getSessionItem':getSessionItem,
      'setSessionItem':setSessionItem
    };
    return service;

    /**
     * 指定action名获取数据
     * @param  {String} name action映射名称
     * @param  {Object} params 对应参数
     * @return {Promise} 承诺
     */
    function get(name, params) {
      if(params) {
        params.sid = getCookieObj('sid');
      } else {
        params = {sid:getCookieObj('sid')}
      }
      var _url = createRepeatUrl(name);
      var options = {'params': params};

      return $http.get(_url, options)
        .then(completeCallBack)
        .catch(failedCallBack);
    }
    
    /**
     * 获取操作日志
     */
    function getLog(name, params) {
        var url = createRepeatLogUrl(name);
        var options = {'params': params};

        return $http.get(url, options)
          .then(completeCallBack)
          .catch(failedCallBack);
      }

    /**
     * 同get, 对angular的post封装
     * @param  {String} name   action映射名称
     * @param  {Object} params 对应参数
     * @return {Promise}       承诺
     */
    function post(name, params) {
      var url = createRepeatUrl(name);
        
      return $http.post(url, params)
        .then(completeCallBack)
        .catch(failedCallBack);
    }

    /**
     * 获取html
     * @param  {Stirng} url 地址
     * @return {Promise}
     */
    function getHtml(url) {
      var deferred = $q.defer(), html = $templateCache.get(url);
      if (html) { deferred.resolve(html); }
      else {
        $http.get(url).then(function(res) {
          deferred.resolve(res.data);
          $templateCache.put(url, res.data); // 可以加判断限制是否缓存
        });
      }
      return deferred.promise;
    }

    //jquery-cookie封装
    function getCookieObj(key, options) {
      return $.cookie(key);
    }

    function putCookieObj(key, value, options) {
      return $.cookie(key, value, options);
    }

    function removeCookie(key, options) {
      return $.removeCookie(key, options);
    }
    //jquery-cookie封装
    
    // html5本地储存封装
    function setItem(key, value) {
      if (!angular.isString(value)) {
        value = angular.toJson(value);
      }
      return window.localStorage.setItem(key, value);
    }

    function getItem(key) {
      var value = {};
      var string = window.localStorage.getItem(key);
      if (string) { value = angular.fromJson(string); }
      return value;
    }
    
    // html5本地储存封装
    function setSessionItem(key, value) {
      if (!angular.isString(value)) {
        value = angular.toJson(value);
      }
      return window.sessionStorage.setItem(key, value);
    }

    function getSessionItem(key) {
      var value = {};
      var string = window.sessionStorage.getItem(key);
      if (string) { value = angular.fromJson(string); }
      return value;
    }

    function addDataLog(cubeId,eventCode, url) {
      get('dataLog',{dbId:cubeId, eventCode:eventCode});
    }
    function searchLog(locSearch, keywords) {
      get('searchLog',{locSearch: locSearch,keywords: keywords});
    }
    
    // 正确完成后回调
    function completeCallBack(response) {
      var data = response.data;
      return data;
    }

    // 失败后的回调
    function failedCallBack(error) {
      
    }

    /**
     * 根据配置创建请求地址
     * @param  {String} name key
     * @return {String} 返回实际请求地址
     */
    function createRepeatUrl(name) {
      var mapObject = _urlMap[name];
      if (angular.isString(mapObject)) { // 拼接规则
        return config.baseUrl + mapObject;
      } else {
        return mapObject.base + mapObject.action;
      }
    }
    
    function createRepeatLogUrl(name) {
      var mapObject = _logUrl[name];
      if (angular.isString(mapObject)) { // 拼接规则
        return config.loginUrl + mapObject;
      } else {
        return mapObject.base + mapObject.action;
      }
    }
  }

})();