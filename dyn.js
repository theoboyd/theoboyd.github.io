$().ready(function() {
   $.getJSON( "/dyndata.json", function( data ) {
    $("#content_dyn").html(data["text"]);
  });
});
