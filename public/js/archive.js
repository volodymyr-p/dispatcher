$(document).ready(function () {
  const dtemp = new Date();
  dtemp.setDate(dtemp.getDate() - 7);

  $("#to").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    language: getCookie("lang")
  }).datetimepicker("setDate", dtemp);

  dtemp.setDate(dtemp.getDate() - 21);
  $("#from").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    language: getCookie("lang")
  }).datetimepicker("setDate", dtemp);

  LoadData();
});

$("#sendDate").on("click", function (e) {
  LoadData();
});