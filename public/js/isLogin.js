$.ajax({
    type: "POST",
    url: "isLogin",
    headers: {
        "Authorization": sessionStorage.getItem('Authorization')
    },
    data: "", // serializes the form's elements.
    success: function (data) {
        if (!data.success) {
            window.location.href = "/logreg";
        }
    }
});

$.ajax({
    type: "POST",
    url: "getUser",
    headers: {
        "Authorization": sessionStorage.getItem('Authorization')
    },
    data: "", // serializes the form's elements.
    success: function (data) {
        var imsrc = "";
        var imalt = "";
        switch (data.role) {
            case "SUPERADMIN":
                imsrc = "img/user/sa.svg";
                imalt = "SUPERADMIN";
                break;

            case "ADMIN":
                imsrc = "img/user/a.svg";
                imalt = "ADMIN";
                break;

            case "OPERATOR":
                imsrc = "img/user/o.svg";
                imalt = "OPERATOR";
                break;

            case "PERFOMER":
                imsrc = "img/user/o.svg";
                imalt = "PERFOMER";
                break;
        }

        $(document).ready(function () {
            hideSettingElements();
            $("#userroleico").attr("src", imsrc);
            $("#userroleico").attr("title", imalt);
            $("#username").text(data.name);
            window.storage = {}; // Ooops)
            window.storage.id_organization = data.id_organization;
            window.storage.myrole = data.role;
            sessionStorage.setItem('id_organization', data.id_organization);
            sessionStorage.setItem('my_role', data.role);
        });
    }
});

function hideSettingElements() {
    $(".hide4Superadmin, .hide4Admin, .hide4Operator, .hide4Permomer").show();

    let myrole = sessionStorage.getItem('my_role');
    switch (myrole) {
        case "SUPERADMIN":
            $(".hide4Superadmin").hide();
            break;

        case "ADMIN":
            $(".hide4Admin").hide();
            break;

        case "OPERATOR":
            $(".hide4Operator").hide();
            break;

        case "PERFOMER":
            $(".hide4Permomer").hide();
            break;
    }
}