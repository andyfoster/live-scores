$(function () {
  $(document).on("click", "#follow", function (e) {
    e.preventDefault();
    $("#follow").html("..."); // Add loading indicator while we wait for server

    var user_id = $("#user_id").val();
    $.ajax({
      type: "POST",
      url: "/follow/" + user_id,
      success: function (data) {
        console.log("success (in $.ajax()!");
        $("#follow")
          .removeClass("btn-primary")
          .addClass("btn-default")
          .html("Following")
          .attr("id", "unfollow");
      },
      error: function (data) {
        console.log(data);
        $("#follow").html("Follow"); // Set message back to default
      },
    }); //ajax
  }); //on.click
});
