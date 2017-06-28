
(function($){
	var wgtVer = null,
		checkUrl = "http://www.dcloud.io/helloh5/update.json",
		wgtUrl = "",
		wgtuUrl = '',
		localDir="update",localFile="update.json",//本地保存升级描述目录和文件名
		keyUpdate = "updateCheck", //取消升级键名
		keyAbort = "updateAbort",//忽略版本键名
		checkIntaerval = 0,//升级检查间隔，单位为ms,7天为7*24*60*60*1000=604800000, 如果每次启动需要检查设置值为0
		dir = null;
/**
 * 创建升级目录 
 */
$.initUpdate = function(callback){
 	// 打开doc根目录
	plus.io.requestFileSystem( plus.io.PRIVATE_DOC, function(fs){
		fs.root.getDirectory( localDir, {create:true}, function(entry){
			dir = entry;
			console.log(dir);
			checkUpdate(callback);
		}, function(e){
			console.log( "准备升级操作，打开update目录失败："+e.message );
		});
	},function(e){
		console.log( "准备升级操作，打开doc目录失败："+e.message );
	});
 }

/**
 * 检测程序升级
 * @description 手动检测是否升级  是否已过期标记在手动下无效
 * @param {Function} 
 */
function checkUpdate(callback){
	//判断升级检测是否过期
	var lastcheck  = plus.storage.getItem(keyUpdate);
	if(lastcheck){
		//取消已过期，删除取消标记
		plus.storage.removeItem(keyUpdate);
	}
	//读取本地升级文件
	dir.getFile(localFile,{create:false},function(fentry){
		fentry.file(function(file){
			var reader = new plus.io.FileReader();
			reader.onloadend = function(e){
				//检测升级的时候不删除本地升级文件
				
					fentry.remove();
				var data = null;
				console.log(e.target.result);
				try{
					data = JSON.parse(e.target.result);   
				}catch(e){
					console.log("读取本地升级文件，数据格式错误！");
					return;
				}
				checkUpdateData(data,callback);
			}
			reader.readAsText(file);
		},function(e){
			console.log("读取本地升级文件失败："+e.message);
			fentry.remove();
		});	
	},function(e){
		//文件不存在，在服务器获取升级数据
		getUpdateData();
	})
}

/**
 * 检查升级数据
 * 
 */
function checkUpdateData(j,callback){
	//当前客户端版本号
	var curVer = plus.runtime.version,
	    inf = j[plus.os.name];
	 console.log(curVer);   
	 console.log(inf);
	if(inf){
		var srvVer = inf.version;
		//判断是否需要升级
		var vabort = plus.storage.getItem( keyAbort );
		if ( vabort && srvVer==vabort ) {
			// 忽略此版本
			return;
		}
		if(true){
//		if(compareVersion(curVer,srcVer)){
			if(!callback){
				var mineView = plus.webview.getWebviewById('mine');
				console.log(mineView);
				if(mineView){
					$.fire(mineView,"update",{
						inf:inf
					})
				}
				//提示用户是否升级
				plus.nativeUI.confirm(inf.note,function(i){
					switch(i.index){
						case 0:
						plus.storage.setItem(keyUpdate, (new Date()).getTime().toString());
						break;
						case 1:
						plus.storage.setItem( keyAbort, srvVer );
						plus.storage.setItem(keyUpdate, (new Date()).getTime().toString());
						break;
						case 2:
						plus.runtime.openURL(inf.url);
						break;
						default:
						break;
					}
				},inf.title,["取　　消","跳过此版本","立即更新"]);
			}else{
				callback();
			}	
		}
	}
}
/**
 * 从服务器获取升级数据，并存储到本地
 */
function getUpdateData(){
	var xhr = new plus.net.XMLHttpRequest();
	xhr.onreadystatechange = function(){
		switch ( xhr.readyState ){			    
			case 4:
			    if( xhr.status == 200 ){
			    	var data = xhr.responseText;
			    	console.log(plus.runtime.appid);
					console.log(data);
					if(data.appid == plus.runtime.appid){
//	                if(true){
						//保存到本地文件中
						dir.getFile(localFile,{create:true},function(fentry){
							fentry.createWriter(function(writer) {
			                    writer.onerror = function() {
			                        console.log("获取升级数据，保存文件失败！");
			                    }
			                    writer.write(data);
			                }, function(e) {
			                    console.log("获取升级数据，创建写文件对象失败：" + e.message);
			                });
						},function(e){
							console.log("获取升级数据，打开保存文件失败："+e.message);
						});
					}
			    }else{
			    	console.log("xhr请求失败："+xhr.status);
			    }
			    break;
			default:
			    break;
		}
	}
	xhr.open("GET",checkUrl);
	xhr.send();	
}
/**
 * 比较版本大小，如果新版本nv大于旧版本ov就返回true，否则就返回false
 * @param {String} ov
 * @param {String} nv
 * @return {Boolean}
 */
function compareVersion(ov,nv){
	if(!ov || !nv || ov == "" || nv == ""){
		return false;
	}
	var b = false,
	    ova = ov.split(".",4),
	    nva = nv.split(".",4),
	    j = ova.length,
	    k = nva.length;
//	    console.log("ova:"+ova+"nva:"+nva);
	for(var i =0;i < j && i < k;i += 1){
		var so = ova[i],
		    no = parseInt(so),
		    sn = nva[i],
		    nn = parseInt(sn);
		if(nn > no || sn.length > so.length){
			return true;
		}else if(nn < no){
			return false;
		}
	}
	if(k > j && 0 == nv.indexOf(ov)){
		return true;
	}
}

function plusReady(){
	//获取本地应用资源版本号
	plus.runtime.getProperty(plus.runtime.appid,function(inf){
		wgtVer = inf.version;
		console.log("当前应用版本："+wgtVer);
	});
}
/*
 * 检测更新函数
 */
function checkUpdate(){
	plus.nativeUI.showWaiting("检测更新...");
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		switch(xhr.readyState){
			case 4:
			plus.nativeUI.closeWaiting();
			if(xhr.status==200){
				console.log("检测更新成功："+xhr.responseText);
				var newVer = xhr.responseText;
				if(wgtVer&&newVer&&(wgtVer!=newVer)){
					downWgt(); //下载升级包
				}else{
					plus.nativeUI.console.log("无版本可更新！");
				}
			}else{
				console.log("检测更新失败！");
				plus.nativeUI.toast("检测更新失败，请查看网络连接是否完好！");
			}
			break;
			default:
			break;
		}
	}
	xhr.open('GET',checkUrl);
	xhr.send();
}
/**
 * 下载wgt文件函数
 */
function downWgt(){
	plus.nativeUI.showWaiting("下载wgt文件...");
	plus.downloader.createDownload(wgtUrl,{filename:"_doc/update/"},function(d,status){
		if(status == 200){
			console.log("下载wgt成功："+d.filename);
			installWgt(d.filename); //安装wgt包
		}else{
			console.log("下载wgt失败!");
			plus.nativeUI.toast("下载wgt失败！");
		}
		plus.nativeUI.closeWaiting();
	}).start();
	
}
//更新应用
function installWgt(path){
	plus.nativeUI.showWaiting("安装wgt文件...");
	plus.runtime.install(path,{},function(){
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件成功！");
		plus.nativeUI.console.log("应用资源更新完成!",function(){
			plus.runtime.restart();
		})
	},function(e){
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件失败["+e.code+"]:"+e.message);
		plus.nativeUI.console.log("安装wgt文件失败["+e.code+"]:"+e.message);
	})
}

})(mui);

