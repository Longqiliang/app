var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith'); //合成雪碧图
var imagemin = require('gulp-imagemin'); //图片压缩
var uglify =require('gulp-uglify'); 
var cleanCss = require('gulp-clean-css');
var concat =require('gulp-concat');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
//路径配置变量
var cssSrc ='./css/*.css',
    cssDest ='./dest/css',
    jsSrc = './js/*.js', 
    jsDest = './dest/js',
    imgSrc ='./img/*.png',
    imgDest = './dest/img',
    htmlSrc ='./html/*.html',
    viewJsSrc = './js/createView.js',
    htmlDest = './dest/html';


gulp.task('css-min',function(){
	return gulp.src(cssSrc)
	           .pipe(cleanCss())
	           .pipe(rename({suffix:'.min'}))
	           .pipe(gulp.dest(cssDest));
})
gulp.task('js-min',function(){
	return gulp.src(viewJsSrc)
	           .pipe(uglify())
	           .pipe(rename({suffix:'.min'}))
	           .pipe(gulp.dest(jsDest));
})
gulp.task('image-min',function(){
	return gulp.src('./*.png')
	           .pipe(imagemin({
	           	progressive:true
	           }))
	           .pipe(gulp.dest('./img'))
})
gulp.task('sprite-smith',function(){
	return gulp.src(imgSrc)
	           .pipe(spritesmith({
	           	  imgName:'sprite.png',
	           	  cssName: './css/sprite.css',
	           	  padding:5,
	           	  algorithm:'binary-tree',
	           	  cssTemplate:function(data) {
	           	  	var arr =[];
	           	  	data.sprites.forEach(function(sprite){
	           	  		arr.push('.icon-'+sprite.name+
	           	  		"{" +
                    "background-image: url('"+sprite.escaped_image+"');"+
                    "background-position: "+sprite.px.offset_x+"px "+sprite.px.offset_y+"px;"+
                    "width:"+sprite.px.width+";"+
                    "height:"+sprite.px.height+";"+
                    "}\n");
	           	  	});
	           	  	return arr.join("");
	           	  }
	           }))
	           .pipe(gulp.dest('./dest/'));
})
gulp.task('min',['css-min','js-min']);