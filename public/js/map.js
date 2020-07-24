

//======================Интерфейс===========================
$("#seeUnactive").change(() => {
    LoadUsers();
})

function LoadUsers() {
    const id_organization = sessionStorage.getItem('id_organization');
    $.ajax({
        url: "/location/Users",
        headers: {},
        contentType: "application/json",
        headers: {
          "Authorization": sessionStorage.getItem('Authorization')
        },//потом убрать можно если юзать куки
        type: "GET",
        success: function (data) {
            let seeUnactive = $("#seeUnactive").prop('checked');
            var c = `<ul class="list-group">`;

            data.map(function (el) {
                //поділ по організаціях, SUPERADMIN бачить всіх користувачів, всі бачать користувача у якого немає організації
                if (el.id_organization == id_organization || el.id_organization == null) {
                    //редагувати можуть тільки ADMIN і SUPERADMIN                    
                    if (seeUnactive || el.is_active) {
                        return (
                            c += ` 
                        <li class="list-group-item " onclick="UserChoose('${el.device_id}','${el.custom_name}')" style="${el.is_active ? "" : "background-color:#adaeb3"}" >${el.custom_name}
                              <div style='right: 10px; position: absolute; top: 10px;' class='hide4Operator hide4Permomer'>
                                    <button class="btn btn-xs btn-primary"
                                        data-original-title="${dict("deactivate")}"  
                                        title="${dict("deactivate")}"    
                                        style='background-color: #80a2a8; ${el.is_active ? "" : "display:none"}'
                                        onclick="DeactivateUser_confirm('${el.device_id}', '${el.custom_name}')">
                                        <i class="fa fa-eye-slash"></i>
                                    </button>
                                    <button class="btn btn-xs btn-default" data-original-title="${dict("delete_row")}"      
                                        data-placement="top" 
                                        title="${dict("delete_user")}"    
                                        style='background-color: #d87777;'
                                        onclick="DeleteElement_confirm('${el.device_id}', '${el.custom_name}')">
                                        <i class="fa fa-times"></i>
                                    </button>
                              </div>                              
                        </li>`)
                    }
                }
            })
            c += `</ul>`;
            $("#users").html(c);
            $('.list-group-item').click(function () {
                $('.list-group-item').removeClass("active");
                $(this).addClass('active');
            });

            hideSettingElements();
        },
        error: {}
    });
}


function DeleteElement_confirm(deviceId, customName) {
    let conf = confirm("Подтвердите удаление");
    if (conf) {
        DeleteUser(deviceId, customName);
    }
}

function DeactivateUser_confirm(deviceId, customName) {
    let conf = confirm("Деактивувати користувача?");
    if (conf) {
        Deactivate(deviceId, customName);
    }
}

function Deactivate(deviceId, customName) {
    $.ajax({
        url: "/location/Deactivate",
        headers: {},
        contentType: "application/json",        
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
          },//потом убрать можно если юзать куки
        type: "POST",
        data: JSON.stringify({
            DeviceID: deviceId,
            CustomNname: customName,
        }),
        success: function (data) {
            LoadUsers();
        },
        error: {}
    });
}

function DeleteUser(deviceId, customName) {
    $.ajax({
        url: "/location/DeleteUser",
        headers: {},
        contentType: "application/json",        
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
          },//потом убрать можно если юзать куки
        type: "POST",
        data: JSON.stringify({
            DeviceID: deviceId,
            CustomNname: customName,
        }),
        success: function (data) {
            LoadUsers();
        },
        error: {}
    });
}

//=========================Настройка карты========================
LoadUsers();

var mapmargin = 0;
$('#osmmap').css("height", ($(window).height() - mapmargin));
$(window).on("resize", resize);
resize();
function resize(){

    if($(window).width()>=980){
        $('#osmmap').css("height", ($(window).height() - mapmargin));    
    }else{
        $('#osmmap').css("height", ($(window).height() - (mapmargin+12)));  
    }
}

var element = document.getElementById('osmmap');
map = L.map(element);

map.invalidateSize()
//копірайтс внизу зправа
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//початкові координати

var target = L.latLng('50.584771', '30.504910');
map.setView(target, 14);

var dtemp = new Date();
dtemp.setDate(dtemp.getDate() - 1);

$("#datefrom").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    language: getCookie("lang")
}).
datetimepicker("setDate", dtemp);

$("#dateto").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss',
    language: getCookie("lang")
}).
datetimepicker("setDate", new Date());


//======================Катра, интерфейс===========================
let currenDeviceID_Locations = null;
let currentDeviceID = null;
let currentCustomName = null;

function UserChoose(DeviceID, Name) {
    currentDeviceID = DeviceID;
    currentCustomName = Name;
    $.ajax({
        url: "/location/UserLocation",
        headers: {},
        contentType: "application/json",        
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
          },//потом убрать можно если юзать куки
        type: "POST",
        data: JSON.stringify({
            DeviceID: DeviceID
        }),
        success: function (data) {
            currentCustomName = Name;
            if (data.length == 0)
            {
                alert("Для "+currentCustomName+" не має даних");
                return;
            }
            seePath(data);
            currenDeviceID_Locations = data;
        },
        error: {}
    });
}

function LoadPeriodData() {
    let DeviceID = currentDeviceID;
    let datefrom = $('#datefrom').datetimepicker('getDate');
    let dateto = $('#dateto').datetimepicker('getDate');
    $.ajax({
        url: "/location/UserLocationDated",
        headers: {},
        contentType: "application/json",        
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
          },//потом убрать можно если юзать куки
        type: "POST",
        data: JSON.stringify({
            DeviceID: DeviceID,
            datefrom: datefrom,
            dateto: dateto
        }),
        success: function (data) {
            seePath(data);
            currenDeviceID_Locations = data;
        },
        error: {}
    });
}

//тут это чтоб удалять с карты
var path = null;
var as_points = null;
var marker = null

function ClearMap() {
    if (path != null) {
        map.removeLayer(path);
    }
    if (as_points != null) {
        as_points.map(function (el) {
            map.removeLayer(el);
        })
    }
    if (marker) { // check
        map.removeLayer(marker); // remove
    }
}

let allUserCoords = [];
let allUsers = false;

function seePath(data) {
    ClearMap();

    if ($("#isneedfilter").prop("checked"))
        data = filterCoords(data);

    var latlngs = data.map(function (item) {
        return L.latLng(item.latitude, item.longitude);
    })

    const options = {
        use: L.polyline,
        delay: 6000,
        dashArray: [20, 20],
        weight: 4,
        color: "#0000FF",
        pulseColor: "#FFFFFF"
    };

    if ($("#as_path").prop("checked")) {
        path = L.polyline.antPath(latlngs, options);
        path.addTo(map);
    }
    if ($("#as_points").prop("checked")) {
        as_points = [];
        data.map(function (el) {

            let circle = null;
            if ($("#isseepointspopup").prop("checked")) {
                let divIcon = L.divIcon({
                    html: `<span style='color: black;background-color: white;border-radius: 50px;border: 1px solid black;padding: 2px;'> ${toTime(el.date_create)}</span>`
                })
                circle = L.marker(new L.LatLng(el.latitude, el.longitude), {
                    icon: divIcon
                })
            } else {
                circle = L.circle([el.latitude, el.longitude], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 5
                });
                circle.bindPopup(toTime(el.date_create));
            }

            as_points.push(circle);
        })
        L.layerGroup(as_points).addTo(map);
    }
    if (allUsers == true) {
        allUserCoords.data.push({
            Name: currentCustomName,
            coords:data,
        });
    }
    if (latlngs.length > 0) {
        let el = data[data.length - 1];
        marker = L.marker([el.latitude, el.longitude])
        last_marker_time = localISOTime(el.date_create);
        marker.bindPopup(last_marker_time + `<div id='markeradress'>adress is loading</dev>`);
        marker.addTo(map);
        map.panTo(latlngs[latlngs.length - 1]);
        findMarkerAdress(el.latitude, el.longitude);
    }
}

//фильтр неверных координат, уменьшение количества точек
function filterCoords(data) {
    //первая и последняя точка не должна отфильтровіватся изза того что еще по времени строят
    let first = data[0];
    let last = data[data.length-1];

    //фильтр по точности
    let tData = []
    let accuracyFilter = $("#slider").val();
    data.map(function (el) {
        if (el.accuracy < accuracyFilter) tData.push(el);
    })
    data = tData;

    //фильтр по скорости для средней точки   
    let maxSpeed = $("#maxSpeed").val();
    for (let i = 0; i < data.length - 2; i++) {
        let e1 = data[i];
        let e2 = data[i + 1];
        let e3 = data[i + 2];
        if (getSpeed(e1, e3) < maxSpeed) {
            if (getSpeed(e1, e2) > maxSpeed || getSpeed(e2, e3) > maxSpeed) {
                data.splice(i + 1, 1);
                i--;
            }
        }
    }

    //фильтр по группировке в кучу        
    for (let h = 0; h < 1; h++) { //го 3 итерации
        let pointsinpointDist = $("#pointsinpoint").val();
        let pFrom = 0;
        let pTo = 0;

        for (let i = 0; i < data.length - 1; i++) {
            let e1 = data[pFrom];
            let e2 = data[i + 1];
            var distance = getDistance([e1.latitude, e1.longitude], [e2.latitude, e2.longitude])
            if (distance < pointsinpointDist && i != data.length - 2) {
                pTo = i + 1;
            } else {
                if (i == data.length - 2) pTo++; //чтоб не забыть последнюю точку
                if (pFrom == pTo) {
                    pFrom = i;
                    pTo = i;
                    continue;
                }
                let clat = 0,
                    clon = 0;
                for (let j = pFrom; j <= pTo; j++) {
                    let e = data[j];
                    clat += e.latitude;
                    clon += e.longitude;
                }
                clat = clat / (pTo - pFrom + 1);
                clon = clon / (pTo - pFrom + 1);

                let cP = data[pFrom];
                cP.latitude = clat;
                cP.longitude = clon;
                cP.DateTo = data[pTo].date_create;

                data.splice(pFrom + 1, pTo - pFrom);
                i = pFrom;
                pTo = pFrom;
                if (i > data.length - 3) {
                    let g = 0
                }
                i--;
            }
        }
    }

    //первая и последняя точка не должна отфильтровыватся изза того что еще по времени строят
    if(data[0].id!=first.id) data.unshift(first);
    if(data[data.length-1].id!=last.id) data.push(last);    

    return data;
}

function toTime(dt) {
    let date = new Date(dt);
    let dS = `${date.getHours()}:${(date.getMinutes()<10)?"0"+date.getMinutes():date.getMinutes()}`
    return dS;
}

//get spped in km/h
function getSpeed(a, b) {
    var distance = getDistance([a.latitude, a.longitude], [b.latitude, b.longitude])
    var time1 = new Date(a.date_create);
    var time2 = new Date(b.date_create);
    let diff = (time2 - time1) / 1000; //разница в сек
    let speedMS = distance / diff; // m/ s
    let speed = speedMS * 3.6 //km /hour
    return speed;
}

function getDistance(origin, destination) {
    // return distance in meters
    var lon1 = toRadian(origin[1]),
        lat1 = toRadian(origin[0]),
        lon2 = toRadian(destination[1]),
        lat2 = toRadian(destination[0]);

    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;

    var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS * 1000;
}

function toRadian(degree) {
    return degree * Math.PI / 180;
}

//=====================Загрузка адресов===============
var currenDeviceID_adress = [];
var ajsxs = null;


isStreet = false
progressLoading = [], currentI = 0

function LoadAdress_Streets() {

    isStreet = true
    currenDeviceID_adress = [];
    if (allUsers == true) {
        progressLoading = 
            allUserCoords.data[allUserCoords.iterator].coords;
        currentCustomName = 
            allUserCoords.data[allUserCoords.iterator].Name;
    }
    else {
        progressLoading = filterCoords(currenDeviceID_Locations);
    }
    currentI = 0

    loadNextAdress()
}

let allRoads = []
function loadNextAdress() { 
    if (currentI < progressLoading.length) {
        let el = progressLoading[currentI]
        findStreets(el.latitude, el.longitude)
    }
}

//buildings zoom = 18
function findStreets(Latitude, Longitude) {
    let server = $('input[name=serverChoice]:checked').val();
    let name = currentCustomName;
    if (server == "Nominatim")
    {
     return $.ajax({
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${Latitude}&lon=${Longitude}&zoom=16&accept-language=${getCookie("lang")}`,
        type: 'GET',
        contentType: 'application/json',
        success: function (result) {
            currenDeviceID_adress.push(result);
            NewAdressLoaded();
        },
        error: function (error) {
            if (error.status == 429 & allUsers == true){
               findStreetsError();
            } 
            else{
                alert("Перевищено ліміт запросів з вибраного серверу, будь-ласка виберіть інший сервер");
            }
        }
    });
    }
    else if (server == "LocationIQ")
   {
        var settings = { // Настройки для аякс запроса
            "async": true,
            "crossDomain": true,
            headers: {
                    "accept-language":getCookie("lang"),
                    }, 
            "url": "https://us1.locationiq.com/v1/reverse.php?key=690f2514accd7f&lat="+Latitude+"&lon="+Longitude+"&format=json",
            "method": "GET"
                                }
            if (allUsers == true){
                return setTimeout( () => { 
                    $.ajax(settings).done(function (response) { 
                    currenDeviceID_adress.push(response);
                    NewAdressLoaded();;
                    }).fail((error) => { 
                        if (error.status == 429){
                            findStreetsError(); 
                        } 
                    })
                },2000);// в документации написано что хватает и 1 р\сек, но иногда идет сбой даже на 1500 мс
            }
            else{
                return setTimeout( () => { $.ajax(settings).done(function (response) { 
                currenDeviceID_adress.push(response);
                NewAdressLoaded();;
                })},501); // 0.5 sec задержка, LocationIQ принимает макс 2 запроса в сек, 60 в минуту
            }
    }
}

//buildings zoom = 18
let last_marker_time = "time";
function findMarkerAdress(Latitude, Longitude) {
    return $.ajax({
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${Latitude}&lon=${Longitude}&zoom=18&accept-language=${getCookie("lang")}`,
        type: 'GET',
        contentType: 'application/json',
        success: function (result) {
            marker.bindPopup(last_marker_time + `<div id='markeradress'>${result.display_name}</dev>`);
        },
        error: function (eror) {
            let err = 0;
        }
    });
}

let roads = []

function NewAdressLoaded() {
    let c = "";
    roads = []
    for (let i = 0; i < currenDeviceID_adress.length; i++) {
        let el = currenDeviceID_adress[i];
        if (!el.address.road) continue;

        let isNewAdress = false
        if (roads.length > 0) { //filter
            let last = roads[roads.length - 1];
            if (last.el.place_id != el.place_id && last.el.display_name != el.display_name) { // new road
                isNewAdress = true
            }
        } else {
            isNewAdress = true
        }
        if (i == currenDeviceID_adress.length - 1) isNewAdress = true // последняя точка адреса тоже отображается

        if (isNewAdress) {
            let name = `${el.address.road}, ${el.address.town}`
            roads.push({
                name: name,
                el: el,
                point: progressLoading[i]
            })
        }
    }

    for (let i = 0; i < roads.length; i++) {
        let el = roads[i]
        if (el.point == undefined) ///// TODO иногда el.point бівает undefined
        {
            break;
        }
        let date = localISOTime(el.point.date_create)
        c += `<li>${el.name} - ${date}</li>`
    }
    c += `<button class="btn btn-success" type="button" onclick="Export2Excel()">Экспорт в Excel</button>`
    $("#adressLoaded").html(c);


    currentI++;
    let cc = `${currentI} / ${progressLoading.length}`
    $("#loading_progress").html(cc);
    
    if (!(currentI < progressLoading.length) & allUsers == true)
    {
        let customer = {
            roads: roads,
            customerName: currentCustomName
        }
        allRoads.push(customer)
        allUserCoords.iterator++;
        if (allUserCoords.iterator == allUserCoords.data.length)
        {
            AllUsersExportToExcel();            
        }
        else
            LoadAdress_Streets();
    }
    if (allUserCoords == "failed")
    {
        return;
    }
    loadNextAdress();
}

function findStreetsError() {
    workbook = XLSX.utils.book_new();
    let datefrom = localISOTime($('#datefrom').datetimepicker('getDate'));
    let dateto = localISOTime($('#dateto').datetimepicker('getDate'));
    let title = "";
    let failedCustomerName = currentCustomName;
    for (let i = 0; i< allRoads.length;i++)
    {
        if (failedCustomerName == allRoads[i].customerName) {                                   
            break;
        }
        title += allRoads[i].customerName+" ";
        roads = allRoads[i].roads;
        currentCustomName = allRoads[i].customerName;
        Export2Excel();  
    }
    if (title != ""){
        var wbout = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});                        
        title+= `${datefrom}; ${dateto}`;
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), `${title}.xlsx`);
        alert(`Перевищено ліміт запросів з вибраного серверу, будь-ласка виберіть інший сервер
        Було збережено таких користувачів ${title}`)
    }
    else {
        alert("Перевищено ліміт запросів з вибраного серверу, будь-ласка виберіть інший сервер");                                                              
    }
    allUserCoords = "failed";
    allUsers = false;    
}
function s2ab(s) {
                    
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
function localISOTime(string_date) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(new Date(string_date) - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    return localISOTime;
}
let workbook = [];
function Export2Excel() {
    let name = currentCustomName;    
    let datefrom = localISOTime($('#datefrom').datetimepicker('getDate'));
    let dateto = localISOTime($('#dateto').datetimepicker('getDate'));
    let filename = `${name} (${datefrom}-${dateto})`

    let new_date = null;
    let ws_data0 = []
    ws_data0.push([name,""]);
    for (let i = 0; i < roads.length; i++) {
        let el = roads[i]
        let date = localISOTime(el.point.date_create).slice(0, 10)
        if (date != new_date) {
            new_date = date

            ws_data0.push(["",""])
            ws_data0.push(["",date])
        }
        let time = localISOTime(el.point.date_create).slice(11, 19)
        ws_data0.push([el.name, time])
    }
	var wb = XLSX.utils.book_new();
    wb.Props = {
            Title: "SheetJS Tutorial",
            Subject: "Test",
            Author: "Red Stapler",
            CreatedDate: new Date(2017,12,19)
    };
    
    wb.SheetNames.push("Test Sheet");
    var ws_data = [['hello' , 'world']];

    ws_data = ws_data0;
    
    if (allUsers == true){
        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(workbook, ws, name);
    }
    else{
        wb.Sheets["Test Sheet"] = ws;
        var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
        
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), `${filename}.xlsx`);
    }
}

function AllUsersToExcel() {
    allUsers = true;
    allUserCoords = {
        data: [],
        iterator: 0
    }
    Array.from(document.getElementById('users').firstChild.children).map(function(el)
    {
       el.onclick();
    })
    $(document).one("ajaxStop",function () {
        LoadAdress_Streets();
  });

}

function  AllUsersExportToExcel() {
    workbook = XLSX.utils.book_new();
    let title = '';
    let datefrom = localISOTime($('#datefrom').datetimepicker('getDate'));
    let dateto = localISOTime($('#dateto').datetimepicker('getDate'));
    for (let i = 0; i < allRoads.length; i++) {
        roads = allRoads[i].roads;
        currentCustomName = allRoads[i].customerName;
        title += currentCustomName+" ";
        Export2Excel();        
    }
    var wbout = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});
    title+= `${datefrom}; ${dateto}`
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), `${title}.xlsx`);
    allUsers = false;
}