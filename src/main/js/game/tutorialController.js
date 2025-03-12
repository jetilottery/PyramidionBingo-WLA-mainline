/**
 * @module game/tutorialController
 * @description result dialog control
 */
define([
    'com/pixijs/pixi',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController'
], function (PIXI, msgBus, audio, gr, loader, gladButton, SKBeInstant, gameUtils, config) {
    var buttonInfo, buttonClose;
    var left, right;
    var index = 0, minIndex = 0, maxIndex;
    var shouldShowTutorialWhenReinitial = false;
    var iconOnImage, iconOffImage, buttonCloseImage, buttonInfoImage;
    var showTutorialAtBeginning = true;
    var resultIsShown = false;
    var upChannel = 0;
    var downChannel = 0;
    function showTutorial() {
        gr.lib._BG_dim.off('click');
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultIsShown = true;
        }
        gr.animMap._tutorialAnim.play();
        msgBus.publish('tutorialIsShown');
        if (config.audio.HelpPageOpen) {
            audio.play(config.audio.HelpPageOpen.name, config.audio.HelpPageOpen.channel);
        }
    }

    function hideTutorial() {
        index = minIndex;
        gr.animMap._tutorialUP._onComplete = function () {
            gr.lib._tutorial.show(false);
            for (var i = minIndex; i <= maxIndex; i++) {
                if (i === minIndex) {
                    gr.lib['_tutorialPage_0' + i].show(true);
                    gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
                    if (gr.lib['_tutorialPageIcon_0' + i]) {
                        gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                    }
                } else {
                    gr.lib['_tutorialPage_0' + i].show(false);
                    gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
                }
            }
            buttonInfo.show(true);
            if (!resultIsShown) {
                gr.lib._BG_dim.show(false);
            } else {
                resultIsShown = false;
            }
            msgBus.publish('tutorialIsHide');
        };
        gr.animMap._tutorialUP.play();
        if (config.audio.HelpPageClose) {
            audio.play(config.audio.HelpPageClose.name, config.audio.HelpPageClose.channel);
        }
    }

    function onGameParametersUpdated() {
        if (config.textAutoFit.versionText) {
            gr.lib._versionText.autoFontFitText = config.textAutoFit.versionText.isAutoFit;
        }
        gr.lib._versionText.setText(window._cacheFlag.gameVersion + ".CL" + window._cacheFlag.changeList + "_" + window._cacheFlag.buildNumber);
        /**
         *	Update at 1 July
         * 	Version test should show in WLA env, not in COM env
         */
        if (SKBeInstant.isWLA()) {
            gr.lib._versionText.show(true);
        } else {
            gr.lib._versionText.show(false);
        }
        // Prevent click the symbols when tutorial is shown
        gr.lib._BG_dim.on('click', function (event) {
            event.stopPropagation();
        });

        iconOnImage = config.gladButtonImgName.iconOn;
        iconOffImage = config.gladButtonImgName.iconOff;
        buttonCloseImage = config.gladButtonImgName.tutorialButtonClose || "buttonClose";
        buttonInfoImage = config.gladButtonImgName.buttonInfo || "buttonInfo";
        maxIndex = Number(config.gameParam.pageNum) - 1;

        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true};
        buttonInfo = new gladButton(gr.lib._buttonInfo, buttonInfoImage, scaleType);
        buttonClose = new gladButton(gr.lib._buttonCloseTutorial, buttonCloseImage, scaleType);
        buttonInfo.show(false);
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
                showTutorialAtBeginning = false;
                buttonInfo.show(true);
                gr.lib._BG_dim.show(false);
                gr.lib._tutorial.show(false);
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.showTutorialAtBeginning === false) {
                showTutorialAtBeginning = false;
                buttonInfo.show(true);
                gr.lib._BG_dim.show(false);
                gr.lib._tutorial.show(false);
            }
        }

        buttonInfo.click(function () {
            showTutorial();
            if (config.audio && config.audio.ButtonInfo) {
                audio.play(config.audio.ButtonInfo.name, config.audio.ButtonInfo.channel);
            }
        });

        buttonClose.click(function () {
            hideTutorial();
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        });
        if (gr.lib._buttonTutorialArrowLeft) {
            left = new gladButton(gr.lib._buttonTutorialArrowLeft, "buttonTutorialArrow", scaleType);
            left.click(function () {
                index--;
                if (index < minIndex) {
                    index = maxIndex;
                }
                fillTutorialDialog();
                showTutorialPageByIndex(index);
                if (config.audio && config.audio.ButtonBetDown) {
                    audio.play(config.audio.ButtonBetDown.name, downChannel);
                    downChannel = (downChannel + 1) % 2;
                }
            });
        }
        if (gr.lib._buttonTutorialArrowRight) {
            right = new gladButton(gr.lib._buttonTutorialArrowRight, "buttonTutorialArrow", {'scaleXWhenClick': -0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true});
            right.click(function () {
                index++;
                if (index > maxIndex) {
                    index = minIndex;
                }
                fillTutorialDialog();
                showTutorialPageByIndex(index);
                if (config.audio && config.audio.ButtonBetUp) {
                    audio.play(config.audio.ButtonBetUp.name, upChannel);
                    upChannel = (upChannel + 1) % 2;
                }
            });
        }

        /*for (var i = minIndex; i <= maxIndex; i++) {
         if (i !== 0) {
         gr.lib['_tutorialPage_0' + i].show(false);
         gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
         } else {
         if (gr.lib['_tutorialPageIcon_0' + i]) {
         gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
         }
         }
         var obj = gr.lib['_tutorialPage_0' + i + '_Text_00'];
         if (config.tutorialDropShadow) {
         gameUtils.setTextStyle(obj, {
         padding: config.dropShadow.padding,
         dropShadow: config.dropShadow.dropShadow,
         dropShadowDistance: config.dropShadow.dropShadowDistance
         });
         }
         gameUtils.setTextStyle(obj, config.style.textStyle);
         if (loader.i18n.Game['tutorial_0' + i + '_landscape'] || loader.i18n.Game['tutorial_0' + i + '_portrait']) {
         if (SKBeInstant.getGameOrientation() === "landscape") {
         obj.setText(loader.i18n.Game['tutorial_0' + i + '_landscape']);
         } else {
         obj.setText(loader.i18n.Game['tutorial_0' + i + '_portrait']);
         }
         } else {
         obj.setText(loader.i18n.Game['tutorial_0' + i]);
         }
         }*/

        if (SKBeInstant.getGameOrientation() === "landscape") {
            let regWrap = new RegExp('[\n]', 'g');
            let line0 = loader.i18n.Game['tutorial_00' + '_landscape'];
            let linesOfLine0 = line0.split(regWrap);
            handleTutorialContent(gr.lib._tutorialPage_00_Text_00, linesOfLine0);
        } else {
            let line0 = loader.i18n.Game['tutorial_00' + '_portrait'];
            setVerticalCenterTxt(gr.lib._tutorialPage_00_Text_00, line0);
        }
        gameUtils.setTextStyle(gr.lib._tutorialTitleText, config.style.tutorialTitleText);
        if (config.textAutoFit.tutorialTitleText) {
            gr.lib._tutorialTitleText.autoFontFitText = config.textAutoFit.tutorialTitleText.isAutoFit;
        }
        gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);

        gameUtils.setTextStyle(gr.lib._closeTutorialText, config.style.closeTutorialText);
        if (config.textAutoFit.closeTutorialText) {
            gr.lib._closeTutorialText.autoFontFitText = config.textAutoFit.closeTutorialText.isAutoFit;
        }
        gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._closeTutorialText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._tutorialTitleText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
    }

    function showTutorialPageByIndex(index) {
        hideAllTutorialPages();
        gr.lib['_tutorialPage_0' + index].show(true);
        gr.lib['_tutorialPage_0' + index + '_Text_00'].show(true);
        gr.lib['_tutorialPageIcon_0' + index].setImage(iconOnImage);
    }

    function hideAllTutorialPages() {
        for (var i = 0; i <= maxIndex; i++) {
            gr.lib['_tutorialPage_0' + i].show(false);
            gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
            if (gr.lib['_tutorialPageIcon_0' + i]) {
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
    }

    function onReInitialize() {
        if (shouldShowTutorialWhenReinitial) {
            shouldShowTutorialWhenReinitial = false;
            if (showTutorialAtBeginning) {
                showTutorial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        } else {
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }

    function onDisableUI() {
        gr.lib._buttonInfo.show(false);
    }

    function onEnableUI() {
        gr.lib._buttonInfo.show(true);
    }

    function showTutorialOnInitial() {
        for (var i = minIndex; i <= maxIndex; i++) {
            if (i === minIndex) {
                gr.lib['_tutorialPage_0' + i].show(true);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
                if (gr.lib['_tutorialPageIcon_0' + i]) {
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                }
            } else {
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }

    function onInitialize() {
        if (showTutorialAtBeginning) {
            showTutorialOnInitial();
        } else {
            msgBus.publish('tutorialIsHide');
        }
    }
    function onReStartUserInteraction() {
        //buttonInfo.show(true);
    }
    function onStartUserInteraction() {
        if (SKBeInstant.config.gameType === 'ticketReady') {
            if (showTutorialAtBeginning) {
                showTutorialOnInitial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        } else {
            gr.lib._tutorial.show(false);
            //buttonInfo.show(true);
        }
    }

    function onBeginNewGame() {
        if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
            buttonInfo.show(true);
        }
    }

    function onPlayerWantsToMoveToMoneyGame() {
        shouldShowTutorialWhenReinitial = true;
    }

    function onTutorialIsHide() {
        buttonInfo.show(true);
    }

    /**
     *	2 July 2019
     * 	Subscribe two function which are enable and disable button info for game in GIP.
     */
    function disableButtonInfo() {
        buttonInfo.enable(false);
        disableConsole();
    }

    function enableButtonInfo() {
        buttonInfo.enable(true);
        enableConsole();
    }

    function handleTutorialContent(parentSpr, linesArr) {
        var curStyle = parentSpr._currentStyle;
        var fSize = curStyle._font._size, parentWidth = curStyle._width, parentHeight = curStyle._height, contentWidth = 0, contentHeight;
        //var txtStyle = {fontWeight: curStyle._font._weight, fontFamily: curStyle._font._family, fontSize: fSize, fill: '#ffffff', align: curStyle._text._align, lineHeight: curStyle._text._lineHeight};
        var regImg = new RegExp('\{[^\{]+\}', 'g');
        var perLineHeight = Math.floor((curStyle._height - (linesArr.length - 1) * 10) / linesArr.length);
        var txtStyle = {fontWeight: curStyle._font._weight, fontFamily: curStyle._font._family, fontSize: fSize, fill: '#ffffff', align: curStyle._text._align, lineHeight: perLineHeight, height: perLineHeight};
        function createLineSpr() {
            parentSpr.pixiContainer.removeChildren();
            var prevContentWidth = 0;
            contentHeight = 0;
            for (var i = 0; i < linesArr.length; i++) {
                var txts = linesArr[i].split(regImg);
                var imgs = linesArr[i].match(regImg);
                contentWidth = 0;
                if (txts.length === 1 && imgs === null) {
                    var txtSpr = new PIXI.Text(txts[0], txtStyle);
                    parentSpr.pixiContainer.addChild(txtSpr);
                    contentWidth = txtSpr.width;
                    contentHeight += txtSpr.height;
                } else {
                    var lineSpr = new PIXI.Container();
                    createSubSpr(lineSpr, txts, imgs);
                    contentHeight += lineSpr.cttHeight;
                }
                contentWidth = prevContentWidth >= contentWidth ? prevContentWidth : contentWidth;
                prevContentWidth = contentWidth;
            }
            function createSubSpr(container, txtArr, imgArr) {
                var imgName, ratio, imgSpr, tmpTexture, prevSubHeight = 0;
                for (var j = 0; j < txtArr.length; j++) {
                    var txtSprite = new PIXI.Text(txtArr[j], txtStyle);
                    container.addChild(txtSprite);
                    contentWidth += txtSprite.width;
                    container.cttHeight = prevSubHeight >= txtSprite.height ? prevSubHeight : txtSprite.height;
                    prevSubHeight = container.cttHeight;
                    if (imgArr[j]) {
                        if (imgArr[j] === '{b01}') {
                            imgName = 'tutorialStar';
                        } else {
                            imgName = 'tutorialStar';
                        }
                        tmpTexture = PIXI.utils.TextureCache[imgName];
                        imgSpr = new PIXI.Sprite(tmpTexture);
                        ratio = Number(tmpTexture.orig.width) / Number(tmpTexture.orig.height);
                        var initHeight = perLineHeight >= imgSpr.height + 10 ? imgSpr.height : perLineHeight - 10;
                        container.addChild(imgSpr);
                        imgSpr.scale.y = initHeight / imgSpr.height;
                        imgSpr.scale.x = Math.ceil(imgSpr.height * ratio) / imgSpr.width;
                        contentWidth += imgSpr.width;
                        container.cttHeight = prevSubHeight >= imgSpr.height ? prevSubHeight : imgSpr.height;
                        container.cttHeight = Number(container.cttHeight) + 10;
                        container.cttHeight = container.cttHeight > perLineHeight ? perLineHeight : container.cttHeight;
                        prevSubHeight = container.cttHeight;
                    }
                    container.cttWidth = contentWidth;
                }
                parentSpr.pixiContainer.addChild(container);
            }
        }

        function setPosition() {
            var line, prevLine, prevSpr;
            for (var i = 0; i < parentSpr.pixiContainer.children.length; i++) {
                line = parentSpr.pixiContainer.children[i];
                if (line.children.length === 0) {
                    line.x = (parentWidth - line.width) / 2;
                } else {
                    for (var j = 0; j < line.children.length; j++) {
                        var subSpr = line.children[j];
                        if (j === 0) {
                            subSpr.x = 0;
                        } else {
                            prevSpr = line.children[j - 1];
                            subSpr.x = prevSpr.x + prevSpr.width;
                        }
                        subSpr.y = (line.cttHeight - subSpr.height) / 2;
                    }
                    line.x = (parentWidth - line.cttWidth) / 2;
                }
                if (i === 0) {
                    line.y = (parentHeight - contentHeight - (linesArr.length - 1) * 10) / 2;
                } else {
                    prevLine = parentSpr.pixiContainer.children[i - 1];
                    line.y = prevLine.y + prevLine.height + 10;
                }
            }
        }
        createLineSpr();
        while (contentWidth > parentWidth || contentHeight > (parentHeight - (linesArr.length - 1) * 10)) {
            fSize--;
            txtStyle.fontSize = fSize;
            createLineSpr();
        }
        setPosition();
    }

    function fillTutorialDialog() {
        var regWrap = new RegExp('[\n]', 'g');
        var line0;
        if (SKBeInstant.getGameOrientation() === "landscape") {
            line0 = loader.i18n.Game['tutorial_00' + '_landscape'];
        } else {
            line0 = loader.i18n.Game['tutorial_00' + '_portrait'];
        }
        //var line0 = loader.i18n.Game.tutorial_00;
        var linesOfLine0 = line0.split(regWrap);

        handleTutorialContent(gr.lib._tutorialPage_00_Text_00, linesOfLine0);
    }
    function setVerticalCenterTxt(textContainer, textValue) {
        textContainer.setText(textValue);
        var fontSize = parseInt(textContainer._currentStyle._font._size);
        var txtWidth = Number(textContainer.pixiContainer.$text.width);
        var boxWidth = Number(textContainer._currentStyle._width);
        while (txtWidth > boxWidth) {
            fontSize--;
            if (fontSize < 10) {
                break;
            }
            textContainer.updateCurrentStyle({
                '_font': {
                    '_size': fontSize
                }
            });
            txtWidth = Number(textContainer.pixiContainer.$text.width);
        }
        var txtHeight = Number(textContainer.pixiContainer.$text.height);
        var boxHeight = Number(textContainer._currentStyle._height);
        while (txtHeight > boxHeight) {
            fontSize--;
            if (fontSize < 10) {
                break;
            }
            textContainer.updateCurrentStyle({
                '_font': {
                    '_size': fontSize
                }
            });
            txtHeight = Number(textContainer.pixiContainer.$text.height);
        }
    }
    function enableConsole() {
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: {"name": "howToPlay", "event": "enable", "params": [1]}
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: {"name": "paytable", "event": "enable", "params": [1]}
        });
    }

    function disableConsole() {
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: {"name": "howToPlay", "event": "enable", "params": [0]}
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: {"name": "paytable", "event": "enable", "params": [0]}
        });
    }
    msgBus.subscribe('jLotterySKB.reset', function () {
        onEnableUI();
    });
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('enableButtonInfo', enableButtonInfo);
    msgBus.subscribe('disableButtonInfo', disableButtonInfo);
    return {};
});
