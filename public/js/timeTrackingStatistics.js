$(document).ready(() => {
  $.ajax({
    type: "GET",
    url: page + "getUsers",
    headers: {
      "Authorization": sessionStorage.getItem('Authorization')
    },
    success: function (data) {
      $('#userSelect').append(new Option(``, ''))
      $.each(data, function (index, e) {
        $('#userSelect').append(new Option(`${e.second_name} ${e.first_name} ${e.middle_name}`, e.id_user))
      });
    },
    error: onError
  });
});