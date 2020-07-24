function getCookie(name) {
    let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value) {
    // Build the expiration date string:
    var expirationDate = new Date();
    var cookieString = '';
    expirationDate.setFullYear(expirationDate.getFullYear() + 5);
    // Build the set-cookie string:
    cookieString = name + "=" + value + "; expires=" + expirationDate.toUTCString();
    // Create or update the cookie:
    document.cookie = cookieString;
}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

let lang = getCookie("lang");
if (!lang) {
    setCookie("lang", "en");
    document.location.reload(true);
}

// $('.bot2-Msg1').click(() => {
//     sessionStorage.clear();
// })

function loadLocale() {
    if (!sessionStorage.getItem('locale')) {
        $.ajax({
            type: "POST",
            url: "/getlocale",
            data: "", // serializes the form's elements.
            success: function (data) {
                if (data.success) {
                    sessionStorage.setItem('locale', JSON.stringify(data.message));
                    document.location.reload(true);
                }
            }
        });
    }
}
loadLocale();

function getLang() {
    if (lang) return lang;

    let la = getCookie("lang");
    if (!la) {
        document.location.reload(true);
    } else {
        return la;
    }
}

//returned in needed language
function getMyLang(English, Russian, Ukrainian) {
    switch (lang) {
        case "ru":
            return Russian;
        case "ua":
            return Ukrainian;
        case "en":
            return English;
    }
}


let locale = null;

function L(key) {
    if (!locale) {
        locale = JSON.parse(sessionStorage.getItem('locale'));
    }
    return locale[key];
}

console.log(L("title"));

$(document).ready(function () {
    pageSetUp();//from template    
    switch (lang) {
        case "ru":
            $("#langImg").addClass("flag-ru");
            $("#langImg").attr("alt", "Russia");
            $("#langSpan").text(" Русский ");
            break;
        case "ua":
            $("#langImg").addClass("flag-ua");
            $("#langImg").attr("alt", "Ukraine");
            $("#langSpan").text(" Українська ");
            break;
        case "en":
            $("#langImg").addClass("flag-us");
            $("#langImg").attr("alt", "United States");
            $("#langSpan").text(" English (US) ");
            break;
    }
});

function SetLang(newlang) {
    lang = newlang;
    setCookie("lang", lang)
    sessionStorage.removeItem('locale');
    loadLocale();
}

function onError(error) {
    let err = error.message || error.responseText;
    $.smallBox({
        title: getMyLang('Error!', 'Ошибка!', 'Помилка!'),
        content: `<i class='fa fa-clock-o'></i> <i>${err ? err : error}</i>`,
        color: "#C46A69",
        iconSmall: "fa fa-times fa-2x fadeInRight animated",
        timeout: 3000
    });
}

function dict(key) {
    return dictionary[lang][key];
}

let dictionary = {
    en: {
        "add_new_entry": "Add new entry"
        , "deactivate": "Deactivate user"
        , "delete_user": "Delete user"
        , "change_status": "Change status"
        , "upload_file": "Upload file"
        , "delete_row": "Delete row"
        , "edit_row": "Edit row"
        , "change_team": "Change team"

        , "create_statement_by_operator": "Creation of a statement by an operator:"
        , "send_to_team": "Sent to the execution team:"
        , "accepted_by_team": "Statement accepted by team:"
        , "worker": "worker:"
        , "refused_by_team": "Refused by team:"
        , "reason": "reason:"
        , "done": "Done"

        , "statement_log_label": "Info"
        , "previous": "Previous"
        , "next": "Next"
        , "monday": "Monday"
        , "tuesday": "Tuesday"
        , "wednesday": "Wednesday"
        , "thursday": "Thursday"
        , "friday": "Friday"
        , "saturday": "Saturday"
        , "sunday": "Sunday"
        , "uploaded": "Uploaded"
    },
    ru: {
        "add_new_entry": "Добавить новую запись..."
        , "deactivate": "Деактивировать пользователя"
        , "delete_user": "Удалить пользователя"
        , "change_status": "Сменить статус"
        , "upload_file": "Загрузить файлы"
        , "delete_row": "Удалить строку"
        , "edit_row": "Изменить строку"
        , "change_team": "Изменить бригаду"
        
        , "create_statement_by_operator": "Создание заявки оператором:"
        , "send_to_team": "Отправлена на исполнения команде:"
        , "accepted_by_team": "Заявка принята командой:"
        , "worker": "рабочим:"
        , "refused_by_team": "Отказ в исполнении командой:"
        , "reason": "причина:"
        , "done": "Исполнена"

        , "statement_log_label": "Информация"
        , "previous": "Предыдущий"
        , "next": "Cледующий"
        , "monday": "Понедельник"
        , "tuesday": "Вторник"
        , "wednesday": "Среда"
        , "thursday": "Четверг"
        , "friday": "Пятница"
        , "saturday": "Суббота"
        , "sunday": "Воскресенье"
        , "uploaded": "Загружено"
    },
    ua: {
        "add_new_entry": "Додати новий запис..."
        , "deactivate": "Деактивувати користвача"
        , "delete_user": "Видалити користувача"
        , "change_status": "Змінити статус"
        , "upload_file": "Завантажити файли"
        , "delete_row": "Видалити рядок"
        , "edit_row": "Змінити рядок"
        , "change_team": "Змінити бригаду"

        , "create_statement_by_operator": "Створення заявки оператором:"
        , "send_to_team": "Відправлена на виконання команді:"
        , "accepted_by_team": "Заявка прийнята командою:"
        , "worker": "працівником:"
        , "refused_by_team": "Відмова у виконанні командою:"
        , "reason": "причина:"
        , "done": "Виконана"

        , "statement_log_label": "Інформація"
        , "previous": "Попередній"
        , "next": "Наступний"
        , "monday": "Понеділок"
        , "tuesday": "Вівторок"
        , "wednesday": "Середа"
        , "thursday": "Четвер"
        , "friday": "П`ятниця"
        , "saturday": "Cубота"
        , "sunday": "Неділя"
        , "uploaded": "Завантажено"
    }
}

//