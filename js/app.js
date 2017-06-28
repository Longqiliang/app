
var URL='http://fttsoft.net:9201/';
//var AppName = '';
(function($,owner){
	/**
	 * 用户登录
	 * @param {Object} loginInfo
	 * @param {Function} callback
	 * **/
	owner.login = function(loginInfo,callback){
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.company_code = loginInfo.company_code || '' ;
		loginInfo.user_name =  loginInfo.user_name || '';
		loginInfo.password = loginInfo.password || '';
		//逻辑判断
		if(loginInfo.company_code==''){
			return callback("企业代码不存在")
		}	
		if(loginInfo.user_name==''){
			return callback("账号不符合规则！");
		}
		if(loginInfo.password==''){
			return callback("密码格式错误！");
		}
		if(!login){
			return;
		}
		$.ajax({
			type:"POST",
			url:URL+"ftt_cloud_api/api/UserLogin",
            data:loginInfo,
            dataType:'json',
            timeout:6000,
            headers:{'Content-Type':'application/json'},
            success:function(result){
            	if(result.success==true){	
            		login = false;
            		result.password = EnEight(loginInfo.password);
            		return owner.createState(result,callback);
            	}else{
            		login = true;
            		return callback("登录失败，请输入正确的信息！");
            	}
            },
            error:function(xhr,type,errorThrown){
				
				callback('网络出现故障，请稍后再试！');
			}
		});
		
//		var users = JSON.parse(localStorage.getItem('$users')||'[]');
//		var hasUser = users.some(function(res){
//			return  loginInfo.user ==  res.user && loginInfo.pwd == res.pwd; 
//		});
//		if(hasUser){
//			return owner.createState(loginInfo.account, callback);
//		}else{
//			return callback('用户名或密码错误');
//		}
	}
    /**
     * 用户注册
     * **/
    owner.reg = function(regInfo,callback){
    	callback = callback || $.noop;
		regInfo = loginInfo || {};
		regInfo.user = loginInfo.user || '' ;
		regInfo.pwd =  loginInfo.pwd || '';
		//逻辑判断
		if(regInfo.user){
			return callback("账号不符合规则！");
		}
		if(regInfo.pwd){
			return callback("密码格式错误！");
		}	
    }
    /**
     * 设置本地信息
     * @param {Object} result 返回的结果
     * @param {Function} callback 回调函数
     */
    owner.createState = function(result, callback) {
    	//存储用户部分信息
		var state = owner.getState();
		state.name = result.display_name;
		state.userId = result.user_id;
		state.token = result.access_token;
		state.loginName = result.login_name;
		state.companyName = result.company_name;
		state.companyLogo = result.company_logo;
		state.companyCode = result.company_code;
		state.host = result.host;
		state.psd = result.password;
		owner.setState(state);
		//存储默认设置信息
		var setting = owner.getSettings();
		setting.notification = true;
		setting.mark = true;
		setting.voice = false;
		setting.vibrate = false;
		owner.setSettings(setting);
		return callback();
	};
	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};
    /**
     * 获取本地应用配置
     * */
	
    owner.getSettings =	function(){
    	var settingsText = localStorage.getItem('$setting') || '{}';
    	return JSON.parse(settingsText);
    }
	/**
	 * 设置本地应用配置
	 * */
	owner.setSettings = function(settings){
		settings = settings || {};
		localStorage.setItem('$setting',JSON.stringify(settings));
	}
	/**
	 * @param {String} id 窗口id(不填取url)
	 * @param {String} url 窗口地址
	 * @param {Object} extras 传递参数
	 */
	owner.openVW=function(id,url,extras){
		$.openWindow({
			id:id||url,
			url:url,
			extras:extras,
			show: {
//				autoShow:true,
				aniShow: 'pop-in',
				duration:300
			},
			waiting: {
				autoShow: false
			},
			crateNew:false
		});
	}
	
	//重写退出应用
	owner.quitApp = function() {
		$.oldBack = mui.back;
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出'+AppName);
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	}	
}(mui,window.app={}));

//是否为空对象
function isEmptyObject(el){
    for(var n in el){return false} 
    return true; 
}
/*8进制加密*/
function EnEight(txt){
	var txt = txt.toString();
    var monyer = new Array();var i,s;
    for(i=0;i<txt.length;i++)
        monyer+="\\"+txt.charCodeAt(i).toString(8); 
    txt=monyer;
    return txt;
}
