let statuses_ru = [
    "Новая",
    "Отправлена на исполнение",
    "Принята",
    "Отказ",
    "Выполнена",
]

let statuses_ua = [
    "Нова",
    "Відправлена на виконання",
    "Прийнята",
    "Відмова",
    "Зроблена",
]

let statuses_eng = [
    "New",
    "Sended",
    "Received",
    "Denied",
    "Done",
]

$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: page + "getDropDownList",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        success: function (result) {
            $.each(result.varieties, function (index, e) {
                $('#statement_variety').append(new Option(e.variety_name, e.id_statement_variety))
            });

            $('#statement_variety').append(new Option(dict("add_new_entry"), "NEWID"));

            $.each(result.malfunctions, function (index, e) {
                $('#statement_malfunction').append(new Option(e.malfunction_name, e.id_malfunction))
            });
            $('#statement_malfunction').append(new Option(dict("add_new_entry"), "NEWID"));

            $.each(result.teams, function (index, e) {
                $('#teamselect').append(new Option(e.name, e.id_team))
            });
            workWithMap();
        },
        error: onError
    });
});

//making main table and adding buttons 
function change_data_before_table(dataSet) {
    let statuses_use = getMyLang(statuses_eng, statuses_ru, statuses_ua);
    dataSet.forEach(function (c) {
        let date = new Date(c.DATE);
        c[0] = `  
       #${c[9]} <br>     
    
    <button class="btn btn-xs btn-default hide4Superadmin" 
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

    <button class="btn btn-xs btn-default hide4Permomer hide4Superadmin" data-original-title="${dict("delete_row")}"     
    data-toggle="tooltip" 
    data-placement="top" 
    title="${dict("delete_row")}"    
    style='background-color: #d87777;'
    onclick="DeleteElement_confirm('${c.ID}')">
    <i class="fa fa-times"></i>
    </button> 

    <button class="btn btn-xs btn-default hide4Permomer hide4Superadmin" data-original-title="Выбрать бригаду"     
    data-placement="top" 
    title="Выбрать бригаду"
    data-toggle='modal'
    data-target='#setTeamModal'
    style='background-color: #74a3e6;'
    onclick="current_change_statement_ID=${c.ID}">
    <i class="fa fa-exchange"></i>
    </button>

    <button class="btn btn-xs btn-default hide4Permomer hide4Superadmin" data-original-title="${dict("change_status")}"     
    data-placement="top" 
    title="${dict("change_status")}"
    data-toggle='modal'
    data-target='#changeStatusModal'
    style='background-color: #74a3e6;'
    onclick="current_change_statement_ID=${c.ID};set_status_modal_opened();">
    <i class="fa fa-retweet"></i>
    </button>

    <button style="display:none" class="btn btn-xs btn-default" data-original-title="${dict("upload_file")}"     
    data-placement="top" 
    title="${dict("upload_file")}"
    data-toggle='modal'
    data-target='#uploadFilesModal'
    style='background-color: #f3de4c;'
    onclick="uploadFilesModalOnOpen=${c.ID}">
    <i class="fa fa-upload"></i>
    </button>

    <button class="btn btn-xs btn-default" data-original-title="${dict("statement_log_label")}"     
    data-placement="top" 
    title="${dict("statement_log_label")}"
    data-toggle='modal'
    data-target='#statementInfoModal'
    style='background-color: #f3de4c;'
    onclick="statementLogs(${c.ID})">
    <i class="fa fa-info-circle"></i>
    </button>

    ${date.toLocaleString('ru-RU', datetime_options)} 
    `
        c[2] = statuses_use[c[2] - 1];
    });
}
////////////////////////////////////////// STATEMENT VARIETIES /////////////////////////////////////////

function varietyAddingAdd() {
    $.ajax({
        type: "POST",
        url: "/varieties/Add",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        data: {
            variety_name: $("#statement_variety_add_input").val()
        }, // serializes the form's elements.
        success: function (data) {
            $("#statement_variety option[value='NEWID']").remove();
            $('#statement_variety').append(new Option($("#statement_variety_add_input").val(), data.insertId));
            $('#statement_variety').append(new Option(dict("add_new_entry"), "NEWID"));
            $('#statement_variety').val(data.insertId);
            $("#statement_variety_select").show();
            $("#statement_variety_inputs4add").hide();
            $("#statement_variety_add_input").val("");
        },
        error: onError
    });
}

function varietyAddingClose() {
    $("#statement_variety_add_input").val("");
    $("#statement_variety_select").show();
    $("#statement_variety_inputs4add").hide();
}

$("#statement_variety").change(function () {
    let a = $("#statement_variety").val();
    if (a == "NEWID") {
        $("#statement_variety_select").hide();
        $("#statement_variety_inputs4add").show();
        $("#statement_variety_add_input").focus();
    }
});

////////////////////////////////////////// STATEMENT MALFUNCTIONS /////////////////////////////////////////

function malfunctionAddingAdd() {
    $.ajax({
        type: "POST",
        url: "/malfunctions/Add",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        data: {
            malfunction_name: $("#statement_malfunction_add_input").val()
        }, // serializes the form's elements.
        success: function (data) {
            $("#statement_malfunction option[value='NEWID']").remove();
            $('#statement_malfunction').append(new Option($("#statement_malfunction_add_input").val(), data.insertId));
            $('#statement_malfunction').append(new Option(dict("add_new_entry"), "NEWID"));
            $('#statement_malfunction').val(data.insertId);
            $("#statement_malfunction_select").show();
            $("#statement_malfunction_inputs4add").hide();
            $("#statement_malfunction_add_input").val("");
        },
        error: onError
    });
}

function malfunctionAddingClose() {
    $("#statement_malfunction_add_input").val("");
    $("#statement_malfunction_select").show();
    $("#statement_malfunction_inputs4add").hide();
}

$("#statement_malfunction").change(function () {
    let a = $("#statement_malfunction").val();
    if (a == "NEWID") {
        $("#statement_malfunction_select").hide();
        $("#statement_malfunction_inputs4add").show();
        $("#statement_malfunction_add_input").focus();
    }
});

////////////////////////////////////////// STATEMENT LOGS /////////////////////////////////////////

function statementLogs(current_statement_ID) {
    // adding statement logs
    $.ajax({
        url: page + "StatementLogs",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            id_statement: current_statement_ID
        }),
        success: function (data) {
            let infoStr = ``;
            let prev_status = null
            data.forEach((el) => {
                let date = localISOTime_string(el.date_create)
                let operator_name = el.operator_name
                let responsible_user_name = el.perfomer_name || "?"
                let team_name =  el.team_name || "?";
                let refuse_reason =  el.refuse_reason || "";
                infoStr += `&#8595 <br> ${date} `
                if(el.additional_info){
                    infoStr += `Редагування опису оператором <b>${responsible_user_name}</b> <br><code>${el.additional_info}</code><br>`;
                } else if(prev_status==el.id_status){
                    infoStr += `Редагована оператором <b>${responsible_user_name}</b><br>`;
                } else if (el.id_status == 1) {
                    infoStr += `Створена оператором <b>${operator_name}</b><br>`;
                } else if (el.id_status == 2) {
                    if(el.team_name) infoStr += `Відправлена на виконання команді <b>${team_name}</b><br>`;
                        else  infoStr += `Відправлена на виконання оператором <b>${responsible_user_name}</b><br>`;
                } else if (el.id_status == 3) {
                    infoStr += `${dict("accepted_by_team")} <b>${team_name}</b> ${dict("worker")} <b>${responsible_user_name}</b><br>`;
                } else if (el.id_status == 4) {
                    if(el.team_name) infoStr += `Вiдхилена оператором <b>${responsible_user_name}</b> : ${dict("reason")} <i>${refuse_reason}</i><br>`;
                        else infoStr += `Вiдхилена оператором <b>${responsible_user_name}</b> : ${dict("reason")} <i>${refuse_reason}</i><br>`;
                } else if (el.id_status == 5) {
                    if(el.team_name) infoStr += `Виконана командою <b>${team_name}</b><br>`;
                        else infoStr += `Виконана оператором <b>${responsible_user_name}</b><br>`;
                }
                prev_status = el.id_status;
            })
            $('#labelLog').html(infoStr);
        },
        error: onError
    });

    // adding images to logs
    $.ajax({
        url: page + "GetImagesForStatement",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            id_statement: current_statement_ID
        }),
        success: function (data) {
            $('#statementImages > a').remove();
            $('#statementImages > div').remove();

            if(data.length > 0){
                data.forEach((el) => {
                    const image = 
                        `<a 
                            data-dismiss="modal" 
                            data-toggle="modal" 
                            href="#fullScreenImageModal"
                            onclick="showModalImage('${el.file_name}')">
                                <img    
                                    src="uploads/${el.file_name}" 
                                    alt="Photo for statement" 
                                    class="img-fluid img-thumbnail col-md-2">
                        </a>`;
                    $('#statementImages').append(image);
                })
            } else {
                // if there no images for current statement show info about no image
                const noImages = 
                    `<div style="text-align: center;">
                        <h6>${getMyLang('No uploaded images', 'Нету загруженых фото', 'Немає завантажених фото')}</h6> 
                        <i class="fa fa-picture-o fa-4x" aria-hidden="true"></i>
                    </div>`;
                $('#statementImages').append(noImages);
            }
        },
        error: onError
    });
}

// show certain image in large modal (smth like fullscreen)
function showModalImage(imageName) { 
    $('#fullScreenImageDiv > img').remove();

    const fullScreenImage = 
                `<img    
                    src="uploads/${imageName}" 
                    alt="Photo for statement"
                    class="img-fluid img-thumbnail">`

    $('#fullScreenImageDiv').append(fullScreenImage);
}

// opening initial modal with logs when you closed "fullscreen"
$("#fullScreenImageModal").on('hide.bs.modal', function(){
  $("#statementInfoModal").modal("show");
});

////////////////////////////////////////// STATEMENT STATUS /////////////////////////////////////////

function set_status_modal_opened() {
    $.ajax({
        type: "POST",
        url: page + "GetStatusInfoForStatement",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        data: { 
            id_statement: current_change_statement_ID
        },
        success: function (result) {
            // remove previous options list and text area
            $('#textArea').remove();
            $('#status_select').find('option').remove();

            // need to create option list wich depends on current statement status
            $('#status_select').append(new Option("Нова", "NEW", true, true));
            $('#status_select').append(new Option("Відправлена на виконання", "SENDED_4EXEC"));
            $('#status_select').append(new Option("Зроблена", "DONE"));
            $('#status_select').append(new Option("Відмова", "DENIED"));
            $('#status_select').append(new Option("Відправлена на виконання", "SENDED_4EXEC"));
            
            // add text area for refuse reason if user choose DENIED and delete if vice versa
            $("#status_select").change(function () {
                $("#textArea").remove();
                currentStatus = $("#status_select").val();
                
                if(currentStatus === 'DENIED'){
                    const textArea = makeTextAreaElement(result[0].refuse_reason || "");
                    $('#reasonForRefuse').append(textArea);
                } else {
                    $("#textArea").remove();
                }
            });
        },
        error: onError
    });
}

function makeTextAreaElement(text) {
    const textArea = 
         `<div id='textArea'>
            <label for="refuseReason">${getMyLang('Reason fro refusal', 'Причина отказа', 'Причина відмови')}</label>
            <textarea class="form-control" id="refuseReason" rows="3">${text !== 'null' ? text : ''}</textarea>
         </div>`;
    return textArea;
}

function set_status() {
    const status = $("#status_select").val();
    let refuseReason = $("#refuseReason").val();

    if(refuseReason == undefined || refuseReason == '') { refuseReason = null}

    $.ajax({
        url: page + "SetStatus",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            status: status,
            id_statement: current_change_statement_ID,
            refuse_reason: refuseReason
        }),
        success: function () {
            // send notif here 
            $('#changeStatusModal').modal('hide');
            //send_notification_to_device(current_change_statement_ID, id_team);
            LoadData();
        },
        error: onError
    });
    $('#changeStatusModal').modal('hide');
}

////////////////////////////////////////// SOME WORK WITH MAP /////////////////////////////////////////

let theMarker;

function workWithMap() {

    var element = document.getElementById('osm-map');
    element.style = 'height:300px; width:900px;';
    map = L.map(element);

    map.invalidateSize()
    //копірайтс внизу зправа
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    //початкові координати
    var target = L.latLng(' 50.5875', '30.49472');
    map.setView(target, 14);

    $("#fulladress").change(findadress);
    $("#searchButton").on('click', findadress)
    $("#setTeamButton").on('click', set_team)
    $("#setStatusButton").on('click', set_status)

    layerGroup = new L.layerGroup().addTo(map);
    map.on('click', function (e) {
        //fix some bug
        map.invalidateSize();

        $.ajax({
            url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}6&zoom=18`,
            type: 'GET',
            complete: function () { },
            success: function (result) {
                $("#adress_results").html("");
                let city = result.address.city,
                    road = result.address.road,
                    house_number = result.address.house_number;

                let addr = "";
                if (city != undefined) addr += city;
                if (road != undefined) addr += ", " + road;
                if (house_number != undefined) addr += ", " + house_number;
                //if(city==undefined||city==undefined||city==undefined){ addr = result.display_name; }//maybe better
                $('#fulladress').val(addr);
                $("#adresConfirm").html(addr + `(${result.lat},${result.lon})`);
                last_settedAdress = {
                    city: city,
                    street: road,
                    house: house_number
                }
                last_settedCoords = {
                    lat: result.lat,
                    lon: result.lon
                }

                if (theMarker != undefined) {
                    map.removeLayer(theMarker);
                };
                theMarker = L.marker([result.lat, result.lon]).addTo(map);
            },
            error: function (error) {
                alert('Error :(');
            }
        })
    });
}
let inp = $('#formFile_name_record_conversation').val();


let last_settedAdress = null;
let last_settedCoords = null;
$('#okMapButton').click(function () {
    $('#modaldialog').modal('hide');
    //write coords in statement fields
    if (last_settedAdress) {
        //$('#formCityField').val(last_settedAdress.city);
        //$('#formStreetField').val(last_settedAdress.street);
        //$('#formHouseField').val(last_settedAdress.house);
        //Это скорее мешает чем помогает
    }
    if (last_settedCoords) {

        $('#formCoord_longitudeField').val(last_settedCoords.lon);
        $('#formCoord_latitudeField').val(last_settedCoords.lat);
    }
});

function findadress() {
    if (theMarker != undefined) {
        map.removeLayer(theMarker);
    };
    let fulladress = $("#fulladress").val()
    let city = $("#formCityField").val();
    // let dist = $("#formDistrictField").val();
    let street = $("#formStreetField").val();
    let house = $("#formHouseField").val();
    if (street != "" & city != "") street = "," + street;
    if (house != "" & (city != "" || street != "")) house = "," + house;
    fulladress = `${city}${street}${house}`;

    $("#fulladress").val(fulladress);

    getJson();
}

////////////////////////////////////////// SOME WORK WITH MAP AND OTHER/////////////////////////////////////////

function getJson() {
    var address = document.getElementById('fulladress').value;
    $.ajax({
        url: 'https://nominatim.openstreetmap.org/search?',
        data: {
            q: address,
            polygon: 1,
            addressdetails: 1,
            format: 'json'
        },
        type: 'GET',
        complete: function () { },
        success: function (result) {
            current_finded_result = result;
            $("#adress_results").html("");
            result.map(function (e, i) {
                if (e.osm_type == "way")
                    $("#adress_results").append(`<li onclick="seeonmap(${i})" class="list-group-item list-group-item-action">${e.display_name}</li>`);
            });

            $('#adress_results li').click(function () {
                $(this).siblings('li').removeClass('active');
                $(this).addClass('active');
                //записує адресу в рядок
                $("#fulladress").val(this.innerHTML);
            });

        },
        error: function (error) {
            alert('Error :(');
        }
    })
}

var layerGroup = null;
var current_finded_result = null;
var map = null;

function seeonmap(position) {
    var result = current_finded_result[position];

    let city = result.address.city,
        road = result.address.road,
        house_number = result.address.house_number;
    if (!city) city = result.address.town;
    if (!city) city = result.address.village;

    let addr = "";
    if (city != undefined) addr += city;
    if (road != undefined) addr += ", " + road;
    if (house_number != undefined) addr += ", " + house_number;

    $("#adresConfirm").html(addr + `(${result.lat},${result.lon})`);
    last_settedAdress = {
        city: city,
        street: road,
        house: house_number
    }
    last_settedCoords = {
        lat: result.lat,
        lon: result.lon
    }

    layerGroup.clearLayers();
    if (result.lat) {
        var circle = circle_for_result(result);
        layerGroup.addLayer(circle);
    }
    if (result.aBoundingBox) {
        var bounds = [
            [result.aBoundingBox[0] * 1, result.aBoundingBox[2] * 1],
            [result.aBoundingBox[1] * 1, result.aBoundingBox[3] * 1]
        ];
        map.fitBounds(bounds);
        if (result.asgeojson && result.asgeojson.match(/(Polygon)|(Line)/)) {
            var geojson_layer = L.geoJson(
                parse_and_normalize_geojson_string(result.asgeojson), {
                style: function (feature) {
                    return {
                        interactive: false,
                        color: 'blue'
                    };
                }
            }
            );
            layerGroup.addLayer(geojson_layer);
        } else {

        }
    } else {
        var result_coord = L.latLng(result.lat, result.lon);
        if (result_coord) {
            map.panTo(result_coord, 1);
        }
    }
    $('#map').focus();
}

function marker_for_result(result) {
    return L.marker([result.lat, result.lon], {
        riseOnHover: true,
        title: result.name
    });
}

function circle_for_result(result) {
    return theMarker = L.marker([result.lat, result.lon]);
}

/**************************************************** */
$("#sendDate").on("click", function (e) {
    LoadData();
});
function openArchive() {
    $("#archiveBtn").hide();
    $("#addStatementButton").hide();
    
    $("#analyticsLable").show();
    $("#periodPicker").show();
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
}

let datetime_options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
};


function localISOTime_string(string_date) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(new Date(string_date) - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    return localISOTime;
}

isNotNull = (str) =>{
    if (str) 
        return str;
    return '';
}

function set_team() {
    let id_team = $("#teamselect").val();
    $.ajax({
        url: page + "SetTeam",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            id_team: id_team,
            id_statement: current_change_statement_ID
        }),
        success: function () {
            // send notif here 
            $('#setTeamModal').modal('hide');
            send_notification_to_device(current_change_statement_ID, id_team);
            LoadData();
        },
        error: onError
    });
    $('#setTeamModal').modal('hide');
}

function send_notification_to_device(id_statement, id_team) {
    let bodyForNotification = null;
    let deviceTokens = [];

    $.ajax({
        url: page + "getStatementForNotification",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        async: false,
        data: JSON.stringify({
            id_statement: id_statement
        }),
        success: function (data) {
            bodyForNotification = data[0].variety_name + '\n' + data[0].malfunction_name;
        },
        error: onError
    });

    $.ajax({
        url: page + "getDevicesTokens",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        async: false,
        data: JSON.stringify({
            id_team: id_team,
        }),
        success: function (data) {
            data.forEach(el => {
                deviceTokens.push(el.device_token)
            });
        },
        error: onError
    });
    
    if(deviceTokens.length !== 0){
        $.ajax({
            url: "https://fcm.googleapis.com/fcm/send",
            headers: {
                "Authorization": 'key=AIzaSyAYM0QqCD5M0I1D8GMptmTERbEdPg0vCO0'
            },
            contentType: "application/json",
            type: "POST",
            data: JSON.stringify({
                notification: {
                    title: "Нова заявка додана!",
                    body: bodyForNotification,
                    sound: "default",
                    priority: "high",
                },
                registration_ids: deviceTokens
            }),
            success: function () {
            },
            error: onError
        });
    }
}


function fixMap() {
    //clear results before    
    $("#adresConfirm").html("");

    setTimeout(function () {
        //map is global
        map.invalidateSize();
    }, 500);
};

function ClearForm() {
    id = null; //ist not edit
    $("#last_name").val("");
    $("#first_name").val("");
    $("#middle_name").val("");
    $("#formMobile_phoneField").val("");
    $("#statement_variety").val("");
    $("#statement_malfunction").val("");
    $("#formCityField").val("");
    $("#formStreetField").val("");
    $("#formHouseField").val("");
    $("#formFloorField").val("");
    $("#formApartmentField").val("");
    $("#formCoord_latitudeField").val("");
    $("#formCoord_longitudeField").val("");
    $("#formFile_name_record_conversation").val("");
    $("#formAdditional_infoField").val("");
}

function cookie2city() {
    let city = getCookie("def_city");
    if (city) {
        $("#formCityField").val(city);
    }
}

function city2cookie() {
    let city = $("#formCityField").val();
    if (city) {
        setCookie("def_city", city);
    }
}

function needNewVariety() {
    $('#addMalfunctionDialog').modal('show');
}

function needNewMalfunction() {
    let a = 0;
}

function uploadFilesModalOnOpen() {
    let a = 98;
}
