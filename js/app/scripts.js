/*
 *  This file holds the scripts for the form to build the circles
 */

var Spinner = Spinner || {};

Spinner.Builder = {
	addCategory : $('.add-category'),
	goToWheel : $('#go-to-garden'),
	generateLink : $('#generate-link'),
	startOver : $('#clear-all'),
	wheels : $('.wheel-form'),

	//should really be using objects rather than this mess, but having to polish over the top of existing functionality
	//should change if get chance in future
	wheelOneCats : $('#wheel-1 .wheel-categories'),
	wheelTwoCats : $('#wheel-2 .wheel-categories'),
	wheelOneTitle : $('#wheel-1-title'),
	wheelTwoTitle : $('#wheel-2-title'),
	wheelOneCatList : [],
	wheelTwoCatList : [],

	innerCatCount : 1,
	outerCatCount : 1,

	errorDisplay : $('#errorMsg'),

	//build up our wheel object
	/*wheel : function () {
		this.title = ;
		this.categories = ;
		this.categoryList = ;
	},*/



	init : function() {
		this.events();
	},

	addNewCategoryEntry : function(wheel) {

		var wheelNum = wheel + 1,
			wheelCategoryLength = Spinner.Builder.wheels.eq(wheel).find('.category').length + 1,
			$markup = $('<div class="category' + (wheel === 0 ? ' inner' : ' outer') + '">\
							<input type="text" size="20" class="cat-input wheel-' + wheelNum + '-cat-' + wheelCategoryLength + '"  placeholder="Category name">\
							<input type="button" name="" id="remove-' + wheelNum + '-' + wheelCategoryLength + '" class="remove-category" value="Remove">\
						</div>');

		switch (wheel) {
			case 0:
				Spinner.Builder.wheelOneCats.append($markup);
				break;
			case 1:
				Spinner.Builder.wheelTwoCats.append($markup);
				break;
		}

		$markup.hide().css('opacity', 0)
			.slideDown()
			.animate(	{ opacity : 1 },
					 	{ queue: false });

		if (wheel === 0) {
			Spinner.Builder.innerCatCount++;
		} else if (wheel === 1) {
			Spinner.Builder.outerCatCount++;
		}

	},

	removeCategory : function(category) {
		var numberOfCats = this.howManyCategories(category);

		//if greater than 1 remove this one
		if (numberOfCats > 1) {
			$(category).parents('.category')
				.slideUp(function () { $(this).remove(); })
				.animate(	{ opacity : 0 },
					 		{ queue: false });
		} else {
			//else don't as can't have zero
			this.displayError("You can't delete all of your categories!");
		}

		if ($(category).hasParent('.outer')) {
			Spinner.Builder.outerCatCount--;
		} else if ($(category).hasParent('.inner')) {
			Spinner.Builder.innerCatCount--;
		}
	},

	howManyCategories : function (category) {
		return $(category).parents('.wheel-form').find('.category').length;
	},


	//checks that the set of categories divides into the other set of categories
	//so if we have 3 in one must have 3,6,12 etc so we have a matching number of answers
	checkCategoryRatio : function (e) {
		e.preventDefault();

		if(Spinner.Builder.innerCatCount % Spinner.Builder.outerCatCount === 0 ||
			Spinner.Builder.outerCatCount % Spinner.Builder.innerCatCount === 0) {

			Spinner.Builder.buildAnimation();

		} else {
			Spinner.Builder.displayError("Both list of categories should be divisible by one another (i.e. one is 3 items and the other 6).");
		}

	},

	displayError : function (msg) {

		this.errorDisplay.text(msg).addClass('isShown');

		//listen for the end of the animaton...
		this.errorDisplay[0].addEventListener('animationend', wheelEventEndListener);
		this.errorDisplay[0].addEventListener('webkitAnimationEnd', wheelEventEndListener);

		function wheelEventEndListener(e) {
			switch (e.animationName) {
				case 'showError':
					Spinner.Builder.errorDisplay.removeClass('isShown');
					break;
			}
		}


	},

	buildAnimation : function() {

		var that = Spinner.Builder;

		if (that.wheelTwoTitle.val().length === 0 || that.wheelOneTitle.length === 0) {
			Spinner.Builder.displayError("Please make sure each wheel has at least three categories and a title.");
			return false;
		}

		that.wheelOneCats.find('.category').each(function(iter, elem) {
			elem = $(elem);
			var val = elem.find('input').val();
			Spinner.Builder.wheelOneCatList.push(val);
			Spinner.Animation.spinnerOneChosenCount.push(1);
		});

		that.wheelTwoCats.find('.category').each(function(iter, elem) {
			elem = $(elem);
			var val = elem.find('input').val();
			Spinner.Builder.wheelTwoCatList.push(val);
			Spinner.Animation.spinnerTwoChosenCount.push(1);
		});

		// fire up the wheel of content!
		Spinner.Animation.buildSpinners(Spinner.Builder.wheelOneCatList, Spinner.Builder.wheelTwoCatList);

	},

	startOver : function() {
		//nothing yet, but could do this as a thing later
	},


	///// EVENT HANDLERS
	events : function() {

		this.addCategory.on('click', function (e) {
			e.preventDefault();
			Spinner.Builder.addNewCategoryEntry(Spinner.Builder.addCategory.index(this));
		});
		$('.container').on('click', '.remove-category', function(e) {
			e.preventDefault();

			Spinner.Builder.removeCategory(this);
		});

		$(document).on('click', '.remove-cat', function(event) {

		});

		this.goToWheel.on('click', this.checkCategoryRatio);
	}
}
Spinner.Animation = {
	spinners : null,

	spinnerOneOptions : ['bag', 'chair', 'table', 'sheep'],
	spinnerTwoOptions : ['kangaroo', 'dust ball', 'loo', 'mouse', 'head', 'nose'],

	//these arrays follow how many times an item can be chosen
	//once it hits zero, that item cannot be chosen again, and is removed from the array
	spinnerOneChosenCount : [],
	spinnerTwoChosenCount : [],

	timeoutLength : 400, //milliseconds
	modifier : -20,
	spinCount : 38,

	wordSpinnerOne : $('#word-spinner-1'),
	wordSpinnerTwo : $('#word-spinner-2'),

	currentWordOne : 0,
	currentWordTwo : 0,

	winners : null,
	fullListOfWinners : [],

	//build the wheels ready to animate
	buildSpinners : function (catgeoryListOne, catgeoryListTwo) {
		Spinner.Animation.spinners = $('.inner-spinner');

		this.spinnerOneOptions = catgeoryListOne;
		this.spinnerTwoOptions = catgeoryListTwo;

		this.workOutRatio();

		$('.wheel-1 h2').html(Spinner.Builder.wheelOneTitle.val());
		$('.wheel-2 h2').html(Spinner.Builder.wheelTwoTitle.val());

		$('#wheel-builder').fadeOut(function () {
			$('.spinners').fadeIn();
		});


		//add words into each text array
		$('#spin').on('click', function (e) {
			e.preventDefault();
			Spinner.Animation.spinWheels();
			Spinner.Animation.animateText();
		});
	},

	workOutRatio : function () {
		var ratio = 0;

		//if one is bigger than the other, work out the ratio
		//once we know the ratio, we set that category list to be counted more than once per item by multiplying the watcher
		if (Spinner.Builder.innerCatCount > Spinner.Builder.outerCatCount) {
			ratio = spinner.Builder.innerCatCount / Spinner.Builder.outerCatCount;
			this.multiplyArray(this.spinnerTwoChosenCount, ratio);
		} else if (Spinner.Builder.innerCatCount < Spinner.Builder.outerCatCount) {
			ratio = Spinner.Builder.outerCatCount / Spinner.Builder.innerCatCount;
			this.multiplyArray(this.spinnerOneChosenCount, ratio);
		}
		//else they are the same so do nothing

		log(this.spinnerOneChosenCount, this.spinnerTwoChosenCount);
	},


	//multiplies all integers in an array by the number specified
	multiplyArray : function (contextArray, amountToMultiply) {
		for (var i = 0; i < contextArray.length; i++) {
			contextArray[i] = contextArray[i] * amountToMultiply;
		}
	},


	spinWheels : function () {

		//add the class to make it start spinning
		Spinner.Animation.spinners.addClass('start-spin');

		//listen for the end of the animaton...
		Spinner.Animation.spinners.eq(0)[0].addEventListener('animationend', wheelEventEndListener);
		Spinner.Animation.spinners.eq(0)[0].addEventListener('webkitAnimationEnd', wheelEventEndListener);

		function wheelEventEndListener(e) {
			switch (e.animationName) {
				case 'spin':
					//spin has ended so do something?
					Spinner.Animation.spinners.removeClass('start-spin');
					break;
			}
		}

	},

	//controls the switching text in the boxes to make it look like it's animating!
	animateText : function () {

		//flip the text with gradual increasing and then decreasing pace
		////animation lasts 15 seconds, so need to start spinning slow and finish slow like the wheels
		this.winners = [this.pickWinner(1), this.pickWinner(2)];

		Spinner.Animation.wordSpinnerOne.add(Spinner.Animation.wordSpinnerTwo).removeClass('is-finished');
		this.fireWordSpinner();
	},

	fireWordSpinner : function () {

		var ctx = Spinner.Animation;

		//put in the next word in each spinner
		ctx.wordSpinnerOne.html(ctx.spinnerOneOptions[ctx.currentWordOne]);
		ctx.currentWordOne++;
		if (ctx.currentWordOne >= ctx.spinnerOneOptions.length) {
			ctx.currentWordOne = 0;
		}
		ctx.wordSpinnerTwo.html(ctx.spinnerTwoOptions[ctx.currentWordTwo]);
		ctx.currentWordTwo++;
		if (ctx.currentWordTwo >= ctx.spinnerTwoOptions.length) {
			ctx.currentWordTwo = 0;
		}

		//log(ctx.timeoutLength, ctx.modifier);
		if (ctx.timeoutLength < 100) {
			//once reach top speedd repeat for a little while
			if (ctx.spinCount === 0) {
				ctx.modifier = 20;
			} else {
				ctx.modifier = 0;
				ctx.spinCount--;
			}
		}
		ctx.timeoutLength = ctx.timeoutLength + ctx.modifier;

		if (ctx.timeoutLength < 400) {
			window.setTimeout(ctx.fireWordSpinner, ctx.timeoutLength);
		} else {
			var winnerOneWord = ctx.spinnerOneOptions[ctx.winners[0]];
				winnerTwoWord = ctx.spinnerTwoOptions[ctx.winners[1]];

			ctx.wordSpinnerOne.html(winnerOneWord);
			ctx.wordSpinnerTwo.html(winnerTwoWord);

			ctx.fullListOfWinners.push([winnerOneWord, winnerTwoWord]);

			//decrement the counter for each winner
			ctx.spinnerOneChosenCount[ctx.winners[0]]--;
			ctx.spinnerTwoChosenCount[ctx.winners[1]]--;

			log(ctx.spinnerOneChosenCount, ctx.spinnerTwoChosenCount);

			//only removes the element from the array once the counter hits zero
			if (ctx.spinnerOneChosenCount[ctx.winners[0]] === 0) {
				ctx.spinnerOneOptions.splice(ctx.winners[0], 1);
				ctx.spinnerOneChosenCount.splice(ctx.winners[0], 1);
			}
			if (ctx.spinnerTwoChosenCount[ctx.winners[1]] === 0) {
				ctx.spinnerTwoOptions.splice(ctx.winners[1], 1);
				ctx.spinnerTwoChosenCount.splice(ctx.winners[1], 1);
			}

			ctx.wordSpinnerOne.add(ctx.wordSpinnerTwo).addClass('is-finished');
			ctx.resetTimings();
		}

	},

	resetTimings : function () {
		Spinner.Animation.timeoutLength = 400;
		Spinner.Animation.modifier = -20;
		Spinner.Animation.spinCount = 38;
	},

	//returns winner based on index in the respective array
	pickWinner : function (wheelNum) {

		if (wheelNum === 1) {
			return this.getRandomInt(0, this.spinnerOneOptions.length - 1);
		} else if (wheelNum === 2) {
			return this.getRandomInt(0, this.spinnerTwoOptions.length - 1);
		}

	},

	getRandomInt : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}



Spinner.Builder.init();