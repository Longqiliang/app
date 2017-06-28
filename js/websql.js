var dbname = 'websql' ;
var version = '1.0';
var dbdesc = 'websql练习' ;
var dbsize = 2*1024*1024 ;
var dataBase = null ;
var websqlTable = "websqlTable"; 

/**
 * 打开数据库
 * @returns dataBase:打开成功  null:打开失败
 * */
function websqlOpenDB(){
	/*打开数据库，没有则创建*/
	dataBase = window.openDatabase(dbname,version,dbdesc,dbsize,function(){
		
	});
	if(dataBase){
		console.log("数据库创建/打开成功!");
	}else{
		console.log("数据库创建/打开失败!");
	}
	return dataBase;
}
/**
 * 新建数据库里面的表单
 * @param {string} tableName:表单名
 */
function websqlCreatTable(tableName){
	var creatTableSQL = 'CREATE TABLE IF NOT EXISTS' + tableName + '(id unique,log)';
    dataBase.transaction(function(){
    	ctx.executeSql(creatTableSQL,[],function(ctx,result){
    		console.log("表创建成功"+tableName);
    	},function(tx,error){
    		console.log('创建表失败：'+tableName +error.message);
    	});
    });
}
/** 
 * 向表里插入数据
 * @param {string} tableName 表单名
 * @param {} param_name
 * */
function insertData (tableName){
	var insertSQL = 'INSERT INTO'+tableName+''
}
