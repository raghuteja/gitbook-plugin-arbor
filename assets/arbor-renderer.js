var Renderer = function(elt, params){
  var dom = $(elt)
  var canvas = dom.get(0)
  var ctx = canvas.getContext("2d");
  var gfx = arbor.Graphics(canvas)
  var sys = null
  var ratio = 1
  var additionalParams = params || {}

  var selected = null,
      nearest = null,
      _mouseP = null;

  var that = {
    init:function(pSystem){
      var devicePixelRatio = window.devicePixelRatio || 1
      var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                            ctx.mozBackingStorePixelRatio ||
                            ctx.msBackingStorePixelRatio ||
                            ctx.oBackingStorePixelRatio ||
                            ctx.backingStorePixelRatio || 1
      ratio = devicePixelRatio/backingStoreRatio
      sys = pSystem
      sys.screen({size:{width:dom.width(), height:dom.height()},
                  padding: additionalParams.padding})

      $(window).resize(that.resize)
      that.resize()
      that._initMouseHandling()
    },
    resize:function(){
      canvas.style.width='100%';
      canvas.style.height='100%';
      canvas.width = ratio*Math.max(canvas.offsetWidth, additionalParams.width || 1);
      canvas.height = ratio*Math.max(canvas.offsetHeight, additionalParams.height || 1);
      sys.screen({size:{width:canvas.width, height:canvas.height}})
      ctx.scale(ratio, ratio)
      that.redraw()
    },
    redraw:function(){
      gfx.clear()
      sys.eachEdge(function(edge, p1, p2){
        p1.x = p1.x/ratio
        p1.y = p1.y/ratio
        p2.x = p2.x/ratio
        p2.y = p2.y/ratio
        gfx.line(p1, p2, {stroke:edge.data.color, width:edge.data.width})
      })
      sys.eachNode(function(node, pt){
        pt.x = pt.x/ratio
        pt.y = pt.y/ratio
        var w = Math.max(20, 20+gfx.textWidth(node.name) )
        gfx.rect(pt.x-w/2, pt.y-8, w, 20, 4, {fill:node.data.color})
        gfx.text(node.name, pt.x, pt.y+9, {color:"white", align:"center", font:"Arial", size:12})
      })
    },

    _initMouseHandling:function(){
      // no-nonsense drag and drop (thanks springy.js)
      selected = null;
      nearest = null;
      var dragged = null;
      var oldmass = 1

      var _section = null

      var handler = {
        moved:function(e){
          var pos = $(canvas).offset();
          _mouseP = arbor.Point((e.pageX-pos.left)*ratio, (e.pageY-pos.top)*ratio)
          nearest = sys.nearest(_mouseP);

          if (!nearest.node) return false

          if (nearest.node.data.link){
            selected = (nearest.distance < 50) ? nearest : null
            if (selected){
               dom.addClass('arbor-linkable')
               window.status = selected.node.data.link.replace(/^\//,"http://"+window.location.host+"/").replace(/^#/,'')
            }
            else{
               dom.removeClass('arbor-linkable')
               window.status = ''
            }
          }

          return false
        },
        clicked:function(e){
          var pos = $(canvas).offset();
          _mouseP = arbor.Point((e.pageX-pos.left)*ratio, (e.pageY-pos.top)*ratio)
          nearest = dragged = sys.nearest(_mouseP);

          if (nearest && selected && nearest.node===selected.node){
            var link = selected.node.data.link
            if (link.match(/^#/)){
               $(that).trigger({type:"navigate", path:link.substr(1)})
            }else{
               window.location = link
            }
            return false
          }

          if (dragged && dragged.node !== null) dragged.node.fixed = true

          $(canvas).unbind('mousemove', handler.moved);
          $(canvas).bind('mousemove', handler.dragged)
          $(window).bind('mouseup', handler.dropped)

          return false
        },
        dragged:function(e){
          var old_nearest = nearest && nearest.node._id
          var pos = $(canvas).offset();
          var s = arbor.Point((e.pageX-pos.left)*ratio, (e.pageY-pos.top)*ratio)

          if (!nearest) return
          if (dragged !== null && dragged.node !== null){
            var p = sys.fromScreen(s)
            dragged.node.p = p
          }

          return false
        },

        dropped:function(e){
          if (dragged===null || dragged.node===undefined) return
          if (dragged.node !== null) dragged.node.fixed = false
          dragged.node.tempMass = 1000
          dragged = null;
          $(canvas).unbind('mousemove', handler.dragged)
          $(window).unbind('mouseup', handler.dropped)
          $(canvas).bind('mousemove', handler.moved);
          _mouseP = null
          return false
        }
      }
      $(canvas).mousedown(handler.clicked);
      $(canvas).mousemove(handler.moved);
    }
  }

  return that
}

var arbInit = function(elt, graphJsonStr) {
  var theUI = JSON.parse(graphJsonStr)
  var sys = arbor.ParticleSystem()
  sys.parameters({stiffness:900, repulsion:2000, gravity:true, dt:0.015})
  sys.renderer = Renderer(elt, theUI.params)
  delete theUI.params
  sys.graft(theUI)
}
