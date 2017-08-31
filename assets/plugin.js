require(["gitbook", "jquery"], function(gitbook, $) {
  gitbook.events.bind("page.change", function() {
    $('code.lang-arbor').each(function(index, element) {
      var $element = $(element),
          code = $element.text();
      var wrapper = $("<canvas id=\"viewport\"></canvas>")
      $element.parent().replaceWith(wrapper);
      arbInit("#viewport", code);
    });
  });
});
