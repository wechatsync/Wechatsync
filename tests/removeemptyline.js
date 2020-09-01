doc = $("div");
doc.find("p").each(function(idx, el) {
  var $obj = $(this);
  var originalText = $obj.text();
  if (originalText == "") {
    $obj.remove();
  }
  // try to replace as h2;
  var strongTag = $obj.find("strong").eq(0);
  var childStrongText = strongTag.text();
  if (originalText == childStrongText) {
    var strongSize = null;
    var tagStart = strongTag;
    var align = null;
    for (let index = 0; index < 4; index++) {
      var fontSize = tagStart.css("font-size");
      var textAlign = tagStart.css("text-align");
      if (fontSize) {
        strongSize = fontSize;
      }
      if (textAlign) {
        align = textAlign;
      }
      if (align && strongSize) break;
      console.log("fontSize", fontSize);
      console.log("textAlign", textAlign);
      if (tagStart == $obj) {
        console.log("near top");
        break;
      }
      tagStart = tagStart.parent();
    }

    if (strongSize) {
      var theFontSize = parseInt(strongSize);
      if (theFontSize > 17 && align == "center") {
        var newTag = $("<h2></h2>").append($obj.html());
        $obj.after(newTag).remove();
      }
    }
  }
});

doc = $("div");

var processBr = function(idx, el) {
  var $obj = $(this);
  if (!$obj.next().length) {
    $obj.remove();
  }
};
doc.find("br").each(processBr);
