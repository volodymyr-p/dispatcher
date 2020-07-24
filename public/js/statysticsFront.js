var config = null;
var page = "/" + $("#pageinfo").attr("page") + "/";

$(document).ready(function () {
  $('#periodPicker').show();

  $("#to").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    language: getCookie("lang")
  }).
    datetimepicker("setDate", new Date());

  var dtemp = new Date();
  dtemp.setDate(dtemp.getDate() - 7);
  $("#from").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    language: getCookie("lang")
  }).
    datetimepicker("setDate", dtemp);

  LoadData();

  $("#sendDate").on("click", function (e) {
    LoadData();
  });

});

function LoadData() {
  var dateFrom = $("#from").val();
  var dateTo = $("#to").val();
  var idUser = $("#userSelect").val();

  $.ajax({
    type: "GET",
    url: page + "getConfig",
    success: function (data) {
      config = data;
      $.ajax({
        type: "GET",
        url: page + "getTable",
        headers: {
          "Authorization": sessionStorage.getItem('Authorization')
        },
        dataType: 'json',
        contentType: 'application/json',
        data: {
          id_organization: window.storage.id_organization,
          date_from: dateFrom,
          date_to: dateTo,
          id_user: idUser
        },
        success: function (data) {
          LoadTable(data.head, data.body, data.total);
          if ( (page !== '/working-statistics/') && (page !== '/working-time/') && (page !== '/working-statistics-calendar/') ) {
            am4core.ready(function () {

              // Themes begin
              am4core.useTheme(am4themes_animated);
              // Themes end

              // Create chart instance
              var chart = am4core.create("chartdiv", am4charts.PieChart);

              // Add data
              for (var i = 0; i < data.body.length; i++) {
                chart.data.push({
                  "statuses": data.body[i][0],
                  "amount": data.body[i][1]
                });
              }

              // Add and configure Series
              var pieSeries = chart.series.push(new am4charts.PieSeries());
              pieSeries.dataFields.value = "amount";
              pieSeries.dataFields.category = "statuses";
              pieSeries.slices.template.stroke = am4core.color("#fff");
              pieSeries.slices.template.strokeWidth = 2;
              pieSeries.slices.template.strokeOpacity = 1;

              // This creates initial animation
              pieSeries.hiddenState.properties.opacity = 1;
              pieSeries.hiddenState.properties.endAngle = -90;
              pieSeries.hiddenState.properties.startAngle = -90;

            }); // end am4core.ready()
          }

        },
        error: onError
      });
      if (typeof (ready) == "function")
        ready();
    }
  });
}

showTotal = (total) => {
  if (total) {
    if (!$('#total').length)
      $('#dt_basic').find('thead').append(`<tr id="total"></tr>`);
    else
      $('#total').empty();

    for (let value of total) {
      $('#total').append(`<th>${value}</th>`);
    }
  }
}

var curtable = null;
function LoadTable(columns, dataSet, total) {
  //First MUST! be ID
  dataSet.forEach(function (c) {
    c.ID = c[0];
    if (typeof (c[0]) == "object") {
      c.ID = c[0].id;
      c.DATE = c[0].date;
    }
  });

  var responsiveHelper_dt_basic = undefined;
  var responsiveHelper_datatable_fixed_column = undefined;
  var responsiveHelper_datatable_col_reorder = undefined;
  var responsiveHelper_datatable_tabletools = undefined;

  var breakpointDefinition = {
    tablet: 1024,
    phone: 480
  };

  if (typeof (change_data_before_table) == "function")
    change_data_before_table(dataSet);
  if (curtable) curtable.fnDestroy();

  curtable = $('#dt_basic').dataTable({
    "sDom": "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-12 hidden-xs'l>r>" +
      "t" +
      "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
    "autoWidth": true,
    "preDrawCallback": function () {
      // Initialize the responsive datatables helper once.
      if (!responsiveHelper_dt_basic) {
        responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_basic'), breakpointDefinition);
      }
    },
    "rowCallback": function (nRow) {
      responsiveHelper_dt_basic.createExpandIcon(nRow);
    },
    "drawCallback": function (oSettings) {
      responsiveHelper_dt_basic.respond();
    },
    "initComplete": function (settings, json) {
      if (page === '/working-statistics/' || page === '/teams-statistics/') {
        showTotal(total);
      }
      hideSettingElements();
    },
    data: dataSet,
    columns: columns,

    "language": {
      "url": getLanguage()
    }

  });
}

var langMap = {
  'en': 'http://cdn.datatables.net/plug-ins/1.10.7/i18n/English.json',
  'ru': 'http://cdn.datatables.net/plug-ins/1.10.7/i18n/Russian.json',
  'ua': 'http://cdn.datatables.net/plug-ins/1.10.7/i18n/Ukranian.json'
  //etc, the languages you want to support
}

function getLanguage() {
  var lang = navigator.language || navigator.userLanguage;
  let url = langMap[getCookie("lang")];
  return url;
}

function fastChooseInterval(interval) {
    let currentDate = new Date();
    let from = new Date();
    let to = new Date();
    switch (interval) {
        case "hour":
            from = new Date(currentDate.setHours(currentDate.getHours() - 1));
            break;
        case "day":
            from = new Date(currentDate.setHours(currentDate.getHours() - 24));
            break;
        case "week":
            from = new Date(currentDate.setHours(currentDate.getHours() - 168));
            break;
        case "month":
            from = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
            break;
        case "year":
            from = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
            break;
        default:
            break;
    }
    $('#from').datetimepicker('setDate', from);
    $('#to').datetimepicker('setDate', to);
    LoadData();
}