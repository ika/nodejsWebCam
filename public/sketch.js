// console.log("hello from index")
let capture;
let submitButton;

function setup() {
  createCanvas(300, 300).parent("#mySketch");
  capture = createCapture(VIDEO);
  capture.hide()
  capture.size(200, 200);
  imageMode(CENTER);

  submitButton = select("#submitButton");
  submitButton.mousePressed(JSC.handleSubmit);

}

function draw() {
  background(220);
  image(capture, width / 2, height / 2, width * 1.3, height)
}

JSC = {

  getRandom: function(length) {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  },
  handleSubmit: function() {

    var objArr = [];
    var obj = {};
    obj.image = get().canvas.toDataURL();
    objArr.push(obj);

    $.post('/handleSubmit', {
      data: JSON.stringify(objArr), // required field
      key: JSC.getRandom(16) // extra field
    }, function(resp) {
      if (resp.status == 'success') {
        console.log('handleSubmit success');
      } else {
        console.log('handleSubmit error');
      }
    }, 'json');

  },
  goToPictures: function() {
    window.location.href = '/logs';
  }

}

var pstyle = 'border: 1px solid #dfdfdf; padding: 25px; background: lightblue;';
var LAYOUTS = {
  basic: {
    name: 'basic',
    panels: [{
        type: 'top',
        size: 75,
        resizable: false,
        style: pstyle,
        content: '<button class="w2ui-btn" id="button-right" onclick="JSC.goToPictures()">Pictures</button>'
      },
      {
        type: 'main',
        style: pstyle,
        resizable: true,
        content:
        '<div id="mySketch"></div>'+
        '<div id="button-center">'+
        '<button id="submitButton" class="button-fancy" >'+
        '<i class="fa fa-rocket" style="font-size:36px;color:red"></i>🚀'+
        '</button>'+
        '</div>'
      }
    ]
  }

}

$(function() {

  $('#layout').w2layout(LAYOUTS.basic);

});
