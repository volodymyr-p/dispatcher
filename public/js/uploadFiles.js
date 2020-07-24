function sendFiles() {
  var data = new FormData();
  data.append(`id_statment`, uploadFilesModalOnOpen);
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
          console.log(percentVal);

          percentVal = percentVal + '%';
          bar.width(percentVal)
          percent.html(percentVal);

          if (percentVal === '100%') {
            console.log('Complete')
          }

        }
      }, false);

      return xhr;
    },
    url: '/files',
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    method: 'POST',
    type: 'POST', // For jQuery < 1.9
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        status.append(`<p>${dict("uploaded")} ${data[i]}</p>`);
        console.log(data[i]);
      }
    }
  });
}