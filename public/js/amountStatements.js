var config = null;
var page = "/" + $("#pageinfo").attr("page") + "/";

$(document).ready(function () {
    $("#to").datetimepicker({
        format: 'yyyy-mm-dd hh:ii:ss',
        language: getCookie("lang")
    }).datetimepicker("setDate", new Date());

    var dtemp = new Date();
    dtemp.setDate(dtemp.getDate() - 7);
    $("#from").datetimepicker({
        format: 'yyyy-mm-dd hh:ii:ss',
        language: getCookie("lang")
    }).datetimepicker("setDate", dtemp);

    LoadData();
});

$("#sendDate").on("click", function (e) {
    LoadData();
});

function LoadData() {
    var dateFrom = $("#from").val();
    var dateTo = $("#to").val();

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
                    date_to: dateTo
                },
                success: function (data) {
                    LoadTable(data.head, data.body);

                    am4core.ready(function () {
                        // Themes begin
                        am4core.useTheme(am4themes_animated);
                        // Themes end

                        var chart = am4core.create("chartdiv", am4charts.XYChart);

                        var dataGraph = [];
                        var value = 0;
                        for (let i = 0; i < data.body.length; i++) {
                            let date = new Date(data.body[i][1]);
                            value = data.body[i][0];
                            dataGraph.push({
                                date: date,
                                value: value
                            });
                        }
                        chart.data = dataGraph;
                        chart.language.locale = getMyLang(am4lang_en_US, am4lang_ru_RU, am4lang_ru_RU);

                        // Create axes
                        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
                        dateAxis.renderer.minGridDistance = 60;

                        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

                        // Create series
                        var series = chart.series.push(new am4charts.LineSeries());
                        series.dataFields.valueY = "value";
                        series.dataFields.dateX = "date";
                        series.tooltipText = "{value}"

                        series.tooltip.pointerOrientation = "vertical";

                        // Make bullets grow on hover
                        var bullet = series.bullets.push(new am4charts.CircleBullet());
                        bullet.circle.strokeWidth = 2;
                        bullet.circle.radius = 4;
                        bullet.circle.fill = am4core.color("#fff");

                        var bullethover = bullet.states.create("hover");
                        bullethover.properties.scale = 1.3;

                        chart.cursor = new am4charts.XYCursor();
                        chart.cursor.snapToSeries = series;
                        chart.cursor.xAxis = dateAxis;

                        //chart.scrollbarY = new am4core.Scrollbar();
                        chart.scrollbarX = new am4core.Scrollbar();

                    }); // end am4core.ready()
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