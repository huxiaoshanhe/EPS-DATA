(function() {
  'use strict';
  // 错误服务, 负责处理业务错误

  angular
    .module('pf.core')
    .factory('errorService', errorService);

  errorService.$inject = ['$q','$rootScope'];
  function errorService($q,$rootScope) {
    var service = {
      'swallow': swallow,
      'interception': interception,
      'NotLoggedIn': 100,
      'NoPermission': 101,
      'showError':showError,
      'prompt':prompt
    };
    return service;

    /**
     * 简易数据拦截, 负责拦截服务器错误信息
     * @param  {Object} source 数据源
     * @return {Object} 拒绝或数据
     */
    function interception(source) {
      if (source && source.errorType) {
        return $q.reject('服务器错误消息处理!!');
      } else {
        return source;
      }
    }

    /**
     * 根据错误码做出相应的处理
     * @param  {Number} status 内部封装的错误码
     */
    function swallow(status) {
      switch(status) {
        case 100: // 未登录
          //console.warn('未登录!');
          showError('未登录');
          break;
        case 101: // 无权限
        	showError('登录过期，请重新登录');
          break;
        default:
          showError('不识别的错误状态' + status);
        break;
      }
    }
    
    
    function showError(msg) {
      if(typeof msg =='object') {
        var message = msg.data.errorMessage;
      } else {
        var message =msg;
      }
      $rootScope.$emit('showErrorMsg',{show:true,msg:message});
    }

    function prompt() {
      confirm('是否继续');
    }
  }

})();