(function(){
  var toggle=document.querySelector("[data-menu-toggle]");
  var nav=document.querySelector("[data-mobile-nav]");
  if(toggle&&nav){toggle.addEventListener("click",function(){nav.classList.toggle("open")})}
  var filterRoot=document.querySelector("[data-filter-root]");
  if(filterRoot){
    var input=filterRoot.querySelector("[data-filter-input]");
    var region=filterRoot.querySelector("[data-filter-region]");
    var year=filterRoot.querySelector("[data-filter-year]");
    var category=filterRoot.querySelector("[data-filter-category]");
    var cards=[].slice.call(document.querySelectorAll(".movie-card"));
    function same(v,rule){return !rule||v===rule}
    function apply(){
      var q=input?input.value.trim().toLowerCase():"";
      var r=region?region.value:"";
      var y=year?year.value:"";
      var c=category?category.value:"";
      cards.forEach(function(card){
        var text=(card.getAttribute("data-search")||"").toLowerCase();
        var yr=card.getAttribute("data-year")||"";
        var show=(!q||text.indexOf(q)>-1)&&same(card.getAttribute("data-region")||"",r)&&same(yr,y)&&same(card.getAttribute("data-category")||"",c);
        card.classList.toggle("hidden-card",!show);
      });
    }
    [input,region,year,category].forEach(function(el){if(el){el.addEventListener("input",apply);el.addEventListener("change",apply)}})
  }
})();