var config = null;
var page = "/" + $("#pageinfo").attr("page") + "/";

$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: page + "getUsers",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        success: function (data) {
            $('#userSelect').append(new Option());
            $.each(data, function (index, e) {
                $('#userSelect').append(new Option(`${e.second_name} ${e.first_name} ${e.middle_name}`, e.id_user))
            });
        },
        error: onError
    });
    // $("#to").datetimepicker({
    //     format: 'yyyy-mm-dd hh:ii:ss',
    //     language: getCookie("lang")
    // }).
    //     datetimepicker("setDate", new Date());

    // var dtemp = new Date();
    // dtemp.setDate(dtemp.getDate() - 7);
    // $("#from").datetimepicker({
    //     format: 'yyyy-mm-dd hh:ii:ss',
    //     language: getCookie("lang")
    // }).
    //     datetimepicker("setDate", dtemp);
    LoadData();
    $("#userSelect").change(() => {
        $(`.work_time`).empty();
        LoadData();
    });
});

function LoadData() {
    // var dateFrom = $("#from").val();
    // var dateTo = $("#to").val();
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
                    id_user: idUser
                },
                success: function (data) {
                    LoadTable(data.head, data.body);
                },
                error: onError
            });
            if (typeof (ready) == "function")
                ready();
        }
    });
}

var curtable = null;

function LoadTable(columns, dataSet) {
    for (let i = 0; i < dataSet.length; i++) {
        //console.log(dataSet[i][0]);
        $(`.calendar-day-${dataSet[i][1]}`).append(`<div class="work_time" style="color:red; text-align:center;">${dataSet[i][2]}</div>`);
    }
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