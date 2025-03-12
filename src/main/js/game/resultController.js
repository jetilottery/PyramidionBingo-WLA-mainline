define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/gameUtils',
    'game/configController',
    'game/particle/winSym1BoomParticles',
    'game/particle/winSym3BoomParticles'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config, winSym1BoomParticles, winSym3BoomParticles) {
    var count = 0;
    var winClose, nonWinClose, simpleNoWinButton, simPlayAgainButton, simWinMTMButton, simNoWinMTMButton;
    var resultData = null;
    var resultPlaque = null;
    var showpPlaqueDialog = false;
    var randomBubbles1 = null;
    var randomBubbles3 = null;
    var gameStaticModel = {
        'landscape': {
            '_left': 420,
            '_top': 345
        },
        'portrait': {
            '_left': 413,
            '_top': 350
        }
    };
    var gameStaticModelDialog = {
        'landscape': {
            '_left': 471,
            '_top': 590
        },
        'portrait': {
            '_left': 390,
            '_top': 690
        }
    };

    function playAgainButton() {
        if (config.audio && config.audio.ButtonPlayAgain) {
            audio.play(config.audio.ButtonPlayAgain.name, config.audio.ButtonPlayAgain.channel);
        }
        msgBus.publish('playerWantsPlayAgain');
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true};
        winClose = new gladButton(gr.lib._buttonWinClose, config.gladButtonImgName.buttonWinClose, scaleType);
        nonWinClose = new gladButton(gr.lib._buttonNonWinClose, config.gladButtonImgName.buttonNonWinClose, scaleType);

        winClose.click(closeResultPlaque);
        nonWinClose.click(closeResultPlaque);



        if (config.textAutoFit.win_Text) {
            gr.lib._win_Text.autoFontFitText = config.textAutoFit.win_Text.isAutoFit;
        }

        if (config.textAutoFit.win_Try_Text) {
            gr.lib._win_Try_Text.autoFontFitText = config.textAutoFit.win_Try_Text.isAutoFit;
        }

        if (config.textAutoFit.win_Value) {
            gr.lib._win_Value.autoFontFitText = config.textAutoFit.win_Value.isAutoFit;
        }

        if (config.textAutoFit.closeWinText) {
            gr.lib._closeWinText.autoFontFitText = config.textAutoFit.closeWinText.isAutoFit;
        }

        if (config.textAutoFit.nonWin_Text) {
            gr.lib._nonWin_Text.autoFontFitText = config.textAutoFit.nonWin_Text.isAutoFit;
        }

        if (config.textAutoFit.closeNonWinText) {
            gr.lib._closeNonWinText.autoFontFitText = config.textAutoFit.closeNonWinText.isAutoFit;
        }

        if (config.textAutoFit.simpleWinText) {
            gr.lib._simpleWinText.autoFontFitText = config.textAutoFit.simpleWinText.isAutoFit;
        }

        if (config.textAutoFit.simpleWinTryText) {
            gr.lib._simpleWinTryText.autoFontFitText = config.textAutoFit.simpleWinTryText.isAutoFit;
        }

        if (config.textAutoFit.simpleWinValue) {
            gr.lib._simpleWinValue.autoFontFitText = config.textAutoFit.simpleWinValue.isAutoFit;
        }

        if (config.textAutoFit.playAgainText) {
            gr.lib._simPlayAgainButtonText.autoFontFitText = config.textAutoFit.playAgainText.isAutoFit;
            gr.lib._simpleNoWinText.autoFontFitText = config.textAutoFit.playAgainText.isAutoFit;
        }

        if (SKBeInstant.config.wagerType === 'TRY') {
            if (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1) {
                gr.lib._win_Try_Text.setText(loader.i18n.Game.message_anonymousTryWin);
                gr.lib._simpleWinTryText.setText(loader.i18n.Game.simple_anonymousTrywin);
            } else {
                gr.lib._win_Try_Text.setText(loader.i18n.Game.message_tryWin);
                gr.lib._simpleWinTryText.setText(loader.i18n.Game.simple_trywin);
            }
        }

        gr.lib._win_Text.setText(loader.i18n.Game.message_buyWin);
        gr.lib._simpleWinText.setText(loader.i18n.Game.simple_buywin);

        if (config.style.win_Text) {
            gameUtils.setTextStyle(gr.lib._win_Text, config.style.win_Text);
        }

        if (config.style.win_Try_Text) {
            gameUtils.setTextStyle(gr.lib._win_Try_Text, config.style.win_Try_Text);
        }
        if (config.style.win_Value) {
            gameUtils.setTextStyle(gr.lib._win_Value, config.style.win_Value);
        }

        if (config.style.closeWinText) {
            gameUtils.setTextStyle(gr.lib._closeWinText, config.style.closeWinText);
        }

        if (config.style.simpleWinText) {
            gameUtils.setTextStyle(gr.lib._simpleWinText, config.style.simpleWinText);
        }

        if (config.style.simpleWinTryText) {
            gameUtils.setTextStyle(gr.lib._simpleWinTryText, config.style.simpleWinTryText);
        }

        if (config.style.simpleWinValue) {
            gameUtils.setTextStyle(gr.lib._simpleWinValue, config.style.simpleWinValue);
        }

        if (config.style.nonWin_Text) {
            gameUtils.setTextStyle(gr.lib._nonWin_Text, config.style.nonWin_Text);
        }

        if (config.style.closeNonWinText) {
            gameUtils.setTextStyle(gr.lib._closeNonWinText, config.style.closeNonWinText);
        }

        if (config.style.win_Value_color) {
            gameUtils.setTextStyle(gr.lib._win_Value, config.style.win_Value_color);
        }
        isShowResultDialog();

        if (config.style.playAgainText) {
            gameUtils.setTextStyle(gr.lib._simPlayAgainButtonText, config.style.playAgainText);
            gameUtils.setTextStyle(gr.lib._simpleNoWinText, config.style.playAgainText);
        }

        gr.lib._closeWinText.setText(loader.i18n.Game.message_close);
        gr.lib._nonWin_Text.setText(loader.i18n.Game.message_nonWin);
        gr.lib._closeNonWinText.setText(loader.i18n.Game.message_close);

        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._simPlayAgainButtonText.setText(loader.i18n.Game.button_playAgain);
            gr.lib._simpleNoWinText.setText(loader.i18n.Game.button_playAgain);
        } else {
            gr.lib._simPlayAgainButtonText.setText(loader.i18n.Game.button_MTMPlayAgain);
            gr.lib._simpleNoWinText.setText(loader.i18n.Game.button_MTMPlayAgain);
            if (gr.lib._MTMText) {
                gameUtils.keepSameSizeWithMTMText(gr.lib._simPlayAgainButtonText, gr);
                gameUtils.keepSameSizeWithMTMText(gr.lib._simpleNoWinText, gr);
            }
        }

        simPlayAgainButton = new gladButton(gr.lib._simPlayAgainButton, config.gladButtonImgName.buttonPlayAgain, scaleType);
        simPlayAgainButton.click(playAgainButton);

        simpleNoWinButton = new gladButton(gr.lib._simpleNoWinButton, config.gladButtonImgName.buttonPlayAgain, scaleType);
        simpleNoWinButton.click(playAgainButton);

        //MOVE TO MONEY button
        simWinMTMButton = new gladButton(gr.lib._simWinMTMButton, config.gladButtonImgName.buttonMTM, scaleType);
        simWinMTMButton.show(false);
        simWinMTMButton.click(clickMTM);

        simNoWinMTMButton = new gladButton(gr.lib._simNoWinMTMButton, config.gladButtonImgName.buttonMTM, scaleType);
        simNoWinMTMButton.show(false);
        simNoWinMTMButton.click(clickMTM);

        if (config.textAutoFit.MTMText) {
            gr.lib._simWinMTMButtonTX.autoFontFitText = config.textAutoFit.MTMText.isAutoFit;
            gr.lib._simNoWinMTMButtonTX.autoFontFitText = config.textAutoFit.MTMText.isAutoFit;
        }

        gr.lib._simWinMTMButtonTX.setText(loader.i18n.Game.button_move2moneyGame);
        gr.lib._simNoWinMTMButtonTX.setText(loader.i18n.Game.button_move2moneyGame);

        if (config.style.MTMText) {
            gameUtils.setTextStyle(gr.lib._simWinMTMButtonTX, config.style.MTMText);
            gameUtils.setTextStyle(gr.lib._simNoWinMTMButtonTX, config.style.MTMText);
        }
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._simWinMTMButtonTX, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._simNoWinMTMButtonTX, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }

        gr.lib._simpleWinText.on('click', hideTotalWinText);
        gr.lib._simpleWinText.pixiContainer.cursor = "pointer";
        gr.lib._simpleWinTryText.on('click', hideTotalWinText);
        gr.lib._simpleWinTryText.pixiContainer.cursor = "pointer";
        gr.lib._simpleWinValue.on('click', hideTotalWinText);
        gr.lib._simpleWinValue.pixiContainer.cursor = "pointer";

        hideDialog();
    }

    function closeResultPlaque() {
        gr.lib._BG_dim.show(false);
        hideDialog();
        if (config.audio && config.audio.ButtonGeneric) {
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        }
        // Publish a message when result dialog is closed by user.
        // 21.june 5:50
        msgBus.publish('resultDialogClosed');
    }

    function clickMTM() {
        gr.lib._try.show(false);
        SKBeInstant.config.wagerType = 'BUY';
        msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
        if (config.audio && config.audio.ButtonMoveToMoney) {
            audio.play(config.audio.ButtonMoveToMoney.name, config.audio.ButtonMoveToMoney.channel);
        }
    }

    function hideTotalWinText() {
        gr.lib._simpleWinDim.show(false);
        gr.lib._simpleWinText.show(false);
        gr.lib._simpleWinTryText.show(false);
        gr.lib._simpleWinValue.show(false);
        winSym1BoomParticles.stopBubbleEmitter();
        msgBus.publish('resultDialogClosed');
    }

    function hideDialog() {
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
        gr.lib._simpleWin.show(false);
        gr.lib._simpleNoWin.show(false);
    }

    function showWinResultScreen() {
        gr.lib._BG_dim.show(true);
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._win_Try_Text.show(false);
            gr.lib._win_Text.show(true);
        } else {
            gr.lib._win_Try_Text.show(true);
            gr.lib._win_Text.show(false);
        }
        gr.lib._win_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
        gr.lib._winPlaque.show(true);
        gr.lib._nonWinPlaque.show(false);

        var orientation = SKBeInstant.getGameOrientation();
        randomBubbles3 = winSym3BoomParticles.getBubbleEmitter();
        randomBubbles3.updateSpawnPos(gameStaticModelDialog[orientation]._left, gameStaticModelDialog[orientation]._top);
        winSym3BoomParticles.startBubbleEmitter();

        msgBus.publish('standardWinShown');
    }

    function showSimpleWin() {
        //gr.lib._BG_dim.show(true);
        gr.lib._simPlayAgainButton.show(false);
        gr.lib._simWinMTMButton.show(false);
        gr.lib._simpleWinDim.show(true);
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._simpleWinText.show(true);
            gr.lib._simpleWinTryText.show(false);
        } else {
            gr.lib._simpleWinTryText.show(true);
            gr.lib._simpleWinText.show(false);
        }
        gr.lib._simpleWinValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
        gr.lib._simpleWinValue.show(true);
        gr.lib._simpleWin.show(true);
        gr.lib._simpleNoWin.show(false);

        var orientation = SKBeInstant.getGameOrientation();
        randomBubbles1 = winSym1BoomParticles.getBubbleEmitter();
        randomBubbles1.updateSpawnPos(gameStaticModel[orientation]._left, gameStaticModel[orientation]._top);
        winSym1BoomParticles.startBubbleEmitter();

        msgBus.publish('simpleWinShown');
    }

    function showNoWinResultScreen() {
        gr.lib._BG_dim.show(true);
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(true);
    }

    function showSimpleNoWin() {
        //gr.lib._BG_dim.show(true);
        gr.lib._simpleNoWinButton.show(false);
        gr.lib._simNoWinMTMButton.show(false);
        gr.lib._simpleWin.show(false);
        gr.lib._simpleNoWin.show(true);
    }

    function isShowResultDialog() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showResultScreen === true) {
                showpPlaqueDialog = true;
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.showResultScreen === true) {
                showpPlaqueDialog = true;
            }
        }
    }

    function showDialog() {
        if (resultData.playResult === 'WIN') {
            if (showpPlaqueDialog) {
                showWinResultScreen();
            } else {
                showSimpleWin();
            }
        } else {
            if (showpPlaqueDialog) {
                showNoWinResultScreen();
            } else {
                showSimpleNoWin();
            }
        }
    }

    function onStartUserInteraction(data) {
        resultData = data;
        //  gr.lib._BG_dim.show(false);
        hideDialog();
    }

    function onAllRevealed() {
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });

        msgBus.publish('disableUI');
    }

    function onEnterResultScreenState() {
        showDialog();
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        gr.lib._simPlayAgainButtonText.setText(loader.i18n.Game.button_playAgain);
        gr.lib._simpleNoWinText.setText(loader.i18n.Game.button_playAgain);
    }


    function onPlayerWantsPlayAgain() {
        if (resultData.playResult === 'WIN') {
            if (showpPlaqueDialog) {
                winSym3BoomParticles.stopBubbleEmitter();
            } else {
                winSym1BoomParticles.stopBubbleEmitter();
            }
        }
        gr.lib._BG_dim.show(false);
        hideDialog();
    }

    function onTutorialIsShown() {
        if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultPlaque = gr.lib._winPlaque.pixiContainer.visible ? gr.lib._winPlaque : gr.lib._nonWinPlaque;
            hideDialog();
        } else if (gr.lib._simpleWin.pixiContainer.visible || gr.lib._simpleNoWin.pixiContainer.visible) {
            resultPlaque = gr.lib._simpleWin.pixiContainer.visible ? gr.lib._simpleWin : gr.lib._simpleNoWin;
            hideDialog();
        }
        gr.lib._BG_dim.show(true);
    }

    function onTutorialIsHide() {
        if (resultPlaque) {
            resultPlaque.show(true);
            if (resultData.playResult === 'WIN') {
                // gr.lib._fire.gotoAndPlay('fire', 0.5, true);
            }
            resultPlaque = null;
        }
    }

    function onBeginNewGame() {
        count++;
        if (Number(SKBeInstant.config.jLotteryPhase) === 2) {
            if (SKBeInstant.getGameOrientation() === 'landscape') {
                if (!isShowResultDialog()) {
                    if (resultData.playResult === 'WIN') {
                        gr.lib._simPlayAgainButton.show(true);
                    } else {
                        gr.lib._simpleNoWinButton.show(true);
                    }
                }
            }
        }
        if ((SKBeInstant.config.wagerType === 'BUY') || (Number(SKBeInstant.config.jLotteryPhase) === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
            //
        } else {
            //0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
            //1..N: number of demo wagers before showing Move-To-Money-Button.
            //(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
            //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
            if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)) {
                if (SKBeInstant.getGameOrientation() === 'landscape') {
                    if (!isShowResultDialog()) {
                        if (resultData.playResult === 'WIN') {
                            gr.lib._simWinMTMButton.show(true);
                        } else {
                            gr.lib._simNoWinMTMButton.show(true);
                        }
                    }
                }
            }
        }
    }

    function onPlayerWantsToMoveToMoneyGame() {
        gr.lib._BG_dim.show(false);
        hideDialog();
        gr.lib._simPlayAgainButtonText.setText(loader.i18n.Game.button_playAgain);
        gr.lib._simpleNoWinText.setText(loader.i18n.Game.button_playAgain);
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);

    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('allRevealed', onAllRevealed);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
    return {};
});