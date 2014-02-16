$(window).ready(function() {
    /* create a game, from the id #mygame */
    var g = new eng('mygame');

    /* add an image */
    g.resources.image({
        name: 'yum',
        source: './imgs/yum.jpg'
    });
    
    /* define component named 'herp' derived from '_base' */
    /* it will automatically use '_base' if left out */
    g.components.def('herp', '_base', {
        
        /* define properties */
        hiccup: 13,
        image: 'yum', 
        
        /* this is the constructor */
        initialize: function(game) {
            /* send it a game variable to add more functionality */
            this.image = game.resources.images['yum'];
            /* call the parent constructor */
            parent.initialize.call(this, 'hello world', {x: 5, y: 10});
        },
        
        /* this is an overridden method */
        draw: function() {
            console.log('this is an overridden method');
            console.log('hiccup ' + this.hiccup);
            /* call the parents method */
            parent.draw.call(this);
            
        }
        
    });

    g.components.def('derp', 'herp', {
        
        /* define properties */
        hiccup: 26,
        image: 'dope', 
        
        /* this is the constructor */
        initialize: function(game) {
            console.log('In derp constructor');
            /* send it a game variable to add more functionality */
            //this.image = game.resources.images['yum'];
            /* call the parent constructor */
            parent.initialize.call(this, game);
            console.log(this);
        },
        
        /* this is an overridden method */
        draw: function() {
            console.log('hiccup ' + this.hiccup);
            /* call the parents method */
            //console.log(parent);
            //parent.parent.draw.call(this);
            
        }
        
    });
    
    var myc = g.components.create('derp', g);
    myc.draw();
    
});