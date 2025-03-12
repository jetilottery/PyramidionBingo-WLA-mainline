define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/gameUtils',
    'game/configController'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    var count = 0;
    var buttonMTM;
    var inGame = false;
    var inResult = false;

    function enableButton() {
        if ((SKBeInstant.config.wagerType === 'BUY') || (Number(SKBeInstant.config.jLotteryPhase) === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
        } else {
            //0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
            //1..N: number of demo wagers before showing Move-To-Money-Button.
            //(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
            //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
            if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)) {
                gr.lib._buy.show(false);
                gr.lib._try.show(true);
                if (inResult) {
                    if (SKBeInstant.getGameOrientation() === 'landscape') {
                        if (isShowResultDialog()) {
                            gr.lib._buttonMTM.show(true);
                        } else {
                            //
                        }
                    } else {
                        gr.lib._buttonMTM.show(true);
                    }
                } else {
                    gr.lib._buttonMTM.show(true);
                }
            } else {
                gr.lib._buy.show(true);
                gr.lib._try.show(false);
            }
        }
    }

    function onStartUserInteraction() {
        inGame = true;
        inResult = false;
        if (SKBeInstant.config.gameType === 'normal') {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
        }
    }

    function onReStartUserInteraction() {
        inGame = true;
        inResult = false;
        gr.lib._buy.show(true);
        gr.lib._try.show(false);

    }

    function onDisableUI() {
        gr.lib._buttonMTM.show(false);
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true};
        buttonMTM = new gladButton(gr.lib._buttonMTM, config.gladButtonImgName.buttonMTM, scaleType);
        buttonMTM.show(false);
        if (config.textAutoFit.MTMText) {
            gr.lib._MTMText.autoFontFitText = config.textAutoFit.MTMText.isAutoFit;
        }

        gr.lib._MTMText.setText(loader.i18n.Game.button_move2moneyGame);
        if (config.style.MTMText) {
            gameUtils.setTextStyle(gr.lib._MTMText, config.style.MTMText);
        }
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._MTMText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }

        if (gr.lib._tryText) {
            gameUtils.keepSameSizeWithMTMText(gr.lib._tryText, gr);
        }
        if (gr.lib._playAgainMTMText) {
            gameUtils.keepSameSizeWithMTMText(gr.lib._playAgainMTMText, gr);
        }
        if (SKBeInstant.config.wagerType === 'BUY') {
            //don't match text size
        } else {
            if (gr.lib._simPlayAgainButtonText) {
                gameUtils.keepSameSizeWithMTMText(gr.lib._simPlayAgainButtonText, gr);
            }
            if (gr.lib._simpleNoWinText) {
                gameUtils.keepSameSizeWithMTMText(gr.lib._simpleNoWinText, gr);
            }
        }
        function clickMTM() {
            gr.lib._try.show(false);
            SKBeInstant.config.wagerType = 'BUY';
            msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
            if (config.audio && config.audio.ButtonMoveToMoney) {
                audio.play(config.audio.ButtonMoveToMoney.name, config.audio.ButtonMoveToMoney.channel);
            }
        }
        buttonMTM.click(clickMTM);
    }

    function onBeginNewGame() {
        count++;
        inGame = false;
        inResult = true;
        if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
            enableButton();
        }
    }

    function onReInitialize() {
        inGame = false;
        inResult = false;
        if (gr.lib._tutorial.pixiContainer.visible) {
            return;
        }
        enableButton();
    }

    function onTutorialIsShown() {
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
    }

    function onTutorialIsHide() {
        if (inGame) {
            gr.lib._buy.show(true);
            gr.lib._try.show(false);
        } else {
            enableButton();
        }
    }

    function onDisableButton() {
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
    }

    function onPlayerWantsPlayAgain() {
        inResult = false;
        enableButton();
    }

    function isShowResultDialog() {
        let isShowDialog = false;
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showResultScreen === true) {
                isShowDialog = true;
            }
        } else if (loader.i18n.gameConfig && loader.i18n.gameConfig.showResultScreen === true) {
            isShowDialog = true;
        }
        return isShowDialog;
    }

    msgBus.subscribe('jLotterySKB.reset', function () {
        inGame = false;
        inResult = false;
        enableButton();
    });
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);

    msgBus.subscribe('disableButton', onDisableButton);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);

    return {};
});