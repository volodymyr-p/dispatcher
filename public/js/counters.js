function sendFiles() {
  var data = new FormData();

  data.append(`city`, $("#city").val());
  data.append(`street`, $("#street").val());
  data.append(`house_number`, $("#house_number").val()); 
  data.append(`flat_number`, $("#flat_number").val());
  data.append(`counter_number`, $("#counter_number").val());
  data.append(`description`, $("#description").val()); 

  $.each($('#fileslist')[0].files, function (i, file) {
    data.append('file-' + i, file);
  });
  
  let bar = $('.bar');
  let percent = $('.percent');
  let status = $('#status');

  status.empty();
  let percentVal = '0%';
  bar.width(percentVal)
  percent.html(percentVal);
  $.ajax({
    xhr: function () {
      var xhr = new window.XMLHttpRequest();

      xhr.upload.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
          let percentVal = evt.loaded / evt.total;
          percentVal = parseInt(percentVal * 100);
          percentVal = percentVal + '%';
          bar.width(percentVal)
          percent.html(percentVal);
        }
      }, false);
      return xhr;
    },
    url: window.location.pathname + '/upload',
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    method: 'POST',
    type: 'POST', // For jQuery < 1.9
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        status.append(`<p>${dict("uploaded")} ${data[i]}</p>`);
      }
      LoadData();
    }
  });
}

function openArchive() {
    $("#archiveBtn").hide();
    $("#addBut").hide();
    $("#startProcessingMeters").hide();
    
    $("#analyticsLable").show();
    $("#periodPicker").show();
    const dtemp = new Date();

    // set current time for "to" picker
    dtemp.setDate(dtemp.getDate());
    $("#to").datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: getCookie("lang")
    }).datetimepicker("setDate", dtemp);

    // set last 7 days time for "from" picker   
    dtemp.setDate(dtemp.getDate() - 7);
    $("#from").datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: getCookie("lang")
    }).datetimepicker("setDate", dtemp);

    LoadData(true);
}

function fastChooseInterval(interval) {
    let currentDate = new Date();
    let from = new Date();
    let to = new Date();
    switch (interval) {
        case "hour":
            from = new Date(currentDate.setHours(currentDate.getHours() - 1));
            break;
        case "day":
            from = new Date(currentDate.setHours(currentDate.getHours() - 24));
            break;
        case "week":
            from = new Date(currentDate.setHours(currentDate.getHours() - 168));
            break;
        case "month":
            from = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
            break;
        case "year":
            from = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
            break;
        default:
            break;
    }
    $('#from').datetimepicker('setDate', from);
    $('#to').datetimepicker('setDate', to);
    LoadData(true);
}

function sendCounterValue(data) {
  $.ajax({
    type: "PUT",
    url: page + "SetCounterValue",
    headers: {
      "Authorization": sessionStorage.getItem('Authorization')
    },
    dataType: 'json',
    data: {
      counter_value: data.counter_value,
      counter_number: data.counter_number,
      id_upload: data.id_upload
    },
    success: function (response) {
      $('#SubmitButton, #counterInput').prop('disabled', true);

      if(response.status === 'ok'){
        $('#statusInfo').text('Показник успішно зафіксований!').attr('class', 'text-success');
        LoadData(false, true);
        openNextModal(data);
      }
    },
    error: onError
  });
}

function openNextModal(data) {
  let localImageData = JSON.parse(JSON.stringify(imagesData));
  let nextImageToShow = null;
  if(localImageData[0]) {
    const e = localImageData[0];
    const a = e[8];
    $('#fullScreenImageModal').fadeToggle()
    showModalImage(a[0]);
    $('#fullScreenImageModal').fadeToggle()
  } else {
    $('#fullScreenImageModal').modal('hide');
  }
}

function createImageContainer(c, isArchive) {
  let imageContainer = `<div class="imagesContainer" style="margin-bottom: 20">`;

  c[8].map(fileName => {
    imageContainer += `
      <div class="grow imageContainer" data-toggle="modal"  href="#fullScreenImageModal" onclick="showModalImage('${fileName}', ${isArchive})">
          <img src="/uploads/${fileName}" alt="Image not found" width="100%" height="100%" />
      </div>`;
  });
  imageContainer += `</div>`;

  return imageContainer;
}

function showModalImage(imageName, isArchive) {
    let currentImageInfo;

    // finding data for current open image (TODO: think how to rewrite)
    imagesData.map(e => {      
      e[8].map(iterName => {
        if(iterName === imageName){
          currentImageInfo = e;
        }
      });
    });

    // remove previous information from modal
    $('#fullScreenImageDiv img').remove();
    $('#imageInfo p, #statusInfo').text('');
    //$('#statusInfo').text('');
    $('#counterInput').val('');
    $('#counterInput, #SubmitButton').prop('disabled', false);

    const fullScreenImage = 
                `<img    
                    src="uploads/${imageName}" 
                    alt="Photo for statement"
                    class="img-fluid img-thumbnail">`
    $('#fullScreenImageDiv').append(fullScreenImage);

    // fill other information connected to picture
    $('#idCounter').append(currentImageInfo[1]);
    $('#adress').append(currentImageInfo[4]);
    $('#controllerName').append(currentImageInfo[2]);
    $('#description').append(currentImageInfo[5]);
    $('#uploadDate').append(currentImageInfo[3]);

    // hidden value for normal form serialize with all needed values
    $('#idCounterHidden').val(currentImageInfo[1]);
    $('#idUploadHidden').val(currentImageInfo[0]);
    
    if(isArchive){  
      $('#counterInput').val(currentImageInfo[6]).prop('disabled', true);
      $('#SubmitButton').hide();
    }
}

function startProcessingMeters() {
  showModalImage(imagesData[0][8].toString(), false)
}

$("#sendDate").on("click", function (e) {
    LoadData(true);
});

$('#SubmitButton').click(function (e) {
  e.preventDefault();
  if($("#counterInput")[0].validity.valid){
      const form = $("#counterValueForm");
      let formData = {};
      $.each(form.serializeArray(), function () {
          formData[this.name] = this.value;
      });
      sendCounterValue(formData);
  } else {
    $('#statusInfo').text('Введіть показник!').attr('class', 'text-danger');
  }
});

$('#uploadBtn').click(function (e) {
  e.preventDefault();

   $('#errlabel').text('').removeClass('text-danger');

  if( $("#fileslist")[0].validity.valid && 
      $("#city")[0].validity.valid && 
      $("#street")[0].validity.valid &&
      $("#house_number")[0].validity.valid &&
      $("#flat_number")[0].validity.valid &&
      $("#counter_number")[0].validity.valid &&
      $("#description")[0].validity.valid) {
      sendFiles();
      LoadData();
      $('#uploadFilesModal').modal('hide');
  } else {
    $('#errlabel').text('Заповніть всі необхідні поля та виберіть фото!').attr('class', 'text-danger');
  }
});