
let userInfoForMultiSelect = [];

$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: "vehicles/" + "getVehicles",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        success: function (result) {
            $('#vehicle_select').append(new Option());
            $.each(result, function (index, e) {
                $('#vehicle_select').append(new Option(e.name, e.id_vehicle));
            });           
        },
        error: onError
    });
    
    // selecting all users from current organization
    $.ajax({
        type: "GET",
        url: "organizations/" + "getUsersFromOrganization",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization'),
            'Content-Type': 'application/json'
        },
        success: function (result) {
            userInfoForMultiSelect = result;  
        },
        error: onError
    });
});

function ClearModal() {
    $("#form_name").val("");
    $("#form_notes").val("");
    $("#vehicle_select").val("");
}

//Deleting a record
function DeleteElement(ID) {
    $.ajax({
        url: page + "Delete",
        contentType: "application/json",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        type: "DELETE",
        data: JSON.stringify({
            id: ID
        }),
        success: function () {
            LoadData();
        },
        error: function (jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else if (jqXHR.responseJSON.errno === 1451) {
                msg = getMyLang('This record is in use. You can`t delete it.', 'Эта запись используется. Вы не можете удалить ее.', 'Цей запис використовується. Ви не можете його видалити.');
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            onError(msg);
        },
    });
}

// used to store id team which we are editing 
let currentSelectedTeamId;

$("#addBut").on("click", function (e) {
    $('#teamCrew').hide();
    $('#multiple_selected_users').hide();
    
    currentSelectedTeamId = null;
    ClearModal();
    // // cleaning multiple_selected for making new
    // $('#multiple_selected_users').empty();
    // $('#multiple_selected_users').multiselect('rebuild');

    // $.each(userInfoForMultiSelect, function (index, user) {
    //     const fullName = user.second_name + ' ' + user.first_name + ' ' + user.middle_name;

    //     // user.id_team === null means that user don`t have team yet and we can choose him
    //     if(user.id_team === null){
    //         $('#multiple_selected_users').append(new Option(fullName, user.id_user));
    //         $('#multiple_selected_users').multiselect('rebuild');
    //     }
    // }); 
});


let innitiallySelectedUsers = [];

//Editing a record
function EditElement(ID) {
    $('#teamCrew').show();

    ClearModal();
    if (typeof ClearForm === "function") ClearForm();
    currentSelectedTeamId = ID;
    $.ajax({
        url: page + "FillChangeForm",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify({
            id: ID
        }),
        success: function (data) {
            for (i = 0; i < data.head.length; i++) {
                $(`input[name=${data.head[i].id}]`).val(data.body[i]);
                $(`select[name=${data.head[i].id}]`).val(data.body[i]);
            }
        },
        error: onError
    });
    // cleaning multiple_selected for making new, with cheked users
    $('#multiple_selected_users').empty();
    $('#multiple_selected_users').multiselect('rebuild');
    
    $.each(userInfoForMultiSelect, function (index, user) {
        const fullName = user.second_name + ' ' + user.first_name + ' ' + user.middle_name;

        // making selected option
        if( user.id_team == currentSelectedTeamId ) {
            $('#multiple_selected_users').append(new Option(fullName, user.id_user, true, true));
            innitiallySelectedUsers.push(user.id_user);
        // user.id_team === null means that user don`t have team yet and we can choose him
        } else if(user.id_team === null) { 
            $('#multiple_selected_users').append(new Option(fullName, user.id_user));
        // TODO: if we don`t have free users need to inform about it
        }
        $('#multiple_selected_users').multiselect('rebuild');
    }); 
}

function getDeSelectedUsers(A,B) {
    var M = A.length, N = B.length, c = 0, C = [];
    for (var i = 0; i < M; i++)
     { var j = 0, k = 0;
       while (B[j] !== A[ i ] && j < N) j++;
       while (C[k] !== A[ i ] && k < c) k++;
       if (j == N && k == c) C[c++] = A[ i ];
     }
   return C;
}


$("#AddButton").on("click", function (e) {
    const validation = [];
    validation.push($("#form_name")[0].validity.valid, $("#form_notes")[0].validity.valid);

    let finallySelectedUsers = [];
    let deSelectedUsers = [];

    if(validation.every(e => e === true)) {
        // next if block uses for finding selected and deselected users in dropdown list 
        if($('#multiple_selected_users').val() !== null) {
                finallySelectedUsers = $('#multiple_selected_users').val().map(Number);    
                deSelectedUsers = getDeSelectedUsers(innitiallySelectedUsers, finallySelectedUsers);
        } else {
                deSelectedUsers = innitiallySelectedUsers;
        }

        if (currentSelectedTeamId) {
            e.preventDefault();

            let form = $("#simpletableForm");
            let result = {};

            $.each(form.serializeArray(), function () {
                result[this.name] = this.value;
            });

            $.ajax({
                url: page + "Change",
                headers: {
                    "Authorization": sessionStorage.getItem('Authorization')
                },
                contentType: "application/json",
                type: "PUT",
                data: JSON.stringify({
                    form: result,
                    selected_users: finallySelectedUsers,
                    deSelectedUsers: deSelectedUsers,
                    id: currentSelectedTeamId
                }),
                success: function () {
                    $('#simpletableModal').modal('hide');
                    //LoadData();
                    window.location.reload();
                },
                error: onError
            });
        } else {
            readyModal();
        }
    }
    
    if (typeof (city2cookie) == "function")
        city2cookie();
})

//Validation and Adding
function readyModal() {
    const form = $("#simpletableForm");
    //const finallySelectedUsers = $('#multiple_selected_users').val();
    let result = {};
    let idOrgInput = $("#id_org");

    idOrgInput.val(window.storage.id_organization);

    $.each(form.serializeArray(), function () {
        result[this.name] = this.value;
    });
    
    $.ajax({
        type: "PUT",
        url: page + "Add",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        data: JSON.stringify({
                form: result
                //selected_users: finallySelectedUsers
            }), 
        success: function (data) {
            $('#simpletableModal').modal('hide');
            LoadData();
        },
        error: onError
    });
}