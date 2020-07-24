var config = null;
var page = "/" + $("#pageinfo").attr("page") + "/";
$(document).ready(function () {
  if (page !== '/statements-archive/') {
    LoadData(false);
  }
});

//TODO rewrite
let imagesData;

function LoadData(isArchive, is_sync) {
  //console.log('load fdata')
  const dateFrom = $("#from").val();
  const dateTo = $("#to").val();
  let is_async = true;
  if(is_sync) is_async = false

  $.ajax({
    type: "GET",
    url: page + "getTable",
    headers: {
      "Authorization": sessionStorage.getItem('Authorization')
    },
    async: is_async,
    //dataType: 'json',
    contentType: 'application/json',
    data: {
      date_from: dateFrom,
      date_to: dateTo,
      is_archive: isArchive
    },
    success: function (data) {
      imagesData = data.body;

      //need because LoadTable mutates 'data' variable
      const deepArrClone = JSON.parse(JSON.stringify(data));
      LoadTable(deepArrClone.head, deepArrClone.body, isArchive);
      hideSettingElements();
    },
    error: onError
  });
}

var curtable = null;

// load all tables except main statements page
LoadTable = (columns, data, isArchive) => {
  data.map(c => {
    c.ID = c[0];

    if (typeof (c[0]) == "object") {
      c.ID = c[0].id;
      c.DATE = c[0].date;
    }

    // create column with photos
    if (page == '/counters/') {
      c[6] = createImageContainer(c, isArchive);
    }

    // create buttons for first column
    c[0] = getActionButtons(c);
  });

  var responsiveHelper_dt_basic = undefined;
  var breakpointDefinition = {
    tablet: 1024,
    phone: 480
  };

  if (curtable){
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
    data: data,
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
    'columnDefs': [{
      'max-width': '300px'
    }],
    "autoWidth": false,
    "columnDefs": [{ 
      "width": "10%", 
      "targets": 0
      }]
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

function DeleteElement_confirm(ID) {
  if (confirm("Подтвердите удаление")) {
    DeleteElement(ID);
  }
}

function getActionButtons(c) {
  if (page == '/counters/') {
    return (`  
          <button class="btn btn-xs btn-default hide4Permomer" data-original-title="${dict("delete_row")}"     
          data-toggle="tooltip" 
          data-placement="top" 
          title="${dict("delete_row")}"    
          style='background-color: #d87777;'
          onclick="DeleteElement_confirm('${c.ID}')">
          <i class="fa fa-times"></i>
          </button> 
          `);
  } else {
    return (
        ` <button class="btn btn-xs btn-default" 
            data-original-title="${dict("edit_row")}" 
            data-toggle='modal'
            data-target='#simpletableModal'
            data-toggle="tooltip" 
            data-placement="top" 
            title="${dict("edit_row")}"    
            style='background-color: #739e73;'     
            onclick="EditElement('${c.ID}')">
          <i class="fa fa-pencil"></i>
        </button>

        <button class="btn btn-xs btn-default" data-original-title="${dict("delete_row")}"     
            data-toggle="tooltip" 
            data-placement="top" 
            title="${dict("delete_row")}"    
            style='background-color: #d87777;'
            onclick="DeleteElement_confirm('${c.ID}')">
            <i class="fa fa-times"></i>
        </button> 
        ${page == '/registration-admin/' ?  
          `<button class="hide4Superadmin teamPicker btn btn-xs btn-default" data-original-title="${dict("change_status")}"     
              data-placement="top" 
              title="${dict("change_status")}"
              data-toggle='modal'
              data-target='#changeStatusModal'
              style='background-color: #74a3e6;'
              onclick="current_change_user_ID=${c.ID}; getCurrentTeam(${c.ID});">
            <i class="fa fa-retweet"></i>
          </button>` : ``}` 
    );
  }
}
