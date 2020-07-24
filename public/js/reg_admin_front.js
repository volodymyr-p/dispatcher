$(document).ready(function () {
    let role = sessionStorage.getItem('my_role');
    if (role == "SUPERADMIN") {
        $.ajax({
            type: "GET",
            url: page + "getOrganizations",
            headers: {
                "Authorization": sessionStorage.getItem('Authorization')
            },
            success: function (data) {
                $.each(data, function (index, value) {
                    $('#organizations').append('<option value="' + value[0] + '">' + value[1] + '</option>');
                });
            },
            error: onError
        });
    }
    // Only ADMIN can change team
    if (role == "ADMIN") {
        $.ajax({
            type: "GET",
            url: page + "getTeams",
            headers: {
                "Authorization": sessionStorage.getItem('Authorization')
            },
            success: function (data) {
                $('#teamselect').append(new Option());
                $.each(data, function (index, e) {
                    $('#teamselect').append(new Option(e.name, e.id_team))
                });
            },
            error: onError
        });
    }
});

//Deleting a record
function DeleteElement(ID) {
    $.ajax({
        url: page + "Delete",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
        type: "DELETE",
        data: JSON.stringify({
            id: ID
        }),
        success: function () {
            //console.log('Delete' + ID);
        },
        error: onError
    });
}

let id; // Ooops)
let editingLogin; // Double Ooops)

//Editing a record
function EditElement(ID) {
    id = ID;
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
            }
            for (i = 0; i < data.head.length; i++) {
                $(`select[name=${data.head[i].id}]`).val(data.body[i]);
            }
            $("#organizations").val(data.id_organization);
            $("#userRole").val(data.user_role);
            $("#login").val(data.login);

        },
        error: onError
    });
}

function EditElement_withOut_LogPass(ID) {
    $("#showlLogPass").hide();
    $("#simpletableForm").hide();
    $("#mostEditForm").show();

    $('#changePassword').val("");
    $('#changeConfirm_password1').val("");

    id = ID;
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
                $(`input[id=${data.head[i].id}]`).val(data.body[i]);
            }
            $("#changelogin").val(data.login);
        },
        error: onError
    });
}

// Add new user 
$("#AddButton").on("click", function (e) {
    const validationResult = getValidationResultForRegister();
    if(validationResult.every(e => e === true)) {
        let form = $("#simpletableForm");

        $.ajax({
            type: "POST",
            url: page + "Add",
            headers: {
                "Authorization": sessionStorage.getItem('Authorization')
            },
            data: form.serialize(), // serializes the form's elements.
            success: function (data) {
                window.location.reload();
            },
            error: onError
        });
    }
});

// edit existing user
$("#mostEditButton").on("click", function (e) {
    const validationResult = getValidationResultForEditing();

    if(validationResult.every(e => e === true)) {
        if (id) {
            let form = $("#mostEditForm");
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
                    id: id,
                }),
                success: function (data) {
                    window.location.reload();
                },
                error: onError
            });
        }
        else {
            const form = $("#simpletableForm");
            $.ajax({
                type: "POST",
                url: page + "Add",
                headers: {
                    "Authorization": sessionStorage.getItem('Authorization')
                },
                data: form.serialize(), // serializes the form's elements.
                success: function (data) {
                    window.location.reload();
                },
                error: onError
            });
        }
    }
});

$("#savelLogPassButton").on("click", function (e) {
    e.preventDefault();

    const validationResult = getValidationResultForLogPass();
    const form = $("#showlLogPass");
    let result = {};

    if(validationResult.every(e => e === true)) {
        $.each(form.serializeArray(), function () {
            result[this.name] = this.value;
        });

        $.ajax({
            url: page + "ChangeLogPass",
            headers: {
                "Authorization": sessionStorage.getItem('Authorization')
            },
            contentType: "application/json",
            type: "PUT",
            data: JSON.stringify({
                form: result,
                id: id,
            }),
            success: function (data) {
                window.location.reload();
            },
            error: onError
        });
    }
});

function getValidationResultForRegister(){
    const validation = [];
        validation.push(
            $("#first_name")[0].validity.valid,
            $("#second_name")[0].validity.valid,
            $("#middle_name")[0].validity.valid,
            $("#personal_phone")[0].validity.valid,
            $("#buziness_phone")[0].validity.valid,
            $("#e_mail")[0].validity.valid,
            $("#loginField")[0].validity.valid,
            $("#position")[0].validity.valid
        )
    return validation;
}

function getValidationResultForEditing(){
    const validation = [];
        validation.push(
            $("#changeFirst_name")[0].validity.valid,
            $("#changeSecond_name")[0].validity.valid,
            $("#changeMiddle_name")[0].validity.valid,
            $("#changePersonal_phone")[0].validity.valid,
            $("#changeBuziness_phone")[0].validity.valid,
            $("#changeE_mail")[0].validity.valid,
            $("#changePosition")[0].validity.valid
        )
    return validation;
}

function getValidationResultForLogPass(){
    const validation = [];
        validation.push(
            $("#changelogin")[0].validity.valid,
        )
    return validation;
}

getCurrentTeam = (id_user) => {
    $.ajax({
        type: "GET",
        url: page + "getCurrentTeam",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        data: {
            id_user: current_change_user_ID,
        }, // serializes the form's elements.
        success: function (data) {
            $("#teamselect").val(data.id_team);
        },
        error: onError
    });
}

$("#showlLogPassButton").on("click", function (e) {
    e.preventDefault();

    $("#showlLogPass").show();
    $("#mostEditForm").hide();
 
});

$("#addBut").on("click", function (e) {
    $("#mostEditForm").hide();
    $("#simpletableForm").show();
    $("#showlLogPass").hide();

    id = null;

    $("#first_name").val("");
    $("#second_name").val("");
    $("#middle_name").val("");
    $("#loginField").val("");
    $("#password").val("");
    $("#personal_phone").val("");
    $("#buziness_phone").val("");
    $("#e_mail").val("");
    $("#position").val("");
    $("#confirm_password").val("");
});

$("#setTeamButton").on('click', () => {
    let id_team = $("#teamselect").val();
    $.ajax({
        type: "PUT",
        url: page + "ChangeTeam",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        data: {
            id: current_change_user_ID,
            id_team: id_team
        }, // serializes the form's elements.
        success: function (data) {
            $('#changeStatusModal').modal('hide');
            LoadData();
        },
        error: onError
    });
});

$('#password, #confirm_password').on('keyup', function () {
    let lengthcheck = "";
    if ($('#password').val().length < 8) {
        lengthcheck = getMyLang("| too shost", "| слишком короткий", "| занадто короткий");
    }
    let matchcheck = "";
    if (($('#password').val() != $('#confirm_password').val()) || ($('#changePassword').val() != $('#changeConfirm_password1').val())) {
        matchcheck = getMyLang("Not matching ", "Не совпадают ", "Не співпадають ");
    }
    
    if (matchcheck == "" && lengthcheck == "") {
        $("#AddButton").attr('disabled', false);
        $("#savelLogPassButton").attr('disabled', false);

        $('#message, #messageOnChange').html('').css('color', 'green');
    } else {
        $("#AddButton").attr('disabled', true);
        $("#savelLogPassButton").attr('disabled', true);

        $('#message, #messageOnChange').html(matchcheck + lengthcheck).css('color', 'red');
    }
});

$('#changePassword, #changeConfirm_password1').on('keyup', function () {
    let lengthcheck = "";
    if ($('#changePassword').val().length < 8) {
        lengthcheck = getMyLang("| too shost", "| слишком короткий", "| занадто короткий");
    }
    let matchcheck = "";
    if ($('#changePassword').val() != $('#changeConfirm_password1').val()) {
        matchcheck = getMyLang("Not matching ", "Не совпадают ", "Не співпадають ");
    }

    if (matchcheck == "" && lengthcheck == "") {
        $("#savelLogPassButton").attr('disabled', false);

        $('#messageOnChange').html('').css('color', 'green');
    } else {
        $("#savelLogPassButton").attr('disabled', true);

        $('#messageOnChange').html(matchcheck + lengthcheck).css('color', 'red');
    }
});

$('#dt_basic').on( 'page.dt', function () {
    hideSettingElements()
    //не успевает прогрузится, поєтому первый раз не работает
    setTimeout(hideSettingElements, 10);
});