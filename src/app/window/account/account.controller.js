
(function() {
	'use strict';
	angular.module('pf.window')
	.controller('accountCtrl',accountCtrl);
	accountCtrl.$inject = ['$rootScope','$scope','dataService','$timeout','$interval','coreCF'];
	function accountCtrl($rootScope,$scope,dataService,$timeout,$interval,config) {
		var that = this;
		that.loginShow = false;
		that.registerShow = false;
		that.findShow = false;		
		that.registerSendDisabled = false;
		that.findSendDisabled = false;
		that.registerSend = '获取邮箱验证码';
		that.findSend = '获取邮箱验证码';
		$scope.$on('loginPersonal',function(res,data) {
			that.loginShow = true;
			that.loginError = '';
			that.registerError = '';
			that.findError = '';
			that.loginTipsStatus = 'error';
			that.registerTipsStatus = 'error';
			that.findTipsStatus = 'error';
		});
		that.login = {
			loginType:'groupPersonal',
			loginName:'',
			password:''
		}

		that.register = {
			nickname:'',
			password:'',
			repassword:'',
			college:'',
			email:'',
			code:'',
			isAgree:false
		}

		that.find = {
			loginName:'',
			password:'',
			repassword:'',
			code:''
		}

		that.goLogin = function() {
			if(canLogin()) {
				dataService.get('userLogin',that.login).then(function(data) {
					if(data.success) {
						$rootScope.userNickname = data.userNickName;
				        that.loginError = '登录成功！';
				        that.loginTipsStatus = 'success';
				        dataService.putCookieObj('name',encodeURI(data.name),{expires:0.125,domain:config.domain,path:'/'});    
				       	var userObj = {'userName':data.userInfoBO.clientName,'groupUserId':data.userInfoBO.groupUserId,'userType':data.userInfoBO.userType};
				        var userStr = angular.toJson(userObj);
				        dataService.putCookieObj('user',userStr,{expires:0.125,domain:config.domain,path:'/'});  
				       	$timeout(function() {
				       		that.loginShow = false;
				        	$scope.$emit('showWindow',false);
				       	},2000);
					} else {
						error('login',data.message);
					}					
				});
			} else {
				return false;
			}
		}

		that.goRegister = function() {
			if(canRegister()) {
				var params = {
					nickname:that.register.nickname,
					password:that.register.password,
					email:that.register.email,
					emailCode:that.register.code
				}
				dataService.get('personalReg',params).then(function(data) {
					if(data.success) {
						that.registerError = '恭喜你！注册成功';
						that.registerTipsStatus = 'success';
						$timeout(function() {
							that.registerShow = false;
							that.loginShow = true;
						},2000);
					} else {
						error('register',data.message);
					}
				});
			} else {
				return false;
			}
		}

		that.goFind = function() {
			if(canFind()) {
				var params = {
					emailCode:that.find.code,
					email:that.find.loginName,
					pwd:that.find.password
				}
				dataService.get('resetPwd',params).then(function(data) {
					if(data.success) {
						that.findError = '修改成功';
						that.findTipsStatus = 'success';
						$timeout(function() {
							that.findShow = false;
							that.loginShow = true;
						},2000);
					} else {
						error('find',data.message);
					}
				});
			} else {
				return false;
			}
		}

		that.sendRegisterCode = function() {
			if(that.registerSendDisabled) {
				return false;
			} else {
				if(that.register.email=='') {
					error('register','请填写邮箱');
					return false;
				} else if(!checkEmail(that.register.email)) {
					error('register','请填写有效邮箱');
					return false;
				}
				var time = 60;
				dataService.get('sendEmailCode',{email:that.register.email});
				that.registerSendDisabled = true;
				var a = $interval(function(){
					time--
					if(time>0) {
						that.registerSend = time+'s后重新发送';
					} else {
						that.registerSend = '发送邮箱验证码';
						that.registerSendDisabled = false;
						$interval.cancel(a);
					}
				},1000);
			}
		}
		that.sendFindCode = function() {
			if(that.findSendDisabled) {
				return false;
			} else {
				if(that.find.loginName=='') {
					error('find','请填写邮箱');
					return false;
				} else if(!checkEmail(that.find.loginName)) {
					error('find','请填写有效邮箱');
					return false;
				}
				var time = 60;
				dataService.get('sendFindCode',{email:that.find.loginName});
				that.findSendDisabled = true;
				var b = $interval(function(){
					time--
					if(time>0) {
						that.findSend = time+'s后重新发送';
					} else {
						that.findSend = '发送邮箱验证码';
						that.findSendDisabled = false;
						$interval.cancel(b);
					}
				},1000);
			}
		}

		function canLogin() {
			if(that.login.loginName==''||that.login.password=='') {
				error('login','邮箱和密码不能为空');
				return false;
			} else {
				if(!checkEmail(that.login.loginName)) {					
					error('login','邮箱不合法');
					return false;
				} else {
					return true;
				}
			}
		}
		function canFind() {
			if(that.find.loginName==''||that.find.password==''||that.find.repassword==''||that.find.code=='') {
				error('find','以上输入不能为空');
				return false;
			} else {
				if(!checkEmail(that.find.loginName)) {
					error('find','邮箱不合法');
					return false;
				} else if(that.register.password!==that.register.repassword) {
					error('find','两次密码输入必须相等');
					return false;
				} else {
					return true;
				}
			}
		}
		function canRegister() {
			if(!that.register.isAgree) {
				error('register','你需要同意用户协议');
				return false;
			} 
			if(that.register.nickname==''||that.register.password==''||that.register.repassword==''||that.register.email==''||that.register.code=='') {
				error('register','“*”为必填项');
				return false;
			} else {
				if(!checkEmail(that.register.email)) {
					error('register','邮箱不合法');
					return false;
				} else if(that.register.password!==that.register.repassword) {
					error('register','两次密码输入必须相等');
					return false;
				} else {
					return true;
				}
			}
		}

		function checkEmail(email){
			var pattern=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-.])+\.)+([a-zA-Z0-9]{2,4})+$/;
			if(pattern.test(email)) {
				return true;
			} else {
				return false;
			}
		}

		function error(type,msg) {
			if(type=='login') {
				that.loginTipsStatus = 'error';
				that.loginError = msg;
				$timeout(function(){
					that.loginError = '';
				},3000);
			} else if(type=='register') {
				that.registerTipsStatus = 'error';
				that.registerError = msg;
				$timeout(function(){
					that.registerError = '';
				},3000);
			} else if(type=='find') {
				that.findTipsStatus = 'error';
				that.findError = msg;
				$timeout(function(){
					that.findError = '';
				},3000);
			}			
		}
	}
})();