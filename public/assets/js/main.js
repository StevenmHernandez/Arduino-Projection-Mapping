requirejs.config({
  baseUrl: '/assets/js',
  paths: {
    "shapes": "shapes",
    "socketio": "/socket.io/socket.io.js"
  }
});

define(['shapes', 'socketio'],
  function (Shapes, io) {

    var setup = function () {
      config = {
        offset: {
          x: 0, //4,
          y: 0 //39
        },
        stretch: {
          x: 0, //0.995,
          y: 0 //1.18
        }
      };
      $window = $(window);
      $projection = $('#projection');
      $video = $('video');
      setupCanvas();
      openSocket();
    };

    var setupCanvas = function () {
      $projection.attr('height', $window.height());
      $projection.attr('width', $window.width());
      ctx = $projection[0].getContext('2d');
    };

    var openSocket = function () {
      var socket = io('http://localhost:3006');
      socket.on('data', function (data) {
        updateSpeed(data);
      });
    };

    var render = function () {
      ctx.rect(0, 0, $projection.attr('width'), $projection.attr('height'));
      ctx.fillStyle = 'black';
      ctx.fill();
      Shapes.paths.forEach(function (value, index) {
        ctx.save();
        ctx.beginPath();
        Shapes.paths[index].forEach(function (value, index, array) {
          if (index == 0) {
            ctx.moveTo(((value[0] * $projection.attr('width') + config.offset.x) * config.stretch.x),
              (value[1] * ($projection.attr('width') * (9 / 16)) + config.offset.y) * config.stretch.y);
          }
          else {
            ctx.lineTo(((value[0] * $projection.attr('width') + config.offset.x) * config.stretch.x),
              (value[1] * ($projection.attr('width') * (9 / 16)) + config.offset.y) * config.stretch.y);
          }
        });
        ctx.closePath();
        ctx.clip();
        ctx.drawImage($video[index % $video.length], 0, 0, $projection.attr('width'), $projection.attr('height'));
        ctx.restore();
      })
    };

    var shiftCanvas = function (e) {
      switch (e.which) {
        case 37: // left
          switch(e.shiftKey) {
            case true:
              config.stretch.x += 0.005;
              break;
            default:
              config.offset.x--;
          }
          break;
        case 38: // up
          switch(e.shiftKey) {
            case true:
              config.stretch.y += 0.005;
              break;
            default:
              config.offset.y--;
          }
          break;
        case 39: // right
          switch(e.shiftKey) {
            case true:
              config.stretch.x -= 0.005;
              break;
            default:
              config.offset.x++;
          }
          break;
        case 40: // down
          switch(e.shiftKey) {
            case true:
              config.stretch.y -= 0.005;
              break;
            default:
              config.offset.y++;
          }
          break;
        default:
          return;
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    };

    var updateSpeed = function (data) {
      $video[0].playbackRate = data[0];
      $video[1].playbackRate = data[1];
      $video[2].playbackRate = data[2];
    };

    var run = function () {
      setup();

      setInterval(function () {
        render();
      }, 99);

      $(document).keydown(function (e) {
        shiftCanvas(e)
      });
    };

    run();
  }
);