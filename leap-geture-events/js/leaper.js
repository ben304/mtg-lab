!function(scope){
  
  if(!scope.Leap) return console.log('Leap motion controller undetected.');
  
  var abs = Math.abs, max = Math.max,
      EVENTS = {
        SWIPE_START:   'swipestart',
        SWIPE_PROCESS: 'swipeprocess',
        SWIPE_END:     'swipeend',
        SWIPE_LEFT:    'swipeleft',
        SWIPE_RIGHT:   'swiperight',
        SWIPE_UP:      'swipeup',
        SWIPE_DOWN:    'swipedown',
        SWIPE_IN:      'swipein',
        SWIPE_OUT:     'swipeout' 
      },
      swipeDirections = ['left','top','up','down','in','out'];
      evtNames = Object.keys(EVENTS);
      
  function LeaperObject(el){
    this.el = el;
    this.triggers = {};
    /*for(var k in EVENTS){
      this.triggers[EVENTS[k]] = $F;
    }*/
    LeaperObject.queue.push(this);
  }
  LeaperObject.queue = [];
  LeaperObject.EVENT = EVENTS;
  LeaperObject.prototype = {
    listen: function(evtName, handler){
      this.triggers[evtName] = handler;
    },
    fire: function(evtName, obj){
      obj = obj || {};
      obj.target = this.el;
      this.triggers[evtName](obj);
    },
    trackSwipe: function(gesture, timestamp){
      var triggers = this.triggers,
          evtObj = {
            id: gesture.id,
            direction: gesture.direction,
            position: gesture.position,
            startPosition: gesture.startPosition,
            frameTimestamp: timestamp
          };
      switch(gesture.state){
        case 'start':
          evtObj.type = EVENTS.SWIPE_START;
          break;
        case 'update':
          evtObj.type = EVENTS.SWIPE_PROCESS;
          break;
        case 'stop':
          var offset = getOffset(evtObj.position,evtObj.startPosition),
              reduce = offset[1] < 0, dir = null, pos = 0;
          switch(offset[0]){
            case 'x': dir = reduce ? 'left' : 'right'; break;
            case 'y': dir = reduce ? 'up' : 'down'; break;
            case 'z': dir = reduce ? 'in' : 'out'; break;
          }
          if(dir && triggers['swipe'+dir]){
            this.fire('swipe'+dir, {
                id: gesture.id,
                direction: dir,
                axis: offset[0],
                offset: offset[1]
            });
          }
          evtObj.type = EVENTS.SWIPE_END;
          break;
      }
      if(triggers[evtObj.type]){
        this.fire(evtObj.type, evtObj);
      }
    }
  }
  
  function getOffset(pos1, pos2){
    var offsets = {
          x: pos1[0] - pos2[0],
          y: pos2[1] - pos1[1],
          z: pos1[2] - pos2[2]
        },
        diff = max(abs(offsets.x), abs(offsets.y), abs(offsets.z)),
        ret = [], k, v;
    for(k in offsets){
      v = offsets[k];
      if(abs(v) == diff){
        ret = [k,v];
        break;
      }
    }
    return ret;
  }
  Leap.loop(function(frame){
    var gesture,
        gestures = frame.gestures,
        hands = frame.hands,
        fingers = frame.fingers;
    if(gestures.length){
      gesture = gestures[0];
      //console.log(gesture.type);
      if(gesture.type == 'swipe'){
        LeaperObject.queue.forEach(function(v){
          v.trackSwipe(gesture, frame.timestamp);
        });
      }
    }
  });
  
  scope.Leaper = LeaperObject;
  
}(window);
