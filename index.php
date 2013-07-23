<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title>Wheel of Content</title>
		<meta name="description" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<!--[if lte IE 8]>
			<link rel="stylesheet" href="css/kickoff-old-ie.css">
		<![endif]-->
		<!--[if gt IE 8]><!-->
			<link rel="stylesheet" href="css/kickoff.css">
		<!--<![endif]-->
	</head>
	<body>
		<p id="errorMsg" class="error">Hello</p>
		<div class="container">
			<form name="wheelGenerator" id="wheel-builder" class="form row">
				<fieldset>
					<nav class="side-nav col span4">
						<h1>Pot Luck</h1>
						<ul class="menu-options">
							<li class="new-garden"><a href="#" id="clear-all">New Garden</a></li>
							<li class="go-to-garden"><a href="#" id="go-to-garden">Go to Garden</a></li>
							<!--<li><a href="#" id="generate-link">Generate link</a></li>-->
						</ul>
					</nav>
					<div id="wheel-1" class="wheel-form col span4">
						<div class="wheel-title">
							<label for="wheel-1-title">Pot One</label>
							<input name="wheel-1-title" type="text" size="20" id="wheel-1-title" placeholder="Title">
						</div>
						<div class="wheel-categories">
							<h2>Hanging Baskets</h2>
							<div class="category inner">
								<input type="text" size="20" class="cat-input wheel-1-cat-1" placeholder="Category name">
								<input type="button" name="" id="remove-1-1" class="remove-category" value="Remove" >
							</div>
						</div>
						<div class="add-new-category">
							<a href="#" id="wheel-1-add-category" class="add-category">+ Add another</a>
						</div>
					</div>

					<div id="wheel-2" class="wheel-form col span4">
						<div class="wheel-title">
							<label for="wheel-2-title">Pot Two</label>
							<input name="wheel-2-title" type="text" size="20" id="wheel-2-title" placeholder="Title">
						</div>
						<div class="wheel-categories">
							<h2>Hanging Baskets</h2>
							<div class="category outer">
								<input type="text" size="20" class="cat-input wheel-2-cat-1" placeholder="Category name">
								<input type="button" name="" id="remove-2-1" class="remove-category" value="Remove">
							</div>
						</div>
						<div class="add-new-category">
							<a href="#" id="wheel-2-add-category" class="add-category">+ Add another</a>
						</div>
					</div>
				</fieldset>
			</form>
			<div class="spinners">
				<div class="btn-spin"><a href="#" id="spin">Spin</a></div>
				<div class="wheel-1">
					<div class="inner-spinner">
						<h2></h2>
					</div>
				</div>
				<div class="wheel-2">
					<div class="inner-spinner">
						<h2></h2>
					</div>
				</div>
				<div class="word-spinner-container">
					<p id="word-spinner-1" class="word-spinner">...</p>
					<p id="word-spinner-2" class="word-spinner">...</p>
				</div>
			</div>
		</div>


		<!-- JavaScript at the bottom for fast page loading -->
		<!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if offline -->
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="/js/libs/jquery.min.js"><\/script>')</script>


		<script src="/js/plugins.js"></script>
		<script src="/js/app/scripts.js"></script>

		<!-- <script>
			$(document).ready(function() {
				(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})(); // add clamp(val, min, max) to Math obj
				(function(){Math.sign=function(x){return x>0?1:x<0?-1:0;}})(); // add sign determination to Math obj
				Template.Main.init();
			});
		</script>
	<script src="./js/app/main.js"></script>-->


	</body>
</html>
