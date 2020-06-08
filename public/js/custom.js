$(function () {
  var socket = io();

  $("#sendTweet").submit(function () {
    let content = $("#tweet").val();
    socket.emit("tweet", { content: content });
    $("#tweet").val("");
    return false;
  });

  socket.on("incomingTweets", function (data) {
    console.log(data);
    var html = "";
    html += '<div class="media">';
    html += '<div class="media-left">';
    html +=
      '<a href="/user/' +
      data.user._id +
      '"><img src="' +
      data.user.photo +
      '" alt="" class="media-object"></a>';
    html += "</div>";
    html += '<div class="media-body">';
    html += '<h4 class="media-heading">' + data.user.name + "</h4>";
    html += "<p>" + data.data.content + "</p>";
    html += "</div></div>";

    $("#tweetList").prepend(html);
  });
});
