$(window).ready(function() {
    /* create a game, from the id #mygame */
    var g = new eng('mygame');

    /* add an image */
    g.resrc.image({
        name: 'yum',
        source: './imgs/yum.jpg'
    });

    /* add a component */
    g.cmpt.define('derp', '_base', function(p, pp) {

        p.image = g.resrc.images.yum;
    
        p.initialize = function(name, start) {
            pp.initialize.call(this, name, start);
        };
        
        p.draw = function() {
            pp.draw.call(this);
        };
        
    });

    var myc = g.cmpt.create('derp', 'myname', {x: 15, y: 2});
    myc.draw();
    
});