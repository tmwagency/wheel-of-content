/*jslint white: true, browser: true, devel: true, debug: true *//*jshint browser:true, camelcase: true, curly:true, forin:true, indent:4, latedef: true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, maxerr:50, white:false, smarttabs:false, quotmark: single, trailing: true, debug: true, laxcomma: true *//* PLUGIN DIRECTORY
What you can find in this file [listed in order they appear]
Please keep me up-to-date :)

	1.) Lightweight console.log wrapper function log()
	2.) Safe log - Makes it safe to leave log's in production code
	3.) ...

*/// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log=function e(){log.history=log.history||[];log.history.push(arguments);if(this.console){var t=arguments,n;try{t.callee=e.caller}catch(r){}n=[].slice.call(t);typeof console.log=="object"?log.apply.call(console.log,console,n):console.log.apply(console,n)}};(function(e){function t(){}for(var n="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),r;!!(r=n.pop());)e[r]=e[r]||t})(function(){try{console.log();return window.console}catch(e){return window.console={}}}());jQuery.extend(jQuery.fn,{hasParent:function(e){return this.filter(function(){return $(e).find(this).length})}});