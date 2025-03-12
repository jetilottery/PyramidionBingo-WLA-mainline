define([
    'com/pixijs/pixi',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/howlerAudioPlayer/HowlerAudioSubLoader',
    'skbJet/component/resourceLoader/ResourceLoader',
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/componentCRDC/splash/splashLoadController',
    'skbJet/componentManchester/webfontLoader/FontSubLoader',
    'game/configController',
    'skbJet/componentManchester/spineLoader/SpineSubLoader'
], function (PIXI, msgBus, SKBeInstant, gr, pixiResourceLoader, HowlerAudioSubLoader, ResourceLoader, resLib, splashLoadController, FontSubLoader, config, spineSubLoader) {
    var gameFolder;
    var loadProgressTimer;

    function startLoadGameRes() {
        if (!SKBeInstant.isSKB()) {
            msgBus.publish('loadController.jLotteryEnvSplashLoadDone');
        }
        pixiResourceLoader.load(gameFolder + 'assetPacks/' + SKBeInstant.config.assetPack, SKBeInstant.config.locale, SKBeInstant.config.siteId);
        ResourceLoader.getDefault().addSubLoader('sounds', new HowlerAudioSubLoader({type: 'sounds'}));
        ResourceLoader.getDefault().addSubLoader('fonts', new FontSubLoader());
        ResourceLoader.getDefault().addSubLoader('spine', new spineSubLoader());
        if (SKBeInstant.isSKB()) {//add heart beat to avoid load asset timeout.
            ResourceLoader.getDefault().addHeartBeat(onResourceLoadProgress);
        }
    }

    function onStartAssetLoading() {
        gameFolder = SKBeInstant.config.urlGameFolder;
        if (!SKBeInstant.isSKB()) {
            var splashLoader = new ResourceLoader(gameFolder + 'assetPacks/' + SKBeInstant.config.assetPack, SKBeInstant.config.locale, SKBeInstant.config.siteId);
            splashLoadController.loadByLoader(startLoadGameRes, splashLoader);
        } else {
            startLoadGameRes();
        }
    }

    function onAssetsLoadedAndGameReady() {
        var orientation = SKBeInstant.getGameOrientation();
        var gce = SKBeInstant.getGameContainerElem();

        var imgUrl = orientation + 'BaseBG';
        //get imgUrl from PIXI cache, or generate base64 image object from pixiResourceLoader
        var cacheImg = PIXI.utils.TextureCache[imgUrl];
        if (cacheImg && cacheImg.baseTexture.imageUrl.match(imgUrl + '.jpg')) {
            imgUrl = cacheImg.baseTexture.imageUrl;
        } else {
            imgUrl = pixiResourceLoader.getImgObj(imgUrl).src;
        }
        //avoid blank background between two background switch.
        gce.style.backgroundImage = gce.style.backgroundImage + ', url(' + imgUrl + ')';
        setTimeout(function () {
            gce.style.backgroundImage = 'url(' + imgUrl + ')';
        }, 100);

        gce.style.backgroundSize = '100% 100%';
        gce.style.backgroundPosition = 'center';

        if (config.backgroundStyle) {
            if (config.backgroundStyle.gameSize) {
                gce.style.backgroundSize = config.backgroundStyle.gameSize;
            }
        }
        gce.style.backgroundRepeat = 'no-repeat';

        //gce.innerHTML='';

        var gladData;
        if (orientation === "landscape") {
            gladData = window._gladLandscape;
        } else {
            gladData = window._gladPortrait;
        }
        gr.init(gladData, SKBeInstant.getGameContainerElem());
        SKBeInstant.getGameContainerElem().lastChild.id = "gameScene";
        SKBeInstant.getGameContainerElem().lastChild.style.opacity = 0;
        gr.showScene('_GameScene');
        msgBus.publish('jLotteryGame.assetsLoadedAndGameReady');
    }

    function onResourceLoadProgress(data) {
        msgBus.publish('jLotteryGame.updateLoadingProgress', {items: (data.total), current: data.current});

        if (data.complete) {
            if (loadProgressTimer) {
                clearTimeout(loadProgressTimer);
                loadProgressTimer = null;
            }
            msgBus.publish('resourceLoaded');  //send the event to enable pop dialog
            if (!SKBeInstant.isSKB()) {
                setTimeout(onAssetsLoadedAndGameReady, 500);
            } else {
                onAssetsLoadedAndGameReady();
            }
        }
    }

    msgBus.subscribe('jLottery.startAssetLoading', onStartAssetLoading);
    msgBus.subscribe('resourceLoader.loadProgress', function (data) {
        if (loadProgressTimer) {
            clearTimeout(loadProgressTimer);
            loadProgressTimer = null;
        }
        loadProgressTimer = setTimeout(function () {
            if (SKBeInstant.isSKB()) {
                ResourceLoader.getDefault().removeHeartBeat();
            }
        }, 35000); //If skb didn't receive message in 30s, it will throw error.
        onResourceLoadProgress(data);
    });
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', function () {
        if (SKBeInstant.isSKB()) {
            let gce = SKBeInstant.getGameContainerElem();
            for (let i = 0; i < gce.children.length; i++) {
                /*if (gce.children[i].id === 'gameScene') {
                 var gameChild = gce.children[i];
                 gce.innerHTML = '';
                 gce.appendChild(gameChild);
                 break;
                 }*/
                if (gce.children[i].id === 'changeBK') {
                    gce.removeChild(gce.children[i]);
                }
                if (gce.children[i].id === 'loadDiv') {
                    gce.removeChild(gce.children[i]);
                }
            }
            for (let i = 0; i < gce.children.length; i++) {
                if (gce.children[i].id === 'gameScene') {
                    gce.children[i].style.opacity = 1;
                    break;
                }
            }
        } else {
            let gce = SKBeInstant.getGameContainerElem();
            let forEnd = true;
            let interval = setInterval(function () {
                if (forEnd) {
                    forEnd = false;
                    for (let i = 0; i < gce.children.length; i++) {
                        if (gce.children[i].id === 'changeBK') {
                            if (gce.children[i].style.opacity < 0) {
                                clearInterval(interval);
                                interval = null;
                                for (let j = 0; j < gce.children.length; j++) {
                                    /*if (gce.children[j].id === 'gameScene') {
                                     var gameChild = gce.children[j];
                                     gce.innerHTML = '';
                                     gce.appendChild(gameChild);
                                     break;
                                     }*/
                                    if (gce.children[j].id === 'changeBK') {
                                        gce.removeChild(gce.children[j]);
                                    }
                                    if (gce.children[j].id === 'loadDiv') {
                                        gce.removeChild(gce.children[j]);
                                    }
                                }
                                for (let j = 0; j < gce.children.length; j++) {
                                    if (gce.children[j].id === 'gameScene') {
                                        gce.children[j].style.opacity = 1;
                                        break;
                                    }
                                }
                            } else {
                                gce.children[i].style.opacity -= 0.1;
                            }
                            break;
                        }
                    }
                    forEnd = true;
                }
            }, 50);
        }
    });

    return {};
});