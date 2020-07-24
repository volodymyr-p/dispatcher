// This file is equal to edit_simple_table.js, but with few changes in LoadTable function (rework of sorting method)

var config = null;
var page = "/" + $("#pageinfo").attr("page") + "/";
$(document).ready(function () {
  if (page !== '/statements-archive/') {
    LoadData();
  }
});

function LoadData() {
  var from = $("#from").val();
  var to = $("#to").val();

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
          date_from: from,
          date_to: to,
          id_organization: window.storage.id_organization
        },
        success: function (data) {
          LoadTable(data.head, data.body);
          hideSettingElements();
        },
        error: onError
      });

      if (typeof (ready) == "function") {
        ready();
      }
    }
  });
}

function DeleteElement_confirm(ID) {
  if (confirm("Подтвердите удаление")) {
    DeleteElement(ID);
  }
}

var curtable = null;

function LoadTable(columns, dataSet) {
 dataSet.forEach((elem)=>{
    let k = 0;
    elem.push(elem[0].date);
  })

  columns.push({status: "Status"}, {ID:"ID"}, {DATE: "DATE"});

  dataSet.forEach(function (c) {
    c.ID = c[0];

    if (typeof (c[0]) == "object") {
      c.ID = c[0].id;
      c.DATE = c[0].date;
    }
  });

  var responsiveHelper_dt_basic = undefined;

  var breakpointDefinition = {
    tablet: 1024,
    phone: 480
  };

  if (typeof (change_data_before_table) == "function"){
    change_data_before_table(dataSet);
  }
    
  if (curtable) {
    curtable.fnDestroy();
  } 

  curtable = $('#dt_basic').dataTable({
    "scrollX": true,
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
      hideSettingElements();
    },
    data: dataSet,
    columns: columns,
    "language": {
      "url": getLanguage()
    },
    "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      let status = aData[10];
      if (status == 1) {
        $('td', nRow).css('background-color', '#eff0f0');
      } else if (status == 2) {
        $('td', nRow).css('background-color', '#c7fbfb');
      } else if (status == 3) {
        $('td', nRow).css('background-color', '#f9ff9f');
      } else if (status == 4) {
        $('td', nRow).css('background-color', '#ffafaf');
      } else if (status == 5) {
        $('td', nRow).css('background-color', '#beffb2');
      }
    },
    "initComplete": function() {
      handlePageLengthChange();
      handlePageNumberChange();
    },
   'columnDefs': [
      {"orderData": 11, "targets": 0},
      {targets: [9, 10, 11], visible: false},
      { "width": "9%", "targets": 5 }
    ],
    "aaSorting": [{"orderData": 11, "targets": 0}],
    "order": [[ 0, "desc" ]]
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

// this func is used for saving page length (rows per page) after reloading page
function handlePageLengthChange() {
  const t = $('#dt_basic').DataTable();
  // get previous length
  let pageLengthInLocalSt = localStorage.getItem('pageLength');
  // set to default if LS is empty
  if(!pageLengthInLocalSt) {
    pageLengthInLocalSt = 10;
  }

  t.page.len( pageLengthInLocalSt ).draw();

  $("#dt_basic_length").change(() => {
    const pageLength = t.page.len();
    localStorage.setItem('pageLength', pageLength);
});
}

function handlePageNumberChange() {
  const t = $('#dt_basic').DataTable();
  let pageNumberInLocalSt = sessionStorage.getItem('pageNumber');
  // set to default if ІS is empty
  if(!pageNumberInLocalSt) {
    pageNumberInLocalSt = 0;
  }
  t.page(parseInt(pageNumberInLocalSt)).draw('page');

  $("#dt_basic_paginate").click(() => {
    // pages number starts from 0
    const pageNumber = t.page.info().page;
    sessionStorage.setItem('pageNumber', pageNumber);
  });
}

