function Layer(game, name, overlay, persistant) {
    this.game = game; // the parent game object
    this.name = name; // the name of this layer
    this.overlay = overlay; // if the layer is full size or only overlayed
    this.persistant = persistant; // if the layer should get cleared when dirty or not
    
    /* build the canvas */
    this.canvas = $('<canvas id="' + this.game.id + '_can_' + name + '">');
    this.context = this.canvas.getContext('2d');
    this.canvas.css('left', 0);
    this.canvas.css('top', 0);
    
    if (overlay) {
        
    } else {
    
    }
    
}
Layer.prototype.resize = function(width, height) {

}

function Game(id) {
    this.constants = {
        
    },
    this.draw = {
        init: function() {
            this.persistant_layers = {};
            this.static_layers = {};
        },
        /* create a new layer */
        add_layer: function(name, overlay, persistant) {
            if (persistant) {
                this.persistant_layers[name] = new Layer(this.game, name, overlay, true);
            } else {
                this.static_layers[name] = new Layer(this.game, name, overlay, false);
            }
        }
    }
    
    this.draw.game = this;
    this.draw.init();
    
}