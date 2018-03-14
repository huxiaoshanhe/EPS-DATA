(function() {
  'use strict';
  // 右键菜单服务, 提供创建和绑定右键菜单的接口

  angular
    .module('pf.condition')
    .factory('rightmenuService', rightmenuService);

  rightmenuService.$inject = ['coreCF'];
  function rightmenuService(config) {
    var _spk = config.spreadKey;
    var _scope = null; // 右键菜单控制器作用域
    var _property = {}; // 控制菜单显示
    var _callback = {}; // 点击回调

    var service = {
      'show': showMenu,
      'hide': hideMenu,
      'register': register,
      'createMenu': createMenu,
      'click': function(key){ _callback(key); }
    };
    return service;

    /**
     * 注册控制器作用域, 负责接收通知
     * @param  {Scope} scope 控制器作用域
     */
    function register(scope) {
      _scope = scope;
    }

    /**
     * 通知创建变更一个菜单
     * @param  {Object} data [description]
     */
    function createMenu(data, callback) {
      _callback = callback;
      _scope.$broadcast('createRightMenu', data);
    }

    /**
     * 显示菜单
     * @param  {Number} top 定位上距
     * @param  {Number} left 定位左距
     */
    function showMenu(top, left) {
      var b_height = $(window).height();//窗口高度
      var b = b_height-top;
      if(b-174<0) {//判断窗口高度减去鼠标位置是否大于菜单高度
    	  _property.top=b_height-174;
      } else {
          _property.top = top;
      }
      _property.left = left;
      _property.show = true;
      _scope.$broadcast(_spk.toggleRightMenu, _property);
    }

    /**
     * 隐藏菜单
     */
    function hideMenu() {
      _property.show = false;
      _scope.$broadcast(_spk.toggleRightMenu, _property);
    }
  }

})();
