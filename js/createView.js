(function($){
	$.createHeadView = function(options){
		var _isObject = function(obj) { //一个简单的判定数据类型是Object的方法
			return obj !== null && typeof obj === 'object';
		};
		var _extend = function(target, obj) { //一个简单的合并对象的方法
			for(var name in obj) {
				var src = target[name];
				var copy = obj[name];
				if(src === copy) { //值相等则跳过
					continue;
				}
				if(_isObject(copy)) { //值为Object类型则遍历复制
					src = src || {};
					target[name] = _extend(src, copy);
				} else {
					target[name] = copy;
				}
			}
			return target;
		};
		var _options = { //默认参数值
			viewId:'',
			id: '',
			height: '45px',
			title: '',
			titleColor: '#000000',
			fontSize: '16px',
			backgroundColor: '#ffffff',
			borderColor: '#ffffff',
			back: true,
			rightIcon:false,
			rightIconBase:'',
			textAlign:'center'
		};
		_options = _extend(_options, options);
		// 创建nativeView
		var _nview = new plus.nativeObj.View(_options.id, {
			height: _options.height,
			position: 'dock',
			width: '100%',
			dock: 'top'
		});
		// 绘制背景颜色
		_nview.drawRect(_options.backgroundColor);
		// 绘制border
		_nview.drawRect(_options.borderColor, {
			top: parseFloat(_options.height) - 1 + 'px',
			height: '1px'
		});
		// 绘制标题
		_nview.drawText(_options.title, {
			left:'55px'
		}, {
			color: _options.titleColor,
			size: _options.fontSize,
			align:_options.textAlign
		});
		// 绘制back按钮
		if(_options.back) {
			var _height = parseFloat(_options.height);
			var _rect = _height - 20;
			var _backIcon = new plus.nativeObj.Bitmap('icon_back');
			var BACK_BASE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAAlAQMAAADY/jOoAAAABlBMVEX///////9VfPVsAAAAAnRSTlP/AOW3MEoAAABlSURBVBjTjdChFcAgDATQ9FUgGaGjMBqMxiiMgIzgcRWXq0AV8w1JLjEgAXDDDlfo4QxHpv2hrVCrANy2AYDbuqjfdCY6Mu2Ftkr/Pv1Xvfqpv+ZpvvIo35dX+bXPPPZdxz14nxe0trxVs1baUQAAAABJRU5ErkJggg==';
			_backIcon.loadBase64Data(BACK_BASE, function() {
				_nview.drawBitmap(_backIcon, {}, {
					width: '24px',
					height: '18px',
					top: '14px',
					left: '10px'
				});
			});
			_nview.addEventListener('click',function(e){
				var clientX = e.clientX;   //在view控件中的x坐标
				if(clientX<44){
					var _self = plus.webview.getWebviewById(options.viewId);
					if(_self){
						_self.close();	
					}
				}
			},false)
		}
		if(_options.rightIcon){
			var _height = parseFloat(_options.height);
			var _rect = _height;
			var _rightIcon = new plus.nativeObj.Bitmap('icon_right');
			var RIGHT_BASE =_options.rightIconBase;
		    _rightIcon.loadBase64Data(RIGHT_BASE,function(){
		    	_nview.drawBitmap(_rightIcon,{},{
		    		width:'77px',
		    		height:'42px',
		    		top:'0px',
		    		right:'40px'
		    	})
		    });
		}
		return _nview;
	};
	$('body').on('tap', '#reloadWv', function() {
		plus.webview.currentWebview().reload();
	});
	$.requestLoad = function(){
		var state = JSON.parse(localStorage.getItem("$state"));
		if(!state){
			return;
		}
		var psd = DeEight(state.psd);
		var data = {
			"company_code":state.companyCode,
			"user_name":state.loginName,
			"password": psd
		}
//		$.ajax({
//			type:"POST",
//			url:"http://fttsoft.net:9201/ftt_cloud_api/api/UserLogin",
//			data:data,
//			dataType:'json',
//          timeout:6000,
//          headers:{'Content-Type':'application/json'},
//          success:function(result){
//          	if(result.success==true){	
//          		state.token = result.token;
//          		console.log(state.token);
//          		localStorage.setItem('$state', JSON.stringify(state));
////          		plus.webview.currentWebview().reload();
//          	}
//          },
//          error:function(xhr,type,errorThrown){	
//			}
//		});
	};
}(mui))
/**
 * @description 请求失败公共样式显示函数
 */
function reloadWvLoad(){
	var errorBtn =  document.createElement("div");
	errorBtn.innerHTML = '<h4>网络不给力，请检查网络！</h4><button id="reloadWv" class="mui-btn mui-btn-blue">重新加载</button>';
	errorBtn.setAttribute('class','empty-show');
	document.body.appendChild(errorBtn);
}

/**
 * @param {Object} options 打开页面的url,id 
 * @param {Object} page_style Webview窗口的样式
 * @param {JSON}  extras  额外扩展参数
 * */
function openView(options,page_style,extras,title){
	options = options || {};
	page_style = page_style || {};
	extras = extras || {},
	title = title || '';
	var selfUrl = options.url;
	var selfId = options.id || selfUrl;
	var load = options.load || false;
	if(!selfUrl){
		return;
	}
	var selfView =plus.webview.currentWebview();
	var subView = plus.webview.getWebviewById(selfId);

	if(!subView){
		subView =plus.webview.create(selfUrl,selfId,page_style,extras);
		if(typeof title ==='object'){
		    subView.append(title);
	   }
	}
	if(load){
		subView.addEventListener("rendered",function () {
			setTimeout(function () {
				subView.show('pop-in');	
			},300);	
		});
	}
	subView.addEventListener("titleUpdate",function () {
		setTimeout(function () {
			subView.show('pop-in');
		},100);	
	});
}
/**
 * @description 追加html
 * @param {Element} parent 需要被追加内容的dom对象
 * @param {String} text 追加的文本内容
 */

function appendHtml(parent, text) {
    if (typeof text === 'string') {
      var temp = document.createElement('div');
      temp.innerHTML = text;
      // 防止元素太多 进行提速
      var frag = document.createDocumentFragment();
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
      parent.appendChild(frag);
    }
    else {
      parent.appendChild(text);
    }
}
/*8进制解密*/
function DeEight(txt){
    var monyer = new Array();var i;
    var s=txt.split("\\");
    for(i=1;i<s.length;i++)
        monyer+=String.fromCharCode(parseInt(s[i],8));
    txt=monyer;
    return txt;
}
/**
 * ajax请求函数
 */
function againData(){
	var url = "http://fttsoft.net:9201/ftt_cloud_api/api/UserLogin";
	var state = JSON.parse(localStorage.getItem("$state"));
	if(!state){
			return;
		}
	var psd = DeEight(state.psd);
	var data = {
		"company_code":state.companyCode,
		"user_name":state.loginName,
		"password": psd
	};
	var login;	
	var xhr = new plus.net.XMLHttpRequest();
	xhr.onreadystatechange = function(){
		switch ( xhr.readyState ){			    
			case 4:
			    if( xhr.status == 200 ){
			    	var result = JSON.parse(xhr.responseText);
				    if(result.success==true){
				    	if(!login){
				    		login = true;
			          		state.token = result.access_token;
			          		console.log(state.token);
			          		localStorage.setItem('$state', JSON.stringify(state));
			          		plus.webview.currentWebview().reload();
				    	}	
				    	return;
		            }else{
		            	plus.navigator.closeSplashscreen();
						plus.nativeUI.toast('登录失败，请重新登录！');
						//显示启动导航
						openView({
							url:"login.html",
							id:'login'
						});	
		          	}
			    }else{
			    	plus.navigator.closeSplashscreen();
			    	reloadWvLoad();
			    }
			    break;
			default:
			    break;
		}
	}
	xhr.open("POST",url);
	xhr.setRequestHeader('Content-Type','application/json');
	xhr.send(data);
}