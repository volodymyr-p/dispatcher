runAllForms();
$(function () {
    // Validation
    $("#login-form").validate({
        // Rules for form validation
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 3,
                maxlength: 20
            }
        },
        // Messages for form validation
        messages: {
            email: {
                required: 'Please enter your email address',
                email: 'Please enter a VALID email address'
            },
            password: {
                required: 'Please enter your password'
            }
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
});

function signIn() {
    $.ajax({
        type: "POST",
        url: "/logreg/login",
        data: $("#login-form").serialize(), // serializes the form's elements.
        success: function (data) {
            sessionStorage.setItem('Authorization', `Bearer ${data}`);
            $.ajaxSetup( {'Authorization': `Bearer ${data}`} );          
            setCookie("authorization", data)
            window.location.href = "/";
        },
        error: function (data) {
            $.smallBox({
                title: "Error",
                content: `<i class='fa fa-clock-o'></i> <i>${data.responseText}</i>`,
                color: "#C46A69",
                iconSmall: "fa fa-times fa-2x fadeInRight animated",
                timeout: 3000
            });
        }
    });
}

document.addEventListener('keydown', function(event) {
  if(event.key === 'Enter'){
      signIn()
  }
});