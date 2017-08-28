require(["gitbook", "jquery"], function(gitbook, $) {
  gitbook.events.bind("page.change", function() {
    $('code.lang-arbor').each(function(index, element) {
      var $element = $(element),
          code = $element.text();
      var wrapper = $("<div id='canvas"+index+"'>" + code + "</div>");
      $element.parent().replaceWith(wrapper);
    });
  });
});
