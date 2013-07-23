/*
 *  This file holds the scripts for the form to build the circles
 */var Spinner=Spinner||{};Spinner.Builder={addCategory:$(".add-category"),goToWheel:$("#go-to-garden"),generateLink:$("#generate-link"),startOver:$("#clear-all"),wheels:$(".wheel-form"),wheelOneCats:$("#wheel-1 .wheel-categories"),wheelTwoCats:$("#wheel-2 .wheel-categories"),wheelOneTitle:$("#wheel-1-title"),wheelTwoTitle:$("#wheel-2-title"),wheelOneCatList:[],wheelTwoCatList:[],init:function(){this.events()},addNewCategoryEntry:function(e){var t=e+1,n=Spinner.Builder.wheels.eq(e).find(".category").length+1,r=$('<div class="category inner">							<input type="text" size="20" class="cat-input wheel-'+t+"-cat-"+n+'">							<input type="button" name="" id="remove-'+t+"-"+n+'" class="remove-category" value="Remove">						</div>');switch(e){case 0:Spinner.Builder.wheelOneCats.append(r);break;case 1:Spinner.Builder.wheelTwoCats.append(r)}r.hide().slideDown()},removeCategory:function(e){var t=this.howManyCategories(e);t>1?$(e).parents(".category").slideUp(function(){$(this).remove()}):alert("You can't delete all your catergories!")},howManyCategories:function(e){return $(e).parents(".wheel-form").find(".category").length},openWheel:function(){},generateLink:function(){},startOver:function(){},events:function(){this.addCategory.on("click",function(){Spinner.Builder.addNewCategoryEntry(Spinner.Builder.addCategory.index(this))});$(".container").on("click",".remove-category",function(){Spinner.Builder.removeCategory(this)});$(document).on("click",".remove-cat",function(e){e.target.parentNode.remove();e.target.classList.contains("outer-remove")?Spinner.Builder.outerCatCount--:e.target.classList.contains("inner-remove")&&Spinner.Builder.innerCatCount--});this.goToWheel.on("click",function(){var e=Spinner.Builder;if(e.innerCatCount<3||e.outerCatCount<3||e.wheelTwoTitle.val().length===0||e.wheelOneTitle.length===0){alert("Please make sure each wheel has at least three categories and a title.");return!1}$(".category.inner").each(function(e,t){t=$(t);var n=t.find("input").val();Spinner.Builder.wheelOneCatList.push(n)});$(".category.outer").each(function(e,t){t=$(t);var n=t.find("input").val();Spinner.Builder.wheelTwoCatList.push(n)});Spinner.Animation.buildSpinners(Spinner.Builder.wheelOneCatList,Spinner.Builder.wheelTwoCatList)})}};Spinner.Animation={buildSpinners:function(e,t){}};Spinner.Builder.init();