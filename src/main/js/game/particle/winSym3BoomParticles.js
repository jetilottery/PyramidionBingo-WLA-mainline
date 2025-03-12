define([
    'com/pixijs/pixi',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    "com/pixijs/pixi-particles"
], function (PIXI, gr, msgBus,pixiParticles) {

    let bubbleEmitter = null;
    let elapsed = Date.now();
    let renderer = null;
    //let randerPos = [];
    //let pixiParticles = null;
    let particlesConfig = {
        alpha: {
            list: [{
                value: 0,
                time: 0
            }, {
                value: 1,
                time: 2
            }],
            isStepped: false
        },
        scale: {
            list: [{
                value: 1,
                time: 0
            }, {
                value: 1.5,
                time: 2
            }],
            minimumScaleMultiplier: 1,
            isStepped: false
        },
        color: {
            list: [{
                value: "ffffff",
                time: 0
            }, {
                value: "ffffff",
                time: 2
            }],
            isStepped: false
        },
        speed: {
            list: [{
                value: 400,
                time: 0
            }, {
                value: 100,
                time: 2
            }],
            isStepped: false
        },
        startRotation: {
            min: -150,
            max: -30
        },
        rotationSpeed: {
            min: 0,
            max: 0
        },
        lifetime: {
            min: 0.1,
            max: 2
        },
        frequency: 0.002,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 3,
        maxParticles: 1000,
        pos: {
            x: 0,
            y: 0
        },
        addAtBack: false,
        spawnType: "point"
    };

    let update = function () {
        if(!bubbleEmitter){
            return;
        }
        requestAnimationFrame(update);

        var now = Date.now();

        bubbleEmitter.update((now - elapsed) * 0.001);

        elapsed = now;

        gr.forceRender();
    };

    function onGameParametersUpdated() {
        renderer = gr.getPixiRenderer();
    }

    function createParticle(){
        bubbleEmitter = new pixiParticles.Emitter(
    
            gr.lib._winPlaqueBG.pixiContainer,

            [PIXI.Texture.fromImage('winSym1')],

            particlesConfig
        );
		update();
    }

    function startBubbleEmitter() {
		bubbleEmitter.resetPositionTracking();//This should be used if you made a major position change of your emitter's owner that was not normal movement.

        bubbleEmitter.emit = true;
    }

    function stopBubbleEmitter() {
        bubbleEmitter.emit = false;

        bubbleEmitter.destroy();
        bubbleEmitter = null;
        //reset SpriteRenderer's batching to fully release particles for GC
        if (renderer.plugins && renderer.plugins.sprite && renderer.plugins.sprite.sprites) {
            renderer.plugins.sprite.sprites.length = 0;
        }

        gr.forceRender();

    }

    function getBubbleEmitter() {
        if(!bubbleEmitter){
            createParticle();
        }
        //createParticle();
        return bubbleEmitter;
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    return {
        getBubbleEmitter: getBubbleEmitter,
        startBubbleEmitter: startBubbleEmitter,
        stopBubbleEmitter: stopBubbleEmitter
    };

});