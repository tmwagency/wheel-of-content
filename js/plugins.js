/*jslint white: true, browser: true, devel: true, debug: true */
/*jshint browser:true, camelcase: true, curly:true, forin:true, indent:4, latedef: true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, maxerr:50, white:false, smarttabs:false, quotmark: single, trailing: true, debug: true, laxcomma: true */

/* PLUGIN DIRECTORY
What you can find in this file [listed in order they appear]
Please keep me up-to-date :)

	1.) Lightweight console.log wrapper function log()
	2.) Safe log - Makes it safe to leave log's in production code
	3.) ...

*/

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f() {
		log.history = log.history || [];
		log.history.push(arguments);
		if (this.console) {
				var args = arguments,
						newarr;
				try {
						args.callee = f.caller;
				} catch (e) {}
				newarr = [].slice.call(args);
				if (typeof console.log === 'object')  {
					log.apply.call(console.log, console, newarr);
				} else {
					console.log.apply(console, newarr);
				}
		}
};

// make it safe to use console.log always
(function (a) {
		function b() {}
		for (var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), d; !! (d = c.pop());) {
				a[d] = a[d] || b;
		}
})
(function () {
		try {
				console.log();
				return window.console;
		} catch (a) {
				return (window.console = {});
		}
}());

jQuery.extend( jQuery.fn, {
    // Name of our method & one argument (the parent selector)
    hasParent: function( p ) {
        // Returns a subset of items using jQuery.filter
        return this.filter(function () {
            // Return truthy/falsey based on presence in parent
            return $(p).find(this).length;
        });
    }
});

// place any jQuery/helper plugins in here, instead of separate, slower script files.
// if conflicts wrap in the below
// (function($) {
//
// })(jQuery);
