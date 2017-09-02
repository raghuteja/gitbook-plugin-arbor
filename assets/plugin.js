require(["gitbook", "jquery"], function(gitbook, $) {
  gitbook.events.bind("page.change", function() {
    $('code.lang-arbor').each(function(index, element) {
      var $element = $(element),
          code = $element.text();
      var wrapper = $("<canvas id=\"viewport-" + index + "\"></canvas>")
      $element.parent().replaceWith(wrapper);
      arbInit("#viewport-" + index, code);
    });
  });
});
