var pickey = '';

JSC = {

  deletePicture: function(key) {
    $.post('/deletePic', {
      data: key
    }, function(resp) {
      if (resp.status == 'success') {
        $("#entries").empty();
        JSC.getPictures();
      }
    }, 'json');
  },
  downloadPic: function() {

    // $.ajax({
    //   url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/172905/test.pdf',
    //   method: 'GET',
    //   xhrFields: {
    //     responseType: ''
    //   },
    //   success: function(data) {
    //
    //     var blob = new Blob([data], {
    //       type: 'application/pdf'
    //     });
    //     var a = document.createElement('a');
    //     a.href = window.URL.createObjectURL(blob);
    //     a.download = 'myfile.pdf';
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //   }
    // });

    $.post('/getPic', {
      data: pickey
    }, function(resp) {
      if (resp.status == 'success') {

        // trim
        var rec = resp.record;
        var n = rec.indexOf('iVBOR');
        rec = rec.substring(n , rec.length);
        rec = rec.substring(rec, rec.length - 3);

        //rec = atob(rec); //javascript decode base64

        var blob = new Blob([window.atob(rec)], {
          type: 'image/png',
          encoding: 'utf-8'
        });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'image-'+pickey+'.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);


      }
    }, 'json');

  },
  getPicture: function(key) {
    $.post('/getPic', {
      data: key
    }, function(resp) {
      if (resp.status == 'success') {

        var rec = resp.record;
        var n = rec.indexOf('data');
        rec = rec.substring(n, rec.length);
        rec = rec.substring(rec, rec.length - 3);

        var img = new Image();
        img.src = rec;

        $('<img />')
          .attr('src', "" + rec + "")
          .attr('title', key)
          .width('200px')
          .height('200px')
          .bind('click', function() {
            pickey = key;
            showDeletePopup();
          })
          .appendTo($('#entries'));

      }
    }, 'json');

  },
  getPictures: function() {

    $.get('/getAllPics', function(resp) {
      if (resp.status == 'success') {

        for (var i = 0; i < resp.records.length; i++) {
          JSC.getPicture(resp.records[i].key);
        }
      }

    });

  },
  getBack: function() {
    window.location.href = '/';
  }

}

var pstyle = 'border: 1px solid #dfdfdf; padding: 25px;';
var LAYOUTS = {
  basic: {
    name: 'basic',
    panels: [{
        type: 'top',
        size: 75,
        resizable: false,
        style: pstyle + 'background: lightblue;',
        content: '<button class="w2ui-btn" onclick="JSC.getBack()">Camera</button>'
      },
      {
        type: 'main',
        style: pstyle + 'border-top: 0px;',
        resizable: true,
        content: '<section id="entries"></section>'
      }
    ]
  }

}

function showDeletePopup() {

  w2popup.open({
    width: 480,
    height: 250,
    title: 'Picture',
    body: '<div class="w2ui-centered">This is text inside the popup</div>',
    buttons: '<button class="w2ui-btn" onclick="showDownloadConfirm()">Download</button>' +
      '<button class="w2ui-btn" onclick="showDeleteConfirm()">Delete</button>',
    showMax: false
  });
}

function showDeleteConfirm() {
  w2confirm('Delete<br />Are you sure?')
    .yes(function() {
      w2popup.close();
      setTimeout(function() {
        JSC.deletePicture(pickey);
      }, 500);
    })
    .no(function() {
      w2popup.close();
    });
}

function showDownloadConfirm() {
  w2confirm('Download this pictue?')
    .yes(function() {
      w2popup.close();
      setTimeout(function() {
        //console.log(pickey);
        JSC.downloadPic();
      }, 500);
    })
    .no(function() {
      w2popup.close();
    });
}

$(function() {

  $('#layout').w2layout(LAYOUTS.basic);

  JSC.getPictures();

});
