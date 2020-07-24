function ClearModal() {
    $("#organization_name").val("");
    $("#description").val("");


    $("#first_name").val("");
    $("#second_name").val("");
    $("#middle_name").val("");
    $("#login").val("");

    $("#form_name").val("");
    $("#form_notes").val("");

    $("#vehicle_select").val("");
    
    $("#formMalfunctionNameField").val("");
    $("#formStatusNameField").val("");
}

//override this
function AddElement(ID) {
    //modal is open
    ClearModal();
    alert("AddElement " + ID);
}

//Deleting a record
function DeleteElement(ID) {
    $.ajax({
        url: page + "Delete",
        contentType: "application/json",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        contentType: "application/json",
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

let id; // Ooops)
$("#addBut").on("click", function (e) {
    id = null;
    ClearModal();
});

//Editing a record
function EditElement(ID) {
    ClearModal();

    if (typeof ClearForm === "function") {
        ClearForm();
    }

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

                $(`textarea[name=${data.head[i].id}]`).val(data.body[i]);

                $(`select[name=${data.head[i].id}]`).val(data.body[i]);
            }
            $("#formAdditional_infoField").val(data.additional_info);
            $("#statement_variety").val(data.id_statement_variety);
            $("#statement_malfunction").val(data.id_malfunction);
        },
        error: onError
    });
}

// // TODO: add title to edit statement modal
// $("#simpletableModal").on('show.bs.modal', function () {
//     const addStatement = getMyLang('Add statement', 'Добавить заявление', 'Додати заяву');
//     $('#simpletableLabel').text(addStatement)
// })


$("#AddButton").on("click", function (e) {
    const validationResult = getValidationResult();

    if(validationResult.every(e => e === true)) {
        if (id) {
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
                    id: id
                }),
                success: function () {
                    $('#simpletableModal').modal('hide');
                    LoadData();
                },
                error: onError
            });
            //window.location.reload();
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
    let idOrgInput = $("#id_org");
    idOrgInput.val(window.storage.id_organization);
    $.ajax({
        type: "POST",
        url: page + "Add",
        headers: {
            "Authorization": sessionStorage.getItem('Authorization')
        },
        data: form.serialize(), // serializes the form's elements.
        success: function (data) {
            $('#simpletableModal').modal('hide');
            LoadData();
        },
        error: onError
    });
}

function getValidationResult(){
    const validation = [];
    
    if(page === '/statements/'){
        validation.push(
            $("#first_name")[0].validity.valid,
        )
    } 
    if(page === '/malfunctions/') {
        validation.push(
            $("#formMalfunctionNameField")[0].validity.valid)
    }
    if(page === '/organization/') {
        validation.push(
            $("#organization_name")[0].validity.valid,
            $("#description")[0].validity.valid)
    }
    if(page === '/varieties/') {
        validation.push(
            $("#formStatusNameField")[0].validity.valid)
    }
    if(page === '/vehicles/') {
        validation.push(
            $("#form_name")[0].validity.valid,
            $("#form_notes")[0].validity.valid)
    }
    if(page === '/types/') {
        validation.push(
            $("#formStatusNameField2")[0].validity.valid)
    }
    
    return validation;
}
