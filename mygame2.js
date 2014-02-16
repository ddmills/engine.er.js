var mylevel = {
    layers: {
        background: {
            width: 800,
            height: 600,
            position: {left: 0, top: 0},
            fill: 'sprite',
            fill_sprite: 'ground',
            fill_sprite_map: [[0, 0, 0, 0, 0, 0, 0],
                                          [1, 0, 0, 0, 1, 0, 1]]
            refreshed: false,
            overlay: false
        },
        gui: {
            width: 800,
            height: 600,
            refreshed: false,
            overlay: true
        }
    },
    viewport: {
        width: 800,
        height: 600,
        background: 'black'
    },
    
    resources: {
        images: {
            yum: {
                source: './imgs/yum.jpg',
                scale: {x: 32, y: 32} /* re-size it */
            },
            boo: {
                source: '/imgs/boo.jpg',
            }
        },
        
        sprites: {
            astronaut_walk: { 
                source: '/imgs/sprites/astro.png', 
                clips: {x: 5, y: 3},
                playback: 'loop'
            },
            astronaut_jump {
                source: '/imgs/sprites/astro_jump.png',
                clips: {x: 5, y: 3},
                playback: 'once',
                clip_order: [0, 1, 2, 3, 4, 5, 5, 5, 5, 4, 3, 2, 1, 0]
            }
        },
        
        fonts: {
            myfont: { 
                source : './fonts/myfont.ttf',
                color: 'blue'
            }
        },
    }
    
    entities: {
        astronaut: {
            health: 1000,
            
            collision: true,
            collision_type: 'ALL',
            components: ['astronaut', 'shield'], /* resources inherit POSITION, and PRIORITY */
            initialize: function() {
                this.state = 'idle';
            },
            logic: function() {
                if (game.WKEY.keydown) {
                    this.state = 'walk';
                } 
                if (game.WKEY.keyup) {
                    this.state = 'idle';
                }
            }
            update: function() {
                this.components.astronaut.state = this.state;
            }
        },
        
        powerup: {
            collision: true,
            collision_type: 'ENTITY',
            collision_bounds: {10, 10},
            collision_entities: ['astronaut'],
            components: ['powerup'],
            initialize:  function(position) {
                this.position = posiiton;
                this.health = 200;
            }
            onCollide function(entity) {
                entity.health + this.health;
            }
        }
    }
}