define([
    'com/pixijs/pixi',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    "com/pixijs/pixi-particles"
], function (PIXI, gr, msgBus, pixiParticles) {

    let bubbleEmitter = null;
    let elapsed = Date.now();
    let renderer = null;
    let particlesConfig = {
        "alpha": {
            list: [{
                    value: 1,
                    time: 0
                },
                {
                    value: 0,
                    time: 2
                }]
        },
        "scale": {
            "start": 1,
            "end": 1.4,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            list: [{
                    value: 380,
                    time: 0
                },
                {
                    value: 5,
                    time: 1
                },
                {
                    value: 5,
                    time: 2
                }]
        },
        "acceleration": {
            list: [{
                    "x": 20,
                    "y": 20,
                    time: 0
                }, {
                    "x": 1,
                    "y": 1,
                    time: 1
                },
                {
                    "x": 1,
                    "y": 1,
                    time: 2
                }]
                    //"x": 10,
                    //"y": 10
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 2,
            "max": 2
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": 1,
        "maxParticles": 2000,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "burst",
        "particlesPerWave": 5,
        "particleSpacing": 0,
        "angleStart": 0
    };

    let update = function () {
        if (!bubbleEmitter) {
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

    function createParticle() {
        bubbleEmitter = new pixiParticles.Emitter(
                gr.lib._simpleWinBG.pixiContainer,
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
        if (bubbleEmitter) {
            bubbleEmitter.emit = false;

            bubbleEmitter.destroy();
            bubbleEmitter = null;
            //reset SpriteRenderer's batching to fully release particles for GC
            if (renderer.plugins && renderer.plugins.sprite && renderer.plugins.sprite.sprites) {
                renderer.plugins.sprite.sprites.length = 0;
            }

            gr.forceRender();
        }
    }

    function getBubbleEmitter() {
        if (!bubbleEmitter) {
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