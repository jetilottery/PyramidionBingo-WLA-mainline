/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['skbJet/component/gladPixiRenderer/Sprite',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/configController',
    'game/splashUtil',
    'com/pixijs/pixi',
    'com/pixijs/pixi-spine',
    'game/gameUtils',
    'skbJet/component/resourceLoader/resourceLib'
], function (Sprite, msgBus, audio, gr, SKBeInstant, gladButton, loader, config, splashUtil, PIXI, PixiSpine, gameUtils, resLib) {

    //revealdatasave data：numList、lineLetter、speed
    let json_rds;
    let ticketId = null;
    let revealDataExist = false;
    let revealPrizeTableValue = [];

    let encircleFlashTime = 0.25;
    let corssLightTime = 0.25;
    let shockWaveTime = 0.35;
    let colorWaveTime = 0.25;
    let encircleFlashFirstTime = true;
    let shuffleAnimTime = 0.2;
    let windowShakeSpeed = 30;

    let buttonShuffle;
    let buttonPrizes;
    let buttonContinue;
    let buttonSpeed;
    let buttonDraw;

    let winValue = 0;
    let prizeValue = 0;
    let errorOn = false;

    let prizeTable = {};
    let prizeLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    let allLineLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    let colorArray = ["Red", "Green", "Yellow", "Blue"];
    let positionArray = ["T", "L", "B", "R"];
    let shuffleBrokenArray = ["redBroken", "greenBroken", "yellowBroken", "blueBroken"];
    let DrawBrokenImage = ['DrawBrokenRed', 'DrawBrokenGreen', 'DrawBrokenYellow', 'DrawBrokenBlue'];
    let baseTextColor = [
        {"_color": "692145", "_strokeColor": "fee5e5"},
        {"_color": "134f1e", "_strokeColor": "eaffed"},
        {"_color": "512c0f", "_strokeColor": "fff7ed"},
        {"_color": "1f345c", "_strokeColor": "f2f6ff"},
        {"_color": "823c5a", "_strokeColor": "fff2f3"},
        {"_color": "275f24", "_strokeColor": "e8ffef"},
        {"_color": "7b471d", "_strokeColor": "fff9ed"},
        {"_color": "123a96", "_strokeColor": "edf6ff"},
        {"_color": "843141", "_strokeColor": "fff5ef"},
        {"_color": "1c6d4b", "_strokeColor": "ebfffc"},
        {"_color": "725530", "_strokeColor": "fffded"},
        {"_color": "2a2d80", "_strokeColor": "eef9ff"},
        {"_color": "853c61", "_strokeColor": "ffffff"},
        {"_color": "367d48", "_strokeColor": "e0fbff"},
        {"_color": "8d5f1e", "_strokeColor": "ffffff"},
        {"_color": "455591", "_strokeColor": "ffffff"}
    ];
    let winTextColor = {"_color": "ffffff", "_strokeColor": "256e9a"};
    let textStrokenColorDark = ['f788c7', 'a4eea1', 'efba7e', '8fb6f2', 'faa6d6', 'a4eea1', 'fdcc9d', 'aec9fa', 'ffa3b8', '8ff6c9', 'f9e2a1', 'a8abf1', 'fac9d4', 'c1fbca', 'ffedd0', 'c3d0f8'];
    //1、setup an array, witch contains sixteen object
    //2、every object contains：state(true: match false:nomatch)、numList(all numbers of one line)、price(price of line)、lineLetter(letter of line)
    let gridSymbolLineMap = [];
    let allGridSymbolNum = [];
    let drawGridSymbolNum = [];
    let drawGridSymbolTotal = 0;
    let drawGridSymbolCount = 0;

    let speedController = 2;
    let currentDrawSpeed = 2, currentDrawSymbolIndex = 0;

    let reStartUserInteractionBool = false;
    let start = null;
    let stoneIndex = 1;//1-16
    let showState = 1; //1:buy  2:prize 3:continue

    let spriteSheetAnimationMap;
    let lightAnimFir = null, lightAnimSec = null, lightAnimThir = null;
    let lightAnimFirEnd = true, lightAnimSecEnd = true, lightAnimThirEnd = true;
    let lineNumber1 = 0, colNumber1 = 0, lineNumber2 = 0, colNumber2 = 0, lineNumber3 = 0, colNumber3 = 0;
    let lightOriginHeight, lightOriginWidth, lightOriginX, lightOriginY;

    let drawAnimPauseBool = false;
    let drawAnimStartBool = false;
    let drawGridSymbolInterval = null;

    var spineStaticAnimName = null, spineInAnimName = null, spineOutAnimName = null;
    let backgroundInAnim = null, backgroundOutAnim = null, backgroundStaticAnim = null;
    let spineStyle = null;

    let encircleFlashInterval = null;

    let LineWinChannel = 0;

    let setPrizeTableStyle = false;
    let revealedAll = false;

    let revealAnimPlayRate = 0.5; //default revealAnimPlayRate
    let fourSpeedAllreveal = false;
    let intervalTime = 300;

    function onGameParametersUpdated() {
        json_rds = {
            revealDataSave: {},
            wagerDataSave: {},
            spots: 0,
            amount: 0
        };

        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true};

        if (config.textAutoFit.shuffleText) {
            gr.lib._shuffleText.autoFontFitText = config.textAutoFit.shuffleText.isAutoFit;
        }
        gr.lib._shuffleText.setText(loader.i18n.Game.button_shuffle);
        buttonShuffle = new gladButton(gr.lib._buttonShuffle, config.gladButtonImgName.buttonShuffle, scaleType);
        buttonShuffle.show(false);
        buttonShuffle.click(function () {
            if (config.audio && config.audio.ButtonShuffle) {
                audio.play(config.audio.ButtonShuffle.name, config.audio.ButtonShuffle.channel);
            }
            onShuffle();
        });

        if (config.textAutoFit.prizesText) {
            gr.lib._prizesText.autoFontFitText = config.textAutoFit.prizesText.isAutoFit;
        }
        gr.lib._prizesText.setText(loader.i18n.Game.button_prizes);
        buttonPrizes = new gladButton(gr.lib._buttonPrizes, config.gladButtonImgName.buttonPrizes, scaleType);
        buttonPrizes.show(false);
        buttonPrizes.click(function () {
            if (config.audio && config.audio.ButtonPrize) {
                audio.play(config.audio.ButtonPrize.name, config.audio.ButtonPrize.channel);
            }
            onPrizes();
        });

        if (config.textAutoFit.continueText) {
            gr.lib._continueText.autoFontFitText = config.textAutoFit.continueText.isAutoFit;
        }
        gr.lib._continueText.setText(loader.i18n.Game.button_continue);
        buttonContinue = new gladButton(gr.lib._buttonContinue, config.gladButtonImgName.buttonContinue, scaleType);
        buttonContinue.show(false);
        buttonContinue.click(function () {
            if (config.audio && config.audio.ButtonContinue) {
                audio.play(config.audio.ButtonContinue.name, config.audio.ButtonContinue.channel);
            }
            onContinue();
        });

        if (config.textAutoFit.speedText) {
            gr.lib._speedText.autoFontFitText = config.textAutoFit.speedText.isAutoFit;
        }
        gr.lib._speedText.setText(loader.i18n.Game.button_speed);
        buttonSpeed = new gladButton(gr.lib._buttonSpeed, config.gladButtonImgName.buttonSpeed, scaleType);
        buttonSpeed.show(false);
        buttonSpeed.click(function () {
            onSpeedController();
        });

        if (config.textAutoFit.drawText) {
            gr.lib._drawText.autoFontFitText = config.textAutoFit.drawText.isAutoFit;
        }
        gr.lib._drawText.setText(loader.i18n.Game.button_draw);
        buttonDraw = new gladButton(gr.lib._buttonDraw, config.gladButtonImgName.buttonDraw, scaleType);
        buttonDraw.show(false);
        buttonDraw.click(function () {
            onStartRevealAll();
        });
        gr.lib._drawAnim.show(false);
        playDrawButtonSpineAnim();

        if (config.textAutoFit.meterDrawsText) {
            gr.lib._MeterDrawsText.autoFontFitText = config.textAutoFit.meterDrawsText.isAutoFit;
        }
        gr.lib._MeterDrawsText.setText(loader.i18n.Game.meterDrawsText);
        if (config.textAutoFit.meterDrawsNum) {
            gr.lib._MeterDrawsNum.autoFontFitText = config.textAutoFit.meterDrawsNum.isAutoFit;
        }
        gr.lib._MeterDrawsNum.setText(loader.i18n.Game.meterDrawsNum);
        gr.lib._MeterDraws.show(false);

        gr.lib._BackgroundInAnim.show(false);
        gr.lib._BackgroundStaticAnim.show(false);
        gr.lib._BackgroundOutAnim.show(false);

        gr.lib._powerBallLightAnim.show(false);
        if (config.textAutoFit.powerBallText) {
            gr.lib._powerBallText2.autoFontFitText = config.textAutoFit.powerBallText.isAutoFit;
            gr.lib._powerBallText.autoFontFitText = config.textAutoFit.powerBallText.isAutoFit;
        }
        gr.lib._powerBallText2.setText(' ');
        gr.lib._powerBallText.setText(' ');
        if (config.style.powerBallText) {
            gameUtils.setTextStyle(gr.lib._powerBallText2, config.style.powerBallText);
            //gameUtils.setTextStyle(gr.lib._powerBallText, config.style.powerBallText);
        }
        gr.lib._centreAnim.show(false);

        for (let i = 1; i <= 16; i++) {
            gr.lib['_prizeTableBoard_' + i].show(true);
        }

        gr.lib._OpeningAnimFront.show(true);
        gr.lib._corssLight.show(false);
        gr.lib._shockWave.show(false);
        gr.lib._colorWave.show(false);
        for (let i = 1; i < 9; i++) {
            gr.lib['_encircleFlash' + i].show(false);
        }

        getDefaultRevealAnimRate();
        iSFourSpeedAllreveal();
        if (revealAnimPlayRate >= 0.1 && revealAnimPlayRate <= 1) {
            intervalTime = Number((100 / (revealAnimPlayRate * 100)) * 1000 / 60 * 9);
        }

        createLightAnim();
        addGridSymbolShuffle();
        addGridSymbolDraw();
        addGridSymbolLight();
        addGridSymbolPattenLight();
        addGridSymbolBreathAnim();
        setGridSymbolInit();
        setComplete();
        //create an array contains 1 to 100 numbers
        allGridSymbolNum = [];
        for (let i = 0; i < 100; i++) {
            allGridSymbolNum[i] = i + 1;
        }

        var orientation = SKBeInstant.getGameOrientation();
        if (orientation === 'landscape') {
            spineStaticAnimName = 'land_modifierTriggerStatic';
            spineInAnimName = 'land_modifierTrigger_IN';
            spineOutAnimName = 'land_modifierTrigger_OUT';
            spineStyle = {x: -240, y: -135, scaleX: 1, scaleY: 1};
        } else {
            spineStaticAnimName = 'land_modifierTriggerStatic_Portrait';
            spineInAnimName = 'land_modifierTrigger_IN_Portrait';
            spineOutAnimName = 'land_modifierTrigger_OUT_Portrait';
            spineStyle = {x: -555, y: 74, scaleX: 1, scaleY: 1};
        }

        setStoneBreathInterval();
    }

    //sort an array randomly
    function randomSortNum(arr) {
        let arrLength = arr.length;
        for (let i = 0; i < arrLength; i++) {
            let index = Math.floor(Math.random() * (arrLength - i)) + i;
            if (index !== i) {
                let temp = arr[i];
                arr[i] = arr[index];
                arr[index] = temp;
            }
        }
    }

    function onShuffle() {
        stopEncircleFlashAnim();
        //disable butons
        buttonShuffle.enable(false);
        buttonPrizes.enable(false);
        buttonContinue.enable(false);
        buttonSpeed.enable(false);
        msgBus.publish('disableButtonInfo');
        gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._buttonPrizes.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._buttonContinue.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._shuffleText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._prizesText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._continueText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._speedText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        if (showState === 1 || showState === 3) {
            buttonDraw.enable(false);
            gr.lib._buttonDraw.updateCurrentStyle({"_opacity": "0.6"});
            gr.lib._drawText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
            gr.lib._drawAnim.show(false);
        }

        allLineLetter = [];
        let firstLineLetter = ['A', 'B', 'C', 'D'];
        let secondLineLetter = ['E', 'F', 'G', 'H'];
        let thirdLineLetter = ['I', 'J', 'K', 'L'];
        let forthLineLetter = ['M', 'N', 'O', 'P'];

        //random the symbol number
        randomSortNum(allGridSymbolNum);
        //random the line letter
        randomSortNum(firstLineLetter);
        randomSortNum(secondLineLetter);
        randomSortNum(thirdLineLetter);
        randomSortNum(forthLineLetter);
        allLineLetter = firstLineLetter.concat(secondLineLetter.concat(thirdLineLetter.concat(forthLineLetter)));

        let arrIndex = 0;
        let colNum = 0;
        for (let i = 0; i < 16; i++) {
            let singleLineNumList = [];
            let singleLineNumState = [];
            switch (Math.floor(i / 4)) {
                case 0:
                {
                    colNum = 9;
                    break;
                }
                case 1:
                {
                    colNum = 7;
                    break;
                }
                case 2:
                {
                    colNum = 5;
                    break;
                }
                case 3:
                {
                    colNum = 4;
                    break;
                }
            }
            for (let j = 0; j < colNum; j++) {
                singleLineNumList[j] = allGridSymbolNum[arrIndex++];
                singleLineNumState[j] = false;
                gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].setText(singleLineNumList[j]);
                gr.lib["_BaseWinLineTX_" + (i + 1) + "_" + j].setText(singleLineNumList[j]);
                gr.lib['_BaseLineShuffle_' + (i + 1) + '_' + j].show(true);
                gr.lib['_BaseLineShuffle_' + (i + 1) + '_' + j].gotoAndPlay(shuffleBrokenArray[Math.floor(i % 4)], shuffleAnimTime);
            }
            gridSymbolLineMap[i].numList = singleLineNumList;
            gridSymbolLineMap[i].numState = singleLineNumState;
            gridSymbolLineMap[i].lineLetter = allLineLetter[i];
            gridSymbolLineMap[i].price = prizeTable[allLineLetter[i]];
            gr.lib["_prizeTableBoard_" + (i + 1)].setText(SKBeInstant.formatCurrency(prizeTable[allLineLetter[i]]).formattedAmount);
        }
    }

    function playAllAnimation(timestamp) {
        if (!start) {
            start = timestamp;
        }
        if (stoneIndex > 16) {
            if (showState === 1) {
                let colNum = 0;
                for (let i = 0; i < 16; i++) {
                    switch (Math.floor(i / 4)) {
                        case 0:
                        {
                            colNum = 9;
                            break;
                        }
                        case 1:
                        {
                            colNum = 7;
                            break;
                        }
                        case 2:
                        {
                            colNum = 5;
                            break;
                        }
                        case 3:
                        {
                            colNum = 4;
                            break;
                        }
                    }
                    for (let j = 0; j < colNum; j++) {
                        gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].show(true);
                        gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].updateCurrentStyle({"_transform": {"_scale": {"_x": "1", "_y": "1"}}});
                    }
                }
                //enable basegame
                if (SKBeInstant.config.gameType === 'ticketReady') {
                    if (reStartUserInteractionBool) {
                        gr.lib._buttonInfo.show(true);
                    }
                } else {
                    gr.lib._buttonInfo.show(true);
                }
                playEncircleFlashAnim();
                enableButtons();
                buttonDraw.enable(true);
                gr.lib._buttonDraw.updateCurrentStyle({"_opacity": "1"});
                gr.lib._drawText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
                gr.lib._drawAnim.show(true);

                for (let i = 0; i < speedController; i++) {
                    gr.lib['_speed_0' + i].updateCurrentStyle({"_opacity": "1"});
                    gr.lib['_speed_0' + i].show(true);
                }
                for (let i = speedController, j = 1; j <= (4 - speedController); j++, i++) {
                    gr.lib['_speed_0' + i].show(false);
                }
                gr.animMap['_speed_0' + (speedController - 1) + 'Anim'].play();

                gr.lib._MeterDrawsIcon.updateCurrentStyle({'_background': {'_imagePlate': 'DrawsMeterIconI'}});
                gr.lib._MeterDraws.show(true);
            } else if (showState === 3) {
                if (drawAnimStartBool) {
                    for (let i = 0; i < gridSymbolLineMap.length; i++) {
                        if (gridSymbolLineMap[i].drawCount !== gridSymbolLineMap[i].numList.length) {
                            for (let j = 0; j < gridSymbolLineMap[i].numList.length; j++) {
                                if (gridSymbolLineMap[i].numState[j]) {
                                    gr.lib["_BaseWinLineTX_" + (i + 1) + "_" + j].show(true);
                                }
                            }
                        }
                    }
                    if (drawGridSymbolInterval) {
                        clearInterval(drawGridSymbolInterval);
                        drawGridSymbolInterval = null;
                    }
                    setDrawGridSymbolInterval();
                } else {
                    buttonDraw.show(true);
                    buttonShuffle.enable(true);
                    gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "1"});
                    gr.lib._shuffleText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
                }
                if (!drawAnimStartBool || speedController !== 4) {
                    buttonPrizes.show(true);
                }
            } else if (showState === 2) {
                if (drawAnimStartBool) {
                    for (let i = 0; i < gridSymbolLineMap.length; i++) {
                        if (gridSymbolLineMap[i].drawCount !== gridSymbolLineMap[i].numList.length) {
                            for (let j = 0; j < gridSymbolLineMap[i].numList.length; j++) {
                                if (gridSymbolLineMap[i].numState[j]) {
                                    gr.lib['_StoneDrawedLine_' + (i + 1) + '_' + j].show(true);
                                }
                            }
                        }
                    }
                }
            }
            return;
        }

        let stoneRight = '';
        if (stoneIndex > 9) {
            stoneRight = '00' + stoneIndex;
        } else {
            stoneRight = '000' + stoneIndex;
        }

        let element = null;
        let color = null;
        for (let i = 0; i < gridSymbolLineMap.length; i++) {
            let line = Math.floor(i / 4);
            let colNum = 0;
            let colMidNum = 0;
            let positionIndex = 0; //1: outer line 2:second line 3:third line 4:inner line
            let colorIndex = 0;
            if (line !== 3) {
                if (line === 0) {
                    colNum = 9;
                    colMidNum = 4;
                    positionIndex = 1;
                    colorIndex = i;
                } else if (line === 1) {
                    colNum = 7;
                    colMidNum = 3;
                    positionIndex = 2;
                    colorIndex = i - 4;
                } else if (line === 2) {
                    colNum = 5;
                    colMidNum = 2;
                    positionIndex = 3;
                    colorIndex = i - 8;
                }
                let colorPro = "";
                if (gridSymbolLineMap[i].drawCount === gridSymbolLineMap[i].numList.length) {
                    colorPro = "gold" + positionArray[colorIndex];
                } else {
                    colorPro = colorArray[colorIndex];
                }
                for (let j = 0; j < colNum; j++) {
                    element = gr.lib["_BaseLineStone_" + (i + 1) + "_" + j];
                    if (j === 0 || j === (colMidNum + 1)) {
                        color = colorPro + positionIndex + "_0_" + stoneRight;
                    } else if (j === colMidNum) {
                        color = colorPro + positionIndex + "_2_" + stoneRight;
                    } else if (j < colMidNum) {
                        color = colorPro + positionIndex + "_1_" + stoneRight;
                    } else {
                        color = colorPro + positionIndex + "_3_" + stoneRight;
                    }
                    element.updateCurrentStyle({'_background': {'_imagePlate': color}});

                    if (showState === 2 && stoneIndex === 1) {
                        gr.animMap['_stoneBaseNumOutAnim_' + (i + 1) + "_" + j].play();
                        gr.lib["_BaseWinLineTX_" + (i + 1) + "_" + j].show(false);
                    }
                    if (showState === 3 && stoneIndex === 9) {
                        gr.animMap['_stoneBaseNumInAnim_' + (i + 1) + "_" + j].play();
                    }
                    if (showState === 3 && stoneIndex === 1 && gridSymbolLineMap[i].numState[j]) {
                        gr.lib['_StoneDrawedLine_' + (i + 1) + '_' + j].show(false);
                    }
                }
            } else {
                positionIndex = 4;
                colorIndex = i - 12;
                let colorPro = "";
                if (gridSymbolLineMap[i].drawCount === gridSymbolLineMap[i].numList.length) {
                    colorPro = "gold" + positionArray[colorIndex];
                } else {
                    colorPro = colorArray[colorIndex];
                }
                for (let j = 0; j < 4; j++) {
                    element = gr.lib["_BaseLineStone_" + (i + 1) + "_" + j];
                    switch (j) {
                        case 0:
                        case 2:
                        {
                            color = colorPro + positionIndex + "_0_" + stoneRight;
                            break;
                        }
                        case 1:
                        {
                            color = colorPro + positionIndex + "_2_" + stoneRight;
                            break;
                        }
                        case 3:
                        {
                            color = colorPro + positionIndex + "_4_" + stoneRight;
                            break;
                        }
                    }
                    element.updateCurrentStyle({'_background': {'_imagePlate': color}});

                    if (showState === 2 && stoneIndex === 1) {
                        gr.animMap['_stoneBaseNumOutAnim_' + (i + 1) + "_" + j].play();
                        gr.lib["_BaseWinLineTX_" + (i + 1) + "_" + j].show(false);
                    }
                    if (showState === 3 && stoneIndex === 9) {
                        gr.animMap['_stoneBaseNumInAnim_' + (i + 1) + "_" + j].play();
                    }
                    if (showState === 3 && stoneIndex === 1 && gridSymbolLineMap[i].numState[j]) {
                        gr.lib['_StoneDrawedLine_' + (i + 1) + '_' + j].show(false);
                    }
                }
            }
        }
        stoneIndex++;
        //let progress = timestamp - start;
        //if (progress < 6000) {
        window.requestAnimationFrame(playAllAnimation);
        //}
    }

    function showPrizeTableText() {
        for (let i = 1; i <= 16; i++) {
            gr.lib['_prizeTableBoard_' + i].show(true);
            gr.animMap['_prizeTableTop1TexOnAnim_' + i].stop();
            gr.animMap['_prizeTableTop1TexOnAnim_' + i].play();
        }
        start = null;
        stoneIndex = 1;
        window.requestAnimationFrame(playAllAnimation);
    }

    function onPrizes() {
        drawAnimPauseBool = true;
        buttonPrizes.show(false);
        showState = 2;
        if (!drawAnimStartBool) {
            buttonDraw.show(false);
            buttonShuffle.enable(false);
            gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "0.6"});
            gr.lib._shuffleText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
            showPrizeTableText();
        }
    }

    function onContinue() {
        drawAnimPauseBool = false;
        buttonContinue.show(false);
        showState = 3;
        if (!drawAnimStartBool) {
            buttonShuffle.enable(false);
            gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "0.6"});
            gr.lib._shuffleText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        } else {
            msgBus.publish('disableButtonInfo');
        }
        //reset the prizeTableBoard
        for (let i = 1; i <= 16; i++) {
            if (gridSymbolLineMap[i - 1].drawCount === gridSymbolLineMap[i - 1].numList.length) {
                gr.lib['_prizeTableBoard_' + i].show(true);
                gr.animMap['_prizeTableTop1TexOnAnim_' + i].play();
            } else {
                gr.lib['_prizeTableBoard_' + i].show(false);
            }
        }

        start = null;
        stoneIndex = 1;
        window.requestAnimationFrame(playAllAnimation);
    }

    function onSpeedController() {
        buttonSpeed.enable(false);
        gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._speedText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});

        if (drawAnimStartBool && speedController === 3) {
            speedController = 4;
            if (config.audio && config.audio.ButtonSpeed4) {
                audio.play(config.audio.ButtonSpeed4.name, config.audio.ButtonSpeed4.channel);
            }

            for (let i = 0; i < 4; i++) {
                gr.lib['_speed_0' + i].show(true);
            }
            gr.animMap['_speed_0' + (speedController - 1) + 'Anim'].play();

            buttonPrizes.show(false);

            if (SKBeInstant.config.wagerType !== 'TRY') {
                json_rds.revealDataSave[ticketId].speed = speedController;
                if (errorOn) {
                    return;
                }
                publishMSG();
            }
            return;
        }

        if (speedController === 4) {
            speedController = 1;
        } else {
            speedController += 1;
        }

        if (speedController === 1) {
            if (config.audio && config.audio.ButtonSpeed1) {
                audio.play(config.audio.ButtonSpeed1.name, config.audio.ButtonSpeed1.channel);
            }
        } else if (speedController === 2) {
            if (config.audio && config.audio.ButtonSpeed2) {
                audio.play(config.audio.ButtonSpeed2.name, config.audio.ButtonSpeed2.channel);
            }
        } else if (speedController === 3) {
            if (config.audio && config.audio.ButtonSpeed3) {
                audio.play(config.audio.ButtonSpeed3.name, config.audio.ButtonSpeed3.channel);
            }
        } else if (speedController === 4) {
            if (config.audio && config.audio.ButtonSpeed4) {
                audio.play(config.audio.ButtonSpeed4.name, config.audio.ButtonSpeed4.channel);
            }
        }
        for (let i = 0; i < speedController; i++) {
            gr.lib['_speed_0' + i].show(true);
        }
        for (let i = speedController, j = 1; j <= (4 - speedController); j++, i++) {
            gr.lib['_speed_0' + i].show(false);
        }

        gr.animMap['_speed_0' + (speedController - 1) + 'Anim'].play();

        if (SKBeInstant.config.wagerType !== 'TRY' && drawAnimStartBool) {
            json_rds.revealDataSave[ticketId].speed = speedController;
            if (errorOn) {
                return;
            }
            publishMSG();
        }

        if (drawAnimStartBool && speedController !== 1) {
            gr.lib._powerBallLightAnim.show(false);
            gr.lib._powerBallText2.show(false);
            gr.lib._powerBallText.show(false);
        }

        buttonSpeed.enable(true);
        gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "1"});
        gr.lib._speedText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "5d70ff", "_color": 'fef4cf', "_gradient": {"_color": ['000000', '000000'], "_stop": [0, 1], "_type": "vertical"}}});
    }

    function onStartRevealAll() {
        msgBus.publish('disableButtonInfo');
        if (errorOn) {
            return;
        }
        if (config.audio && config.audio.ButtonDraw) {
            audio.play(config.audio.ButtonDraw.name, config.audio.ButtonDraw.channel);
        }
        drawAnimStartBool = true;
        drawGridSymbolCount = 0;
        lightAnimFirEnd = true;
        lightAnimSecEnd = true;
        lightAnimThirEnd = true;
        buttonShuffle.show(false);
        buttonDraw.show(false);
        stopEncircleFlashAnim();

        if (speedController === 4) {
            buttonPrizes.show(false);
        } else {
            buttonPrizes.enable(false);
            gr.lib._buttonPrizes.updateCurrentStyle({"_opacity": "0.6"});
            gr.lib._prizesText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        }
        buttonSpeed.enable(false);
        gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._speedText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});

        if (SKBeInstant.config.wagerType !== 'TRY') {
            //revealdatasave:save the data of selected symbol
            var arr = '';
            for (let i = 0; i < allGridSymbolNum.length; i++) {
                if (i === (allGridSymbolNum.length - 1)) {
                    arr = arr + allGridSymbolNum[i];
                } else {
                    arr = arr + allGridSymbolNum[i] + ',';
                }
            }
            json_rds.revealDataSave[ticketId].allNumbers = arr;

            var priceTable = '';
            for (let i = 0; i < allLineLetter.length; i++) {
                if (i === (allLineLetter.length - 1)) {
                    priceTable = priceTable + allLineLetter[i] + prizeTable[allLineLetter[i]];
                } else {
                    priceTable = priceTable + allLineLetter[i] + prizeTable[allLineLetter[i]] + ',';
                }
            }
            json_rds.revealDataSave[ticketId].priceTables = priceTable;
            json_rds.revealDataSave[ticketId].speed = speedController;
            if (errorOn) {
                return;
            }
            publishMSG();
        }

        if (backgroundInAnim !== null) {
            gr.lib._BackgroundInAnim.pixiContainer.removeChild(backgroundInAnim);
            backgroundInAnim = null;
        }
        gr.lib._BackgroundInAnim.show(true);
        backgroundInAnim = new PIXI.spine.Spine(resLib.spine.backgroundEffects_spine.spineData);
        backgroundInAnim.state.addAnimation(0, spineInAnimName, false, 0);
        backgroundInAnim.data = {"_name": "spineBackground"};
        backgroundInAnim.styleData = spineStyle;
        backgroundInAnim.x = spineStyle.x;
        backgroundInAnim.y = spineStyle.y;
        backgroundInAnim.scale.x = spineStyle.scaleX;
        backgroundInAnim.scale.y = spineStyle.scaleY;
        gr.lib._BackgroundInAnim.pixiContainer.addChild(backgroundInAnim);

        if (backgroundStaticAnim === null) {
            backgroundStaticAnim = new PIXI.spine.Spine(resLib.spine.backgroundEffects_spine.spineData);
            backgroundStaticAnim.state.addAnimation(1, spineStaticAnimName, true, 0);
            backgroundStaticAnim.data = {"_name": "spineBackground"};
            backgroundStaticAnim.styleData = spineStyle;
            backgroundStaticAnim.x = spineStyle.x;
            backgroundStaticAnim.y = spineStyle.y;
            backgroundStaticAnim.scale.x = spineStyle.scaleX;
            backgroundStaticAnim.scale.y = spineStyle.scaleY;
            gr.lib._BackgroundStaticAnim.pixiContainer.addChild(backgroundStaticAnim);
        }
        setTimeout(function () {
            gr.lib._BackgroundInAnim.show(false);
            gr.lib._BackgroundStaticAnim.show(true);
            gr.lib._centreAnim.show(true);
            gr.lib._powerBallLightAnim.show(false);
            gr.lib._powerBallText2.show(false);
            gr.lib._powerBallText.show(false);

            if (drawGridSymbolInterval) {
                clearInterval(drawGridSymbolInterval);
                drawGridSymbolInterval = null;
            }
            setDrawGridSymbolInterval();
            if (speedController !== 4) {
                buttonPrizes.enable(true);
                buttonSpeed.enable(true);
                gr.lib._buttonPrizes.updateCurrentStyle({"_opacity": "1"});
                gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "1"});
                gr.lib._prizesText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
                gr.lib._speedText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "5d70ff", "_color": 'fef4cf', "_gradient": {"_color": ['000000', '000000'], "_stop": [0, 1], "_type": "vertical"}}});
            }
            gr.lib._MeterDrawsIcon.updateCurrentStyle({'_background': {'_imagePlate': 'DrawsMeterIconII'}});
        }, 800);
    }

    function setDrawGridSymbolInterval() {
        drawGridSymbolInterval = setInterval(function () {
            if (errorOn) {
                if (drawGridSymbolInterval) {
                    clearInterval(drawGridSymbolInterval);
                    drawGridSymbolInterval = null;
                }
                return;
            }
            if (drawGridSymbolCount > drawGridSymbolTotal) {
                if (drawGridSymbolInterval) {
                    clearInterval(drawGridSymbolInterval);
                    drawGridSymbolInterval = null;
                }
                disableButtons();
                return;
            }
            switch (speedController) {
                case 1:
                {
                    if (lightAnimFirEnd) {
                        if (drawAnimPauseBool) {
                            //pause draw
                            if (drawGridSymbolInterval) {
                                clearInterval(drawGridSymbolInterval);
                                drawGridSymbolInterval = null;
                            }
                            msgBus.publish('drawStoped');
                        } else {
                            lightAnimFirEnd = false;
                            let currentDrawGridSymbolIndex = drawGridSymbolCount;
                            drawGridSymbolCount += 1;
                            drawOneGridSymbol(currentDrawGridSymbolIndex, true);
                        }
                    }
                    break;
                }
                case 2:
                {
                    if (lightAnimFirEnd && lightAnimSecEnd) {
                        if (drawAnimPauseBool) {
                            //pause draw
                            if (drawGridSymbolInterval) {
                                clearInterval(drawGridSymbolInterval);
                                drawGridSymbolInterval = null;
                            }
                            msgBus.publish('drawStoped');
                        } else {
                            let currentDrawGridSymbolIndex = drawGridSymbolCount;
                            if ((drawGridSymbolCount + 1) === drawGridSymbolTotal) {
                                lightAnimFirEnd = false;
                                drawGridSymbolCount += 1;
                                drawOneGridSymbol(currentDrawGridSymbolIndex, false);
                            } else {
                                lightAnimFirEnd = false;
                                lightAnimSecEnd = false;
                                drawGridSymbolCount += 2;
                                drawTwoGridSymbol(currentDrawGridSymbolIndex);
                            }
                        }
                    }
                    break;
                }
                case 3:
                {
                    if (lightAnimFirEnd && lightAnimSecEnd && lightAnimThirEnd) {
                        if (drawAnimPauseBool) {
                            //pause draw
                            if (drawGridSymbolInterval) {
                                clearInterval(drawGridSymbolInterval);
                                drawGridSymbolInterval = null;
                            }
                            msgBus.publish('drawStoped');
                        } else {
                            let currentDrawGridSymbolIndex = drawGridSymbolCount;
                            if ((drawGridSymbolCount + 1) === drawGridSymbolTotal) {
                                lightAnimFirEnd = false;
                                drawGridSymbolCount += 1;
                                drawOneGridSymbol(currentDrawGridSymbolIndex, false);
                            } else if ((drawGridSymbolCount + 2) === drawGridSymbolTotal) {
                                lightAnimFirEnd = false;
                                lightAnimSecEnd = false;
                                drawGridSymbolCount += 2;
                                drawTwoGridSymbol(currentDrawGridSymbolIndex);
                            } else {
                                lightAnimFirEnd = false;
                                lightAnimSecEnd = false;
                                lightAnimThirEnd = false;
                                drawGridSymbolCount += 3;
                                drawThreeGridSymbol(currentDrawGridSymbolIndex);
                            }
                        }
                    }
                    break;
                }
                case 4:
                {
                    if (lightAnimFirEnd && lightAnimSecEnd && lightAnimThirEnd) {
                        if (drawGridSymbolInterval) {
                            clearInterval(drawGridSymbolInterval);
                            drawGridSymbolInterval = null;
                        }
                        disableButtons();
                        let currentDrawGridSymbolIndex = drawGridSymbolCount;
                        drawGridSymbolCount += 1;
                        if (fourSpeedAllreveal) {
                            drawAllGridSymbol(currentDrawGridSymbolIndex);
                        } else {
                            drawTenGridSymbol(currentDrawGridSymbolIndex);
                        }
                    }
                    break;
                }
            }
        }, 10);
    }

    function drawOneGridSymbol(SymbolIndex, textState) {
        if (SymbolIndex < drawGridSymbolTotal) {
            let line = drawGridSymbolNum[SymbolIndex].substring(0, 1);
            let index = drawGridSymbolNum[SymbolIndex].substring(1, drawGridSymbolNum[SymbolIndex].length);
            index -= 1;
            for (let j = 0; j < gridSymbolLineMap.length; j++) {
                if (line === gridSymbolLineMap[j].lineLetter) {
                    lineNumber1 = (j + 1);
                    colNumber1 = index;
                    currentDrawSpeed = 1;
                    currentDrawSymbolIndex = SymbolIndex + 1;
                    gr.lib._powerBallText2.setText(gridSymbolLineMap[j].numList[index]);
                    gr.lib._powerBallText.setText(gridSymbolLineMap[j].numList[index]);
                    gr.lib._powerBallText2.show(textState);
                    gr.lib._powerBallText.show(textState);
                    gr.lib._powerBallLightAnim.show(textState);
                    gr.animMap['_powerBollJumpingAnim'].play();
                    break;
                }
            }
        } else {
            gr.lib._powerBallLightAnim.show(false);
            gr.lib._powerBallText2.show(false);
            gr.lib._powerBallText.show(false);
            showNoWinSymbol();
        }
    }

    function drawTwoGridSymbol(SymbolIndex) {
        if ((SymbolIndex + 1) < drawGridSymbolTotal) {
            let line1 = drawGridSymbolNum[SymbolIndex].substring(0, 1);
            let index1 = drawGridSymbolNum[SymbolIndex].substring(1, drawGridSymbolNum[SymbolIndex].length);
            let line2 = drawGridSymbolNum[(SymbolIndex + 1)].substring(0, 1);
            let index2 = drawGridSymbolNum[(SymbolIndex + 1)].substring(1, drawGridSymbolNum[(SymbolIndex + 1)].length);
            index1 -= 1;
            index2 -= 1;
            for (let j = 0; j < gridSymbolLineMap.length; j++) {
                if (line1 === gridSymbolLineMap[j].lineLetter) {
                    lineNumber1 = (j + 1);
                    colNumber1 = index1;
                }
                if (line2 === gridSymbolLineMap[j].lineLetter) {
                    lineNumber2 = (j + 1);
                    colNumber2 = index2;
                }
            }
            currentDrawSpeed = 2;
            currentDrawSymbolIndex = SymbolIndex + 1 + 1;
            gr.animMap['_powerBollJumpingAnim2'].play();
        } else {
            showNoWinSymbol();
        }
    }

    function drawThreeGridSymbol(SymbolIndex) {
        if ((SymbolIndex + 2) < drawGridSymbolTotal) {
            let line1 = drawGridSymbolNum[SymbolIndex].substring(0, 1);
            let index1 = drawGridSymbolNum[SymbolIndex].substring(1, drawGridSymbolNum[SymbolIndex].length);
            let line2 = drawGridSymbolNum[(SymbolIndex + 1)].substring(0, 1);
            let index2 = drawGridSymbolNum[(SymbolIndex + 1)].substring(1, drawGridSymbolNum[(SymbolIndex + 1)].length);
            let line3 = drawGridSymbolNum[(SymbolIndex + 2)].substring(0, 1);
            let index3 = drawGridSymbolNum[(SymbolIndex + 2)].substring(1, drawGridSymbolNum[(SymbolIndex + 2)].length);
            index1 -= 1;
            index2 -= 1;
            index3 -= 1;
            for (let j = 0; j < gridSymbolLineMap.length; j++) {
                if (line1 === gridSymbolLineMap[j].lineLetter) {
                    lineNumber1 = (j + 1);
                    colNumber1 = index1;
                }
                if (line2 === gridSymbolLineMap[j].lineLetter) {
                    lineNumber2 = (j + 1);
                    colNumber2 = index2;
                }
                if (line3 === gridSymbolLineMap[j].lineLetter) {
                    lineNumber3 = (j + 1);
                    colNumber3 = index3;
                }
            }
            currentDrawSpeed = 3;
            currentDrawSymbolIndex = SymbolIndex + 1 + 2;
            playDrawLightAnim();
        } else {
            showNoWinSymbol();
        }
    }

    function drawAllGridSymbol(SymbolIndex) {
        if (config.audio && config.audio.NumberRevealFast1) {
            audio.play(config.audio.NumberRevealFast1.name, config.audio.NumberRevealFast1.channel);
        }
        let animPlayRate = 0.5;
        while (SymbolIndex < drawGridSymbolTotal) {
            let line = drawGridSymbolNum[SymbolIndex].substring(0, 1);
            let index = drawGridSymbolNum[SymbolIndex].substring(1, drawGridSymbolNum[SymbolIndex].length);
            index -= 1;
            for (let j = 0; j < gridSymbolLineMap.length; j++) {
                if (line === gridSymbolLineMap[j].lineLetter) {
                    let lineNumber4 = (j + 1);
                    let colNumber4 = index;
                    currentDrawSpeed = 4;
                    currentDrawSymbolIndex = SymbolIndex + 1;
                    playStoneBrokenAnim(lineNumber4, colNumber4, animPlayRate);
                    break;
                }
            }
            SymbolIndex++;
        }
        showNoWinSymbol();
    }

    function drawTenGridSymbol(SymbolIndex) {
        for (let i = 0; i < 20; i++) {
            if (SymbolIndex < drawGridSymbolTotal) {
                let line = drawGridSymbolNum[SymbolIndex].substring(0, 1);
                let index = drawGridSymbolNum[SymbolIndex].substring(1, drawGridSymbolNum[SymbolIndex].length);
                index -= 1;
                for (let j = 0; j < gridSymbolLineMap.length; j++) {
                    if (line === gridSymbolLineMap[j].lineLetter) {
                        let lineNumber4 = (j + 1);
                        let colNumber4 = index;
                        currentDrawSpeed = 4;
                        currentDrawSymbolIndex = SymbolIndex + 1;
                        if (i === 0) {
                            let audioIndex = Math.floor(Math.random() * 3) + 1;
                            if (revealAnimPlayRate < 0.5) {
                                if (config.audio && config.audio['NumberRevealSlow' + audioIndex]) {
                                    audio.play(config.audio['NumberRevealSlow' + audioIndex].name, config.audio['NumberRevealSlow' + audioIndex].channel);
                                }
                            } else {
                                if (config.audio && config.audio['NumberRevealFast' + audioIndex]) {
                                    audio.play(config.audio['NumberRevealFast' + audioIndex].name, config.audio['NumberRevealFast' + audioIndex].channel);
                                }
                            }
                        }
                        playStoneBrokenAnim(lineNumber4, colNumber4, revealAnimPlayRate);
                        break;
                    }
                }
                SymbolIndex++;
            } else {
                showNoWinSymbol();
                return;
            }
        }

        gr.animMap['_MeterDrawsIconIAnim'].play();
        gr.lib._MeterDrawsNum.setText(70 - Number(currentDrawSymbolIndex));

        let reveaInterval = setInterval(function () {
            if (winValue > prizeValue) {
                clearInterval(reveaInterval);
                reveaInterval = null;
                return;
            }
            for (let i = 0; i < 20; i++) {
                if (SymbolIndex < drawGridSymbolTotal) {
                    let line = drawGridSymbolNum[SymbolIndex].substring(0, 1);
                    let index = drawGridSymbolNum[SymbolIndex].substring(1, drawGridSymbolNum[SymbolIndex].length);
                    index -= 1;
                    for (let j = 0; j < gridSymbolLineMap.length; j++) {
                        if (line === gridSymbolLineMap[j].lineLetter) {
                            let lineNumber4 = (j + 1);
                            let colNumber4 = index;
                            currentDrawSpeed = 4;
                            currentDrawSymbolIndex = SymbolIndex + 1;
                            if (i === 0) {
                                let audioIndex = Math.floor(Math.random() * 3) + 1;
                                if (revealAnimPlayRate < 0.5) {
                                    if (config.audio && config.audio['NumberRevealSlow' + audioIndex]) {
                                        audio.play(config.audio['NumberRevealSlow' + audioIndex].name, config.audio['NumberRevealSlow' + audioIndex].channel);
                                    }
                                } else {
                                    if (config.audio && config.audio['NumberRevealFast' + audioIndex]) {
                                        audio.play(config.audio['NumberRevealFast' + audioIndex].name, config.audio['NumberRevealFast' + audioIndex].channel);
                                    }
                                }
                            }
                            playStoneBrokenAnim(lineNumber4, colNumber4, revealAnimPlayRate);
                            break;
                        }
                    }
                    SymbolIndex++;
                } else {
                    clearInterval(reveaInterval);
                    reveaInterval = null;
                    showNoWinSymbol();
                    break;
                }
            }
            gr.animMap['_MeterDrawsIconIAnim'].play();
            gr.lib._MeterDrawsNum.setText(70 - Number(currentDrawSymbolIndex));
        }, intervalTime);
    }

    function playStoneBrokenAnim(lineNumber, colNumber, animPlayRate) {
        /*if (config.audio && config.audio.NumberReveal) {
         audio.play(config.audio.NumberReveal.name, config.audio.NumberReveal.channel);
         }*/
        gr.lib['_BaseLineLight_' + lineNumber + '_' + colNumber].show(true);
        gr.lib['_BaseLineLight_' + lineNumber + '_' + colNumber].gotoAndPlay('stoneBoom', animPlayRate);
        gr.lib['_BaseLineDraw_' + lineNumber + '_' + colNumber].show(true);

        let colMidIndex = 0;
        let lineIndex = 0;
        let line = Math.floor((lineNumber - 1) / 4);
        switch (line) {
            case 0:
            {
                colMidIndex = 4;
                lineIndex = lineNumber - 1;
                break;
            }
            case 1:
            {
                colMidIndex = 3;
                lineIndex = lineNumber - 5;
                break;
            }
            case 2:
            {
                colMidIndex = 2;
                lineIndex = lineNumber - 9;
                break;
            }
            case 3:
            {
                colMidIndex = 1;
                lineIndex = lineNumber - 13;
                break;
            }
        }

        if (colNumber === colMidIndex) {
            gr.lib['_BaseLineDraw_' + lineNumber + '_' + colNumber].gotoAndPlay(DrawBrokenImage[lineIndex] + 'Mid', animPlayRate);
        } else {
            gr.lib['_BaseLineDraw_' + lineNumber + '_' + colNumber].gotoAndPlay(DrawBrokenImage[lineIndex], animPlayRate);
        }

        gr.lib['_BaseLineTX_' + lineNumber + '_' + colNumber].updateCurrentStyle({"_text": winTextColor});
        gr.lib["_BaseWinLineTX_" + lineNumber + "_" + colNumber].show(true);
        gridSymbolLineMap[lineNumber - 1].numState[colNumber] = true;
        gridSymbolLineMap[lineNumber - 1].drawCount++;
        if (gridSymbolLineMap[lineNumber - 1].drawCount === gridSymbolLineMap[lineNumber - 1].numList.length) {
            if (config.audio && config.audio.LineWin) {
                var channel = config.audio.LineWin.channel;
                if (Array.isArray(channel)) {
                    if (LineWinChannel >= channel.length) {
                        LineWinChannel = 0;
                    }
                    audio.play(config.audio.LineWin.name, channel[LineWinChannel]);
                    LineWinChannel++;
                } else {
                    audio.play(config.audio.LineWin.name, channel);
                }
            }
            msgBus.publish('gameScenceShake', windowShakeSpeed);

            for (let i = 0; i < gridSymbolLineMap[lineNumber - 1].numList.length; i++) {
                let backgroundImg = "";
                if (line !== 3) {
                    if (i > 0 && i < colMidIndex) {
                        backgroundImg = "gold" + positionArray[lineIndex] + (line + 1) + "_1_0001";
                    } else if (i === colMidIndex) {
                        backgroundImg = 'gold' + positionArray[lineIndex] + (line + 1) + '_2_0001';
                    } else if (i > (colMidIndex + 1)) {
                        backgroundImg = 'gold' + positionArray[lineIndex] + (line + 1) + '_3_0001';
                    } else {
                        backgroundImg = 'gold' + positionArray[lineIndex] + (line + 1) + '_0_0001';
                    }
                } else {
                    if (i === 1) {
                        backgroundImg = 'gold' + positionArray[lineIndex] + (line + 1) + '_2_0001';
                    } else if (i === 3) {
                        backgroundImg = 'gold' + positionArray[lineIndex] + (line + 1) + '_4_0001';
                    } else {
                        backgroundImg = 'gold' + positionArray[lineIndex] + (line + 1) + '_0_0001';
                    }
                }
                gr.lib['_BaseLineStone_' + lineNumber + '_' + i].updateCurrentStyle({'_background': {'_imagePlate': backgroundImg}});
                gr.lib['_stoneBreathAnim_' + lineNumber + "_" + i].show(false);
            }
            playPattenAnim(lineNumber, gridSymbolLineMap[lineNumber - 1].numList.length);

            winValue += Number(gridSymbolLineMap[lineNumber - 1].price);
            if (winValue > prizeValue) {
                if (drawGridSymbolInterval) {
                    clearInterval(drawGridSymbolInterval);
                    drawGridSymbolInterval = null;
                }
                msgBus.publish('winboxError', {errorCode: '29000'});
                return;
            }
            gr.lib._winsValue.setText(SKBeInstant.formatCurrency(winValue).formattedAmount);
            gameUtils.fixMeter(gr);
        } else if (gridSymbolLineMap[lineNumber - 1].drawCount === gridSymbolLineMap[lineNumber - 1].numList.length - 1) {
            for (let i = 0; i < gridSymbolLineMap[lineNumber - 1].numList.length; i++) {
                if (gridSymbolLineMap[lineNumber - 1].numState[i]) {
                    gr.lib['_stoneBreathAnim_' + lineNumber + "_" + i].show(true);
                }
            }
        }
    }

    function playPattenAnim(lineNumber, colCount) {
        let colIndex = 0;
        let interval = setInterval(function () {
            if (colIndex > (colCount - 1)) {
                clearInterval(interval);
            } else {
                gr.lib['_BaseLinePattenLight_' + lineNumber + '_' + colIndex].show(true);
                gr.lib['_BaseLinePattenLight_' + lineNumber + '_' + colIndex].gotoAndPlay('patten_Light2', 0.5);
                colIndex++;
            }
        }, 150);
    }

    function showNoWinSymbol() {
        gr.lib._MeterDrawsNum.setText(0);
        for (let i = 0; i < 16; i++) {
            if (gridSymbolLineMap[i].drawCount !== gridSymbolLineMap[i].numList.length) {
                for (let j = 0; j < gridSymbolLineMap[i].numList.length; j++) {
                    if (gridSymbolLineMap[i].numState[j]) {
                        gr.lib['_stoneBreathAnim_' + (i + 1) + "_" + j ].show(false);
                    } else {
                        gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].updateCurrentStyle({"_text": {"_strokeColor": textStrokenColorDark[i]}});
                    }
                }
            }
        }
        if (winValue !== prizeValue) {
            if (drawGridSymbolInterval) {
                clearInterval(drawGridSymbolInterval);
                drawGridSymbolInterval = null;
            }
            msgBus.publish('winboxError', {errorCode: '29000'});
            return;
        }

        if (backgroundOutAnim !== null) {
            gr.lib._BackgroundOutAnim.pixiContainer.removeChild(backgroundOutAnim);
            backgroundOutAnim = null;
        }
        backgroundOutAnim = new PIXI.spine.Spine(resLib.spine.backgroundEffects_spine.spineData);
        backgroundOutAnim.state.addListener({
            complete: function (track, event) {
                console.log(track + event);
                gr.lib._BackgroundOutAnim.show(false);
                msgBus.publish('allRevealed');
                revealDataExist = false;
                drawAnimPauseBool = false;
                drawAnimStartBool = false;
                if (drawGridSymbolInterval) {
                    clearInterval(drawGridSymbolInterval);
                    drawGridSymbolInterval = null;
                }
            }
        });
        backgroundOutAnim.state.addAnimation(2, spineOutAnimName, false, 0);
        backgroundOutAnim.data = {"_name": "spineBackground"};
        backgroundOutAnim.styleData = spineStyle;
        backgroundOutAnim.x = spineStyle.x;
        backgroundOutAnim.y = spineStyle.y;
        backgroundOutAnim.scale.x = spineStyle.scaleX;
        backgroundOutAnim.scale.y = spineStyle.scaleY;
        gr.lib._BackgroundOutAnim.pixiContainer.addChild(backgroundOutAnim);
        gr.lib._BackgroundStaticAnim.show(false);
        gr.lib._BackgroundOutAnim.show(true);
    }

    function createLightAnim() {
        if (!spriteSheetAnimationMap) {
            spriteSheetAnimationMap = splashUtil.searchSplashSpriteSheetAnimationFromTextureCache();
        }
        if (!lightAnimFir) {
            lightAnimFir = PIXI.extras.AnimatedSprite.fromFrames(spriteSheetAnimationMap['stoneFlash']);
            lightAnimFir.anchor.set(0.5, 1);
            lightAnimFir.scale.set(0.7, 1);
            lightAnimFir.x = Number(gr.lib._powerBallText._currentStyle._left) + (Number(gr.lib._powerBallText._currentStyle._width) - Number(lightAnimFir.width) / 2) / 2 + Number(lightAnimFir.width) / 2 / 2;
            lightAnimFir.y = Number(gr.lib._powerBallText._currentStyle._top) + Number(gr.lib._powerBallText._currentStyle._height) / 2;
            lightAnimFir.animName = 'stoneFlash';
            lightAnimFir.animationSpeed = revealAnimPlayRate;
            lightAnimFir.loop = false;
            lightAnimFir.visible = false;
            gr.lib._centreAnim.pixiContainer.addChildAt(lightAnimFir, 0);
        }

        lightOriginHeight = lightAnimFir.height;
        lightOriginWidth = lightAnimFir.width;
        lightOriginX = lightAnimFir.x;
        lightOriginY = lightAnimFir.y;

        if (!lightAnimSec) {
            lightAnimSec = PIXI.extras.AnimatedSprite.fromFrames(spriteSheetAnimationMap['stoneFlash']);
            lightAnimSec.anchor.set(0.5, 1);
            lightAnimSec.scale.set(0.7, 1);
            lightAnimSec.x = Number(gr.lib._powerBallText._currentStyle._left) + (Number(gr.lib._powerBallText._currentStyle._width) - Number(lightAnimSec.width) / 2) / 2 + Number(lightAnimSec.width) / 2 / 2;
            lightAnimSec.y = Number(gr.lib._powerBallText._currentStyle._top) + Number(gr.lib._powerBallText._currentStyle._height) / 2;
            lightAnimSec.animName = 'stoneFlash';
            lightAnimSec.animationSpeed = revealAnimPlayRate;
            lightAnimSec.loop = false;
            lightAnimSec.visible = false;
            gr.lib._centreAnim.pixiContainer.addChildAt(lightAnimSec, 1);
        }

        if (!lightAnimThir) {
            lightAnimThir = PIXI.extras.AnimatedSprite.fromFrames(spriteSheetAnimationMap['stoneFlash']);
            lightAnimThir.anchor.set(0.5, 1);
            lightAnimThir.scale.set(0.7, 1);
            lightAnimThir.x = Number(gr.lib._powerBallText._currentStyle._left) + (Number(gr.lib._powerBallText._currentStyle._width) - Number(lightAnimThir.width) / 2) / 2 + Number(lightAnimThir.width) / 2 / 2;
            lightAnimThir.y = Number(gr.lib._powerBallText._currentStyle._top) + Number(gr.lib._powerBallText._currentStyle._height) / 2;
            lightAnimThir.animName = 'stoneFlash';
            lightAnimThir.animationSpeed = revealAnimPlayRate;
            lightAnimThir.loop = false;
            lightAnimThir.visible = false;
            gr.lib._centreAnim.pixiContainer.addChildAt(lightAnimThir, 2);
        }
    }

    function addGridSymbolShuffle() {
        let style = {
            "_id": "_1m7shuffle",
            "_name": "_BaseLineShuffle_",
            "_SPRITES": [],
            "_style": {
                "_width": 150,
                "_height": 124,
                "_background": {
                    "_imagePlate": "redBroken_0001"
                }
            }
        };

        for (let i = 1; i <= 16; i++) {
            switch (Math.floor(i % 2)) {
                case 1:
                {
                    style._style._left = -44;
                    style._style._top = -6;
                    let colNum = 0;
                    if (i === 1 || i === 3) {
                        colNum = 9;
                    } else if (i === 5 || i === 7) {
                        colNum = 7;
                    } else if (i === 9 || i === 11) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;

                        if (i === 13) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 62 * j;
                            } else {
                                spData._style._left = spData._style._left + 62;
                                spData._style._top = spData._style._top + 62;
                            }
                        } else if (i === 15) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 62 * j;
                                spData._style._top = spData._style._top + 62;
                            } else {
                                spData._style._left = spData._style._left + 62;
                            }
                        } else if (i === 3 || i === 7 || i === 11) {
                            spData._style._left = spData._style._left + 63.5 * j;
                        } else if (i === 1) {
                            spData._style._left = spData._style._left + 65.5 * j;
                        } else {
                            spData._style._left = spData._style._left + 64.5 * j;
                        }

                        if (i === 1 || i === 5 || i === 9 || i === 13) {
                            spData._style._background._imagePlate = "redBroken_0001";
                        } else {
                            spData._style._background._imagePlate = "yellowBroken_0001";
                        }

                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
                case 0:
                {
                    style._style._left = -38;
                    style._style._top = -14;
                    let colNum = 0;
                    if (i === 2 || i === 4) {
                        colNum = 9;
                    } else if (i === 6 || i === 8) {
                        colNum = 7;
                    } else if (i === 10 || i === 12) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;

                        if (i === 14) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 62 * j;
                            } else {
                                spData._style._left = spData._style._left + 62;
                                spData._style._top = spData._style._top + 62;
                            }
                        } else if (i === 16) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 62;
                                spData._style._top = spData._style._top + 62 * j;
                            } else {
                                spData._style._top = spData._style._top + 62;
                            }
                        } else {
                            spData._style._top = spData._style._top + 62 * j;
                        }

                        if (i === 2 || i === 6 || i === 10 || i === 14) {
                            spData._style._background._imagePlate = "greenBroken_0001";
                        } else {
                            spData._style._background._imagePlate = "blueBroken_0001";
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
            }
        }
    }

    function addGridSymbolDraw() {
        let style = {
            "_id": "_1m7draw",
            "_name": "_BaseLineDraw_",
            "_SPRITES": [],
            "_style": {
                "_width": 136,
                "_height": 130,
                "_background": {
                    "_imagePlate": "DrawBrokenRedMid_0001"
                },
                "_transform": {
                    "_scale": {
                        "_x": 1,
                        "_y": 1
                    }
                }
            }
        };

        for (let i = 1; i <= 16; i++) {
            switch (Math.floor(i % 2)) {
                case 1:
                {
                    style._style._left = -28;
                    style._style._top = -6;
                    let colNum = 0;
                    let midNum = 0;
                    if (i === 1 || i === 3) {
                        colNum = 9;
                        midNum = 4;
                    } else if (i === 5 || i === 7) {
                        colNum = 7;
                        midNum = 3;
                    } else if (i === 9 || i === 11) {
                        colNum = 5;
                        midNum = 2;
                    } else {
                        colNum = 4;
                        midNum = 1;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 1 || i === 5 || i === 9) {
                            if (i === 1) {
                                spData._style._left = spData._style._left + 63 * j;
                            } else {
                                spData._style._left = spData._style._left + 61 * j;
                            }
                            if (j === midNum) {
                                spData._style._background._imagePlate = "DrawBrokenRedMid_0001";
                            } else {
                                if (j > midNum) {
                                    spData._style._transform._scale._x = -1;
                                }
                                spData._style._background._imagePlate = "DrawBrokenRed_0001";
                            }
                        } else if (i === 3 || i === 7 || i === 11) {
                            if (i === 3) {
                                spData._style._left = spData._style._left + 61 * j;
                            } else {
                                spData._style._left = spData._style._left + 60 * j;
                            }
                            if (j === midNum) {
                                spData._style._background._imagePlate = "DrawBrokenYellowMid_0001";
                            } else {
                                if (j > midNum) {
                                    spData._style._transform._scale._x = -1;
                                }
                                spData._style._background._imagePlate = "DrawBrokenYellow_0001";
                            }
                        } else if (i === 13) {
                            if (j < 3) {
                                if (j === midNum) {
                                    spData._style._background._imagePlate = "DrawBrokenRedMid_0001";
                                } else {
                                    spData._style._background._imagePlate = "DrawBrokenRed_0001";
                                }
                                if (j > midNum) {
                                    spData._style._transform._scale._x = -1;
                                }
                                spData._style._left = spData._style._left + 60 * j;
                            } else {
                                spData._style._left = spData._style._left + 60;
                                spData._style._top = spData._style._top + 63;
                                spData._style._background._imagePlate = "DrawBrokenRedMid_0001";
                            }
                        } else {
                            if (j < 3) {
                                if (j === midNum) {
                                    spData._style._background._imagePlate = "DrawBrokenYellowMid_0001";
                                } else {
                                    spData._style._background._imagePlate = "DrawBrokenYellow_0001";
                                }
                                if (j > midNum) {
                                    spData._style._transform._scale._x = -1;
                                }
                                spData._style._left = spData._style._left + 60 * j;
                                spData._style._top = spData._style._top + 60;
                            } else {
                                spData._style._left = spData._style._left + 60;
                                spData._style._background._imagePlate = "DrawBrokenYellowMid_0001";
                            }
                        }

                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
                case 0:
                {
                    style._style._left = -30;
                    style._style._top = -8;
                    let colNum = 0;
                    let midNum = 0;
                    if (i === 2 || i === 4) {
                        colNum = 9;
                        midNum = 4;
                    } else if (i === 6 || i === 8) {
                        colNum = 7;
                        midNum = 3;
                    } else if (i === 10 || i === 12) {
                        colNum = 5;
                        midNum = 2;
                    } else {
                        colNum = 4;
                        midNum = 1;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 2 || i === 6 || i === 10) {
                            if (j === midNum) {
                                spData._style._left = spData._style._left + 20;
                                spData._style._background._imagePlate = "DrawBrokenGreenMid_0001";
                            } else {
                                spData._style._transform._scale._x = -1;
                                if (j > midNum) {
                                    spData._style._transform._scale._y = -1;
                                    spData._style._top = spData._style._top - 44;
                                }
                                spData._style._background._imagePlate = "DrawBrokenGreen_0001";
                            }
                            spData._style._top = spData._style._top + 61 * j;
                        } else if (i === 4 || i === 8 || i === 12) {
                            if (j === midNum) {
                                spData._style._left = spData._style._left + 16;
                                spData._style._background._imagePlate = "DrawBrokenBlueMid_0001";
                            } else {
                                if (j > midNum) {
                                    spData._style._transform._scale._y = -1;
                                    spData._style._top = spData._style._top - 44;
                                }
                                spData._style._background._imagePlate = "DrawBrokenBlue_0001";
                            }
                            spData._style._top = spData._style._top + 61 * j;
                        } else if (i === 14) {
                            if (j < 3) {
                                if (j === midNum) {
                                    spData._style._left = spData._style._left + 20;
                                    spData._style._background._imagePlate = "DrawBrokenGreenMid_0001";
                                } else {
                                    spData._style._transform._scale._x = -1;
                                    spData._style._background._imagePlate = "DrawBrokenGreen_0001";
                                }
                                if (j > midNum) {
                                    spData._style._transform._scale._y = -1;
                                    spData._style._top = spData._style._top - 44;
                                }
                                spData._style._top = spData._style._top + 60 * j;
                            } else {
                                spData._style._left = spData._style._left + 60 + 16;
                                spData._style._top = spData._style._top + 60;
                                spData._style._background._imagePlate = "DrawBrokenGreenMid_0001";
                            }
                        } else {
                            if (j < 3) {
                                if (j === midNum) {
                                    spData._style._left = spData._style._left + 16;
                                    spData._style._background._imagePlate = "DrawBrokenBlueMid_0001";
                                } else {
                                    spData._style._left = spData._style._left + 16;
                                    spData._style._background._imagePlate = "DrawBrokenBlue_0001";
                                }
                                if (j > midNum) {
                                    spData._style._transform._scale._y = -1;
                                    spData._style._top = spData._style._top - 44;
                                }
                                spData._style._top = spData._style._top + 60 * j;
                                spData._style._left = spData._style._left + 60;
                            } else {
                                spData._style._left = spData._style._left + 16;
                                spData._style._top = spData._style._top + 60;
                                spData._style._background._imagePlate = "DrawBrokenBlueMid_0001";
                            }
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
            }
        }
    }

    function addGridSymbolLight() {
        let style = {
            "_id": "_1m7light",
            "_name": "_BaseLineLight_",
            "_SPRITES": [],
            "_style": {
                "_width": 106,
                "_height": 106,
                "_background": {
                    "_imagePlate": "stoneBoom_0001"
                }
            }
        };

        for (let i = 1; i <= 16; i++) {
            switch (Math.floor(i % 2)) {
                case 1:
                {
                    style._style._left = -23;
                    style._style._top = -16;
                    let colNum = 0;
                    if (i === 1 || i === 3) {
                        colNum = 9;
                    } else if (i === 5 || i === 7) {
                        colNum = 7;
                    } else if (i === 9 || i === 11) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 13) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 64 * j;
                            } else {
                                spData._style._left = spData._style._left + 64;
                                spData._style._top = spData._style._top + 63;
                            }
                        } else if (i === 15) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 63 * j;
                                spData._style._top = spData._style._top + 63;
                            } else {
                                spData._style._left = spData._style._left + 63;
                            }
                            spData._style._top = spData._style._top + 14;
                        } else if (i === 3 || i === 7 || i === 11) {
                            spData._style._left = spData._style._left + 63.5 * j;
                            spData._style._top = spData._style._top + 14;
                        } else if (i === 1) {
                            spData._style._left = spData._style._left + 65.5 * j;
                        } else {
                            spData._style._left = spData._style._left + 64.5 * j;
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
                case 0:
                {
                    style._style._left = -21;
                    style._style._top = -24;
                    let colNum = 0;
                    if (i === 2 || i === 4) {
                        colNum = 9;
                    } else if (i === 6 || i === 8) {
                        colNum = 7;
                    } else if (i === 10 || i === 12) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 14) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 62.5 * j;
                            } else {
                                spData._style._left = spData._style._left + 60;
                                spData._style._top = spData._style._top + 63;
                            }
                        } else if (i === 16) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 62.5 * j;
                                spData._style._left = spData._style._left + 60;
                            } else {
                                spData._style._top = spData._style._top + 62.5;
                            }
                            spData._style._left = spData._style._left + 14;
                        } else if (i === 4 || i === 8 || i === 12) {
                            spData._style._left = spData._style._left + 14;
                            spData._style._top = spData._style._top + 62.5 * j;
                        } else {
                            spData._style._top = spData._style._top + 63 * j;
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
            }
        }
    }

    function addGridSymbolPattenLight() {
        let style = {
            "_id": "_1m7patlight",
            "_name": "_BaseLinePattenLight_",
            "_SPRITES": [],
            "_style": {
                "_width": 106,
                "_height": 106,
                "_background": {
                    "_imagePlate": "patten_Light2_0006"
                },
                "_scale": {
                    "_x": "2",
                    "_y": "2"
                }
            }
        };

        for (let i = 1; i <= 16; i++) {
            switch (Math.floor(i % 2)) {
                case 1:
                {
                    style._style._left = -24;
                    style._style._top = -16;
                    let colNum = 0;
                    if (i === 1 || i === 3) {
                        colNum = 9;
                    } else if (i === 5 || i === 7) {
                        colNum = 7;
                    } else if (i === 9 || i === 11) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 13) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 64 * j;
                            } else {
                                spData._style._left = spData._style._left + 64;
                                spData._style._top = spData._style._top + 63;
                            }
                        } else if (i === 15) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 63 * j;
                                spData._style._top = spData._style._top + 63;
                            } else {
                                spData._style._left = spData._style._left + 63;
                            }
                            spData._style._top = spData._style._top + 14;
                        } else if (i === 3 || i === 7 || i === 11) {
                            spData._style._left = spData._style._left + 63.5 * j;
                            spData._style._top = spData._style._top + 14;
                        } else if (i === 1) {
                            spData._style._left = spData._style._left + 65.5 * j;
                        } else {
                            spData._style._left = spData._style._left + 64.5 * j;
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                        gr.lib['_BaseLinePattenLight_' + i + '_' + j].lineIndex = i;
                        gr.lib['_BaseLinePattenLight_' + i + '_' + j].colCount = colNum;
                    }
                    break;
                }
                case 0:
                {
                    style._style._left = -21;
                    style._style._top = -24;
                    let colNum = 0;
                    if (i === 2 || i === 4) {
                        colNum = 9;
                    } else if (i === 6 || i === 8) {
                        colNum = 7;
                    } else if (i === 10 || i === 12) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 14) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 62.5 * j;
                            } else {
                                spData._style._left = spData._style._left + 60;
                                spData._style._top = spData._style._top + 63;
                            }
                        } else if (i === 16) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 62.5 * j;
                                spData._style._left = spData._style._left + 60;
                            } else {
                                spData._style._top = spData._style._top + 62.5;
                            }
                            spData._style._left = spData._style._left + 14;
                        } else if (i === 4 || i === 8 || i === 12) {
                            spData._style._left = spData._style._left + 14;
                            spData._style._top = spData._style._top + 62.5 * j;
                        } else {
                            spData._style._top = spData._style._top + 63 * j;
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                        gr.lib['_BaseLinePattenLight_' + i + '_' + j].lineIndex = i;
                        gr.lib['_BaseLinePattenLight_' + i + '_' + j].colCount = colNum;
                    }
                    break;
                }
            }
        }
    }

    function addGridSymbolBreathAnim() {
        let style = {
            "_id": "_20upj7wj",
            "_name": "_stoneBreathAnim_",
            "_SPRITES": [],
            "_style": {
                "_width": 70,
                "_height": 70,
                "_background": {
                    "_imagePlate": "stone_breathLight"
                }
            }
        };

        for (let i = 1; i <= 16; i++) {
            switch (Math.floor(i % 2)) {
                case 1:
                {
                    style._style._left = -5;
                    style._style._top = 6;
                    let colNum = 0;
                    if (i === 1 || i === 3) {
                        colNum = 9;
                    } else if (i === 5 || i === 7) {
                        colNum = 7;
                    } else if (i === 9 || i === 11) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 13) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 65 * j + 1;
                                spData._style._top = spData._style._top - 2;
                            } else {
                                spData._style._left = spData._style._left + 65 + 1;
                                spData._style._top = spData._style._top + 63 - 2;
                            }
                        } else if (i === 15) {
                            if (j < 3) {
                                spData._style._left = spData._style._left + 64 * j + 1;
                                spData._style._top = spData._style._top + 63;
                            } else {
                                spData._style._left = spData._style._left + 65;
                            }
                            spData._style._top = spData._style._top + 11;
                        } else if (i === 3) {
                            spData._style._left = spData._style._left + 64 * j - 1;
                            spData._style._top = spData._style._top + 13;
                        } else if (i === 7) {
                            spData._style._left = spData._style._left + 64 * j + 1;
                            spData._style._top = spData._style._top + 11;
                        } else if (i === 11) {
                            spData._style._left = spData._style._left + 64.5 * j;
                            spData._style._top = spData._style._top + 11;
                        } else if (i === 1) {
                            spData._style._left = spData._style._left + 66 * j;
                            spData._style._top = spData._style._top - 4;
                        } else if (i === 5) {
                            spData._style._left = spData._style._left + 65.5 * j - 1;
                            spData._style._top = spData._style._top - 4;
                        } else {
                            spData._style._left = spData._style._left + 66 * j + 1.5;
                            spData._style._top = spData._style._top - 4.5;
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_BaseLineBroken_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
                case 0:
                {
                    style._style._left = -7;
                    style._style._top = -9;
                    let colNum = 0;
                    if (i === 2 || i === 4) {
                        colNum = 9;
                    } else if (i === 6 || i === 8) {
                        colNum = 7;
                    } else if (i === 10 || i === 12) {
                        colNum = 5;
                    } else {
                        colNum = 4;
                    }
                    for (let j = 0; j < colNum; j++) {
                        let spData = JSON.parse(JSON.stringify(style));
                        spData._id = style._id + i + j;
                        spData._name = spData._name + i + '_' + j;
                        if (i === 14) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 65.5 * j + 1;
                            } else {
                                spData._style._left = spData._style._left + 62;
                                spData._style._top = spData._style._top + 65.5;
                            }
                        } else if (i === 16) {
                            if (j < 3) {
                                spData._style._top = spData._style._top + 64.5 * j;
                                spData._style._left = spData._style._left + 62;
                            } else {
                                spData._style._top = spData._style._top + 64.5;
                            }
                            spData._style._left = spData._style._left + 18;
                        } else if (i === 4) {
                            spData._style._left = spData._style._left + 18;
                            spData._style._top = spData._style._top + 63.5 * j;
                        } else if (i === 8) {
                            spData._style._left = spData._style._left + 18;
                            spData._style._top = spData._style._top + 64 * j;
                        } else if (i === 12) {
                            spData._style._left = spData._style._left + 15;
                            spData._style._top = spData._style._top + 64 * j;
                        } else if (i === 2) {
                            spData._style._top = spData._style._top + 63.5 * j;
                        } else {
                            spData._style._top = spData._style._top + 64 * j;
                        }
                        let sprite = new Sprite(spData);
                        gr.lib['_stoneBreathAnim_' + i].pixiContainer.addChild(sprite.pixiContainer);
                    }
                    break;
                }
            }
        }
    }

    function setGridSymbolInit() {
        for (let i = 0; i < 16; i++) {
            let line = Math.floor(i / 4);
            let colNum = 0;
            let colMidIndex = 0;
            let positionIndex = 0; //1: outer line 2:second line 3:third line 4:inner line
            let colorIndex = 0;
            switch (line) {
                case 0:
                {
                    colNum = 9;
                    colMidIndex = 4;
                    positionIndex = 1;
                    colorIndex = i;
                    break;
                }
                case 1:
                {
                    colNum = 7;
                    colMidIndex = 3;
                    positionIndex = 2;
                    colorIndex = i - 4;
                    break;
                }
                case 2:
                {
                    colNum = 5;
                    colMidIndex = 2;
                    positionIndex = 3;
                    colorIndex = i - 8;
                    break;
                }
                case 3:
                {
                    colNum = 4;
                    colMidIndex = 1;
                    positionIndex = 4;
                    colorIndex = i - 12;
                    break;
                }
            }
            for (let j = 0; j < colNum; j++) {
                gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].show(false);
                gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].updateCurrentStyle({"_text": baseTextColor[i]});
                gr.lib["_BaseLineTX_" + (i + 1) + "_" + j].autoFontFitText = true;
                gr.lib["_BaseWinLineTX_" + (i + 1) + "_" + j].show(false);
                gr.lib["_BaseWinLineTX_" + (i + 1) + "_" + j].autoFontFitText = true;
                gameUtils.setTextStyle(gr.lib['_BaseWinLineTX_' + (i + 1) + '_' + j], config.style.symbolWin_Text);
                let color = null;
                if (line !== 3) {
                    if (j === 0 || j === (colMidIndex + 1)) {
                        color = colorArray[colorIndex] + positionIndex + "_0_0001";
                    } else if (j === colMidIndex) {
                        color = colorArray[colorIndex] + positionIndex + "_2_0001";
                    } else if (j < colMidIndex) {
                        color = colorArray[colorIndex] + positionIndex + "_1_0001";
                    } else {
                        color = colorArray[colorIndex] + positionIndex + "_3_0001";
                    }
                } else {
                    switch (j) {
                        case 0:
                        case 2:
                        {
                            color = colorArray[colorIndex] + positionIndex + "_0_0001";
                            break;
                        }
                        case 1:
                        {
                            color = colorArray[colorIndex] + positionIndex + "_2_0001";
                            break;
                        }
                        case 3:
                        {
                            color = colorArray[colorIndex] + positionIndex + "_4_0001";
                            break;
                        }
                    }
                }
                gr.lib["_BaseLineStone_" + (i + 1) + "_" + j].updateCurrentStyle({'_background': {'_imagePlate': color}});
                gr.lib["_BaseLineStone_" + (i + 1) + "_" + j].show(true);
                gr.lib['_BaseLineLight_' + (i + 1) + "_" + j].show(false);
                gr.lib['_BaseLineShuffle_' + (i + 1) + "_" + j].show(false);
                gr.lib['_BaseLineDraw_' + (i + 1) + "_" + j].show(false);
                gr.lib['_BaseLinePattenLight_' + (i + 1) + "_" + j].show(false);
                gr.lib['_stoneBreathAnim_' + (i + 1) + "_" + j].show(false);
                gr.lib["_StoneDrawedLine_" + (i + 1) + "_" + j].show(false);
            }
        }
        for (let i = 1; i <= 20; i++) {
            gr.lib["_StonePatten_" + i].stopPlay();
            gr.lib["_StonePatten_" + i].show(false);
        }
        for (let i = 1; i < 9; i++) {
            gr.lib['_encircleFlash' + i].playTimes = 0;
            gr.lib['_encircleFlash' + i].index = i;
        }
    }

    function calculateLightPosition(lightAnim, col, row) {
        lightAnim.height = lightOriginHeight;
        lightAnim.width = lightOriginWidth;
        lightAnim.x = lightOriginX;
        lightAnim.y = lightOriginY;

        let ballPointX, ballPointY;
        let newPointX, newPointY;
        let lightHeight;
        let rotate;
        let ballElem = gr.lib._powerBallText;
        let newElem = gr.lib['_BaseLineStone_' + col + '_' + row];
        let ParentElem = gr.lib._StoneBase;
        ballPointX = ballElem._currentStyle._left + ballElem._currentStyle._width / 2;
        ballPointY = ballElem._currentStyle._top + ballElem._currentStyle._height / 2;
        newPointX = ParentElem._currentStyle._left + newElem.parent._currentStyle._left + newElem._currentStyle._left + newElem._currentStyle._width / 2;
        newPointY = ParentElem._currentStyle._top + newElem.parent._currentStyle._top + newElem._currentStyle._top + newElem._currentStyle._height / 2;
        lightHeight = Math.sqrt(Math.pow((ballPointX - newPointX), 2) + Math.pow((ballPointY - newPointY), 2));

        lightAnim.height = lightHeight;
        lightAnim.y = lightOriginY;

        let radians;
        if ((col === 1 && row <= 4) || (col === 5 && row <= 3) || (col === 9 && row <= 2) || (col === 13 && row <= 1) ||
                (col === 2 && row <= 4) || (col === 6 && row <= 3) || (col === 10 && row <= 2) || (col === 14 && row <= 1)) {
            let cos = Math.abs(ballPointX - newPointX) / lightAnim.height;
            let radina = Math.acos(cos);
            rotate = 180 / (Math.PI / radina);
            radians = (270 + rotate) * (Math.PI / 180);
        } else if ((col === 1 && row > 4) || (col === 5 && row > 3) || (col === 9 && row > 2) || (col === 13 && row > 1) ||
                (col === 4 && row <= 4) || (col === 8 && row <= 3) || (col === 12 && row <= 2) || (col === 16 && row <= 1)) {
            let sin = Math.abs(newPointX - ballPointX) / lightAnim.height;
            let radina = Math.asin(sin);
            rotate = 180 / (Math.PI / radina);
            radians = rotate * (Math.PI / 180);
        } else if ((col === 3 && row > 4) || (col === 7 && row > 3) || (col === 11 && row > 2) || (col === 15 && row > 1) ||
                (col === 4 && row > 4) || (col === 8 && row > 3) || (col === 12 && row > 2) || (col === 16 && row > 1)) {
            let cos = Math.abs(newPointX - ballPointX) / lightAnim.height;
            let radina = Math.acos(cos);
            rotate = 180 / (Math.PI / radina);
            radians = (90 + rotate) * (Math.PI / 180);
        } else {
            let sin = Math.abs(ballPointX - newPointX) / lightAnim.height;
            let radina = Math.asin(sin);
            rotate = 180 / (Math.PI / radina);
            radians = (180 + rotate) * (Math.PI / 180);
        }
        lightAnim.rotation = radians;
    }

    function playDrawLightAnim() {
        gr.animMap['_MeterDrawsIconIAnim'].play();
        gr.lib._MeterDrawsNum.setText(70 - Number(currentDrawSymbolIndex));
        switch (currentDrawSpeed) {
            case 1:
            {
                calculateLightPosition(lightAnimFir, lineNumber1, colNumber1);
                let audioIndex = Math.floor(Math.random() * 3) + 1;
                if (revealAnimPlayRate < 0.5) {
                    if (config.audio && config.audio['NumberRevealSlow' + audioIndex]) {
                        audio.play(config.audio['NumberRevealSlow' + audioIndex].name, config.audio['NumberRevealSlow' + audioIndex].channel);
                    }
                } else {
                    if (config.audio && config.audio['NumberRevealFast' + audioIndex]) {
                        audio.play(config.audio['NumberRevealFast' + audioIndex].name, config.audio['NumberRevealFast' + audioIndex].channel);
                    }
                }
                lightAnimFir.visible = true;
                lightAnimFir.gotoAndPlay(0);
                break;
            }
            case 2:
            {
                calculateLightPosition(lightAnimFir, lineNumber1, colNumber1);
                calculateLightPosition(lightAnimSec, lineNumber2, colNumber2);
                let audioIndex = Math.floor(Math.random() * 3) + 1;
                if (revealAnimPlayRate < 0.5) {
                    if (config.audio && config.audio['NumberRevealSlow' + audioIndex]) {
                        audio.play(config.audio['NumberRevealSlow' + audioIndex].name, config.audio['NumberRevealSlow' + audioIndex].channel);
                    }
                } else {
                    if (config.audio && config.audio['NumberRevealFast' + audioIndex]) {
                        audio.play(config.audio['NumberRevealFast' + audioIndex].name, config.audio['NumberRevealFast' + audioIndex].channel);
                    }
                }
                lightAnimFir.visible = true;
                lightAnimFir.gotoAndPlay(0);
                lightAnimSec.visible = true;
                lightAnimSec.gotoAndPlay(0);
                break;
            }
            case 3:
            {
                calculateLightPosition(lightAnimFir, lineNumber1, colNumber1);
                calculateLightPosition(lightAnimSec, lineNumber2, colNumber2);
                calculateLightPosition(lightAnimThir, lineNumber3, colNumber3);
                let audioIndex = Math.floor(Math.random() * 3) + 1;
                if (revealAnimPlayRate < 0.5) {
                    if (config.audio && config.audio['NumberRevealSlow' + audioIndex]) {
                        audio.play(config.audio['NumberRevealSlow' + audioIndex].name, config.audio['NumberRevealSlow' + audioIndex].channel);
                    }
                } else {
                    if (config.audio && config.audio['NumberRevealFast' + audioIndex]) {
                        audio.play(config.audio['NumberRevealFast' + audioIndex].name, config.audio['NumberRevealFast' + audioIndex].channel);
                    }
                }
                lightAnimFir.visible = true;
                lightAnimFir.gotoAndPlay(0);
                lightAnimSec.visible = true;
                lightAnimSec.gotoAndPlay(0);
                lightAnimThir.visible = true;
                lightAnimThir.gotoAndPlay(0);
                break;
            }
        }
    }

    function setComplete() {
        for (let i = 1; i <= 16; i++) {
            if (i !== 1) {
                gr.animMap['_prizeTableTop1TexEndAnim_1'].clone(['_prizeTableBoard_' + i], '_prizeTableTop1TexEndAnim_' + i);
                gr.animMap['_prizeTableTop1TexOnAnim_1'].clone(['_prizeTableBoard_' + i], '_prizeTableTop1TexOnAnim_' + i);
            }
            gr.animMap['_prizeTableTop1TexOnAnim_' + i].index = i;
            gr.animMap['_prizeTableTop1TexOnAnim_' + i]._onComplete = function () {
                gr.animMap['_prizeTableTop1TexEndAnim_' + this.index].stop();
                gr.animMap['_prizeTableTop1TexEndAnim_' + i].state = 1;
                gr.animMap['_prizeTableTop1TexEndAnim_' + this.index].play();
            };
            gr.animMap['_prizeTableTop1TexEndAnim_' + i].state = 1;//0: auto play  1: play after _prizeTableTop1TexOnAnim_
        }

        for (let i = 0; i < 16; i++) {
            let colNum = 0;
            switch (Math.floor(i / 4)) {
                case 0:
                {
                    colNum = 9;
                    break;
                }
                case 1:
                {
                    colNum = 7;
                    break;
                }
                case 2:
                {
                    colNum = 5;
                    break;
                }
                case 3:
                {
                    colNum = 4;
                    break;
                }
            }
            for (let j = 0; j < colNum; j++) {
                if (i === 0 || i === 4 || i === 8 || i === 12) {
                    gr.animMap['_redStoneNumUpAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumOutAnim_' + (i + 1) + '_' + j);
                    gr.animMap['_redStoneNumDownAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumInAnim_' + (i + 1) + '_' + j);
                }
                if (i === 1 || i === 5 || i === 9 || i === 13) {
                    gr.animMap['_greenStoneNumLeftAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumOutAnim_' + (i + 1) + '_' + j);
                    gr.animMap['_greenStoneNumRightAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumInAnim_' + (i + 1) + '_' + j);
                }
                if (i === 2 || i === 6 || i === 10 || i === 14) {
                    gr.animMap['_yellowStoneNumUpAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumInAnim_' + (i + 1) + '_' + j);
                    gr.animMap['_yellowStoneNumDownAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumOutAnim_' + (i + 1) + '_' + j);
                }
                if (i === 3 || i === 7 || i === 11 || i === 15) {
                    gr.animMap['_blueStoneNumLeftAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumInAnim_' + (i + 1) + '_' + j);
                    gr.animMap['_blueStoneNumRightAnim'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_stoneBaseNumOutAnim_' + (i + 1) + '_' + j);
                }
                if (i === 0 && j === 0) {
                    //_BaseLineTXAnim_1_0 have exist
                } else {
                    gr.animMap['_BaseLineTXAnim_1_0'].clone(["_BaseLineTX_" + (i + 1) + "_" + j], '_BaseLineTXAnim_' + (i + 1) + '_' + j);
                }
            }
        }

        for (let i = 0; i < 16; i++) {
            let lastcolIndex = 0;
            switch (Math.floor(i / 4)) {
                case 0:
                {
                    lastcolIndex = 8;
                    break;
                }
                case 1:
                {
                    lastcolIndex = 6;
                    break;
                }
                case 2:
                {
                    lastcolIndex = 4;
                    break;
                }
                case 3:
                {
                    lastcolIndex = 3;
                    break;
                }
            }
            gr.lib['_BaseLinePattenLight_' + (i + 1) + "_" + lastcolIndex].onComplete = function () {
                for (let i = 0; i < this.colCount; i++) {
                    gr.lib['_BaseLineTX_' + this.lineIndex + '_' + i].show(false);
                    gr.lib["_BaseWinLineTX_" + this.lineIndex + "_" + i].show(false);
                }
                gr.lib['_prizeTableBoard_' + this.lineIndex].show(true);
                gr.animMap['_prizeTableTop1TexOnAnim_' + this.lineIndex].play();
                let line = Math.floor((this.lineIndex - 1) / 4);
                if (line === 3) {
                    gr.lib["_StonePatten_" + this.lineIndex].show(true);
                    gr.lib["_StonePatten_" + (this.lineIndex + 4)].show(true);
                    if (!revealedAll) {
                        gr.lib["_StonePatten_" + this.lineIndex].gotoAndPlay("pattenLight4", 0.25, true);
                        gr.lib["_StonePatten_" + (this.lineIndex + 4)].gotoAndPlay("pattenLight5", 0.25, true);
                    }
                } else {
                    gr.lib["_StonePatten_" + this.lineIndex].show(true);
                    if (!revealedAll) {
                        gr.lib["_StonePatten_" + this.lineIndex].gotoAndPlay("pattenLight" + (line + 1), 0.25, true);
                    }
                }
            };
        }

        gr.animMap['_powerBollJumpingAnim']._onComplete = function () {
            if (currentDrawSpeed === 1) {
                gr.lib._powerBallLightAnim.gotoAndPlay('numLight', 0.5);
            }
            playDrawLightAnim();
        };

        gr.animMap['_powerBollJumpingAnim2']._onComplete = function () {
            playDrawLightAnim();
        };

        lightAnimFir.onComplete = function () {
            playStoneBrokenAnim(lineNumber1, colNumber1, revealAnimPlayRate);
            if (currentDrawSpeed === 1) {
                setTimeout(function () {
                    lightAnimFirEnd = true;
                }, Number(intervalTime / 2));
            } else {
                lightAnimFirEnd = true;
            }
        };

        lightAnimSec.onComplete = function () {
            playStoneBrokenAnim(lineNumber2, colNumber2, revealAnimPlayRate);
            lightAnimSecEnd = true;
        };

        lightAnimThir.onComplete = function () {
            playStoneBrokenAnim(lineNumber3, colNumber3, revealAnimPlayRate);
            lightAnimThirEnd = true;
        };

        gr.lib._colorWave.onComplete = function () {
            gr.lib._corssLight.show(false);
            gr.lib._shockWave.show(false);
            gr.lib._colorWave.show(false);
            setGridSymbol();
        };

        gr.lib['_BaseLineShuffle_16_3'].onComplete = function () {
            playEncircleFlashAnim();
            if (showState === 2) {
                for (let i = 1; i <= 16; i++) {
                    gr.animMap['_prizeTableTop1TexEndAnim_' + i].stop();
                    gr.animMap['_prizeTableTop1TexEndAnim_' + i].state = 0;
                    gr.animMap['_prizeTableTop1TexEndAnim_' + i].play();
                }
            } else {
                buttonDraw.enable(true);
                gr.lib._buttonDraw.updateCurrentStyle({"_opacity": "1"});
                gr.lib._drawText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
                gr.lib._drawAnim.show(true);
                enableButtons();
                msgBus.publish('enableButtonInfo');
            }
        };

        gr.animMap['_prizeTableTop1TexEndAnim_16']._onComplete = function () {
            if (showState === 2 && this.state === 0) {
                enableButtons();
                msgBus.publish('enableButtonInfo');
            } else if (showState === 2 && this.state === 1 && !drawAnimStartBool) {
                buttonShuffle.enable(true);
                gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "1"});
                gr.lib._shuffleText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
            }
            if (showState === 2 && this.state === 1) {
                msgBus.publish('enableButtonInfo');
                buttonContinue.show(true);
            }
        };

        for (let i = 1; i < 8; i++) {
            gr.lib['_encircleFlash' + i].onComplete = function () {
                if (!encircleFlashFirstTime) {
                    if (this.playTimes < 2) {
                        gr.lib['_encircleFlash' + this.index].gotoAndPlay("flashSurround", encircleFlashTime);
                        gr.lib['_encircleFlash' + this.index].playTimes += 1;
                    } else {
                        gr.lib['_encircleFlash' + this.index].playTimes = 0;
                    }
                }
            };
        }
        gr.lib._encircleFlash8.onComplete = function () {
            if (encircleFlashFirstTime) {
                for (let i = 1; i < 9; i++) {
                    gr.lib['_encircleFlash' + i].stopPlay();
                    gr.lib['_encircleFlash' + i].show(false);
                }
                encircleFlashFirstTime = false;
                gr.lib._corssLight.show(true);
                gr.lib._corssLight.gotoAndPlay("corssLight", corssLightTime);
                gr.lib._shockWave.show(true);
                gr.lib._shockWave.gotoAndPlay("shockWave", shockWaveTime);
                gr.lib._colorWave.show(true);
                gr.lib._colorWave.gotoAndPlay("colorWave", colorWaveTime);
                gr.animMap['_prizeTableBoardDisapper'].play();
            } else {
                if (this.playTimes < 2) {
                    gr.lib['_encircleFlash' + this.index].gotoAndPlay("flashSurround", encircleFlashTime);
                    gr.lib['_encircleFlash' + this.index].playTimes += 1;
                } else {
                    gr.lib['_encircleFlash' + this.index].playTimes = 0;
                }
            }
        };
    }

    function onStartUserInteraction(data) {
        if (!data.scenario) {
            return;
        }
        allLineLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        drawGridSymbolNum = [];
        drawGridSymbolTotal = 0;
        drawGridSymbolCount = 0;
        drawGridSymbolNum = data.scenario.split(',');
        drawGridSymbolTotal = drawGridSymbolNum.length;
        winValue = 0;
        //if (data.playResult === "WIN") {
        prizeValue = data.prizeValue;
        //} else {
        //    prizeValue = 0;
        //}
        json_rds = {
            revealDataSave: {},
            wagerDataSave: {},
            spots: 0,
            amount: 0
        };
        encircleFlashFirstTime = true;
        buttonShuffle.show(true);
        buttonPrizes.show(true);
        buttonContinue.show(false);
        buttonSpeed.show(true);
        for (let i = 0; i < 4; i++) {
            gr.lib['_speed_0' + i].show(false);
        }
        buttonDraw.show(true);
        disableButtons();

        if (SKBeInstant.config.wagerType !== 'TRY') {
            if (SKBeInstant.isSKB()) {
                ticketId = data.ticketId;
            } else {
                ticketId = data.scenario;
            }

            var targetData = getRevealDataFromResponse(data);
            if (targetData) {
                //
            } else {
                targetData = {};
            }
            if (SKBeInstant.config.gameType !== 'normal' && targetData[ticketId]) {
                json_rds.revealDataSave[ticketId] = targetData[ticketId];
                handleData(targetData[ticketId]);
                if (allGridSymbolNum.length === 100 && allLineLetter.length === 16 && revealPrizeTableValue.length === 16) {
                    //customer had drawed numbers in last game, so customer can't shuffle numbers
                    revealDataExist = true;
                    for (let i = 1; i <= 16; i++) {
                        gr.lib['_prizeTableBoard_' + i].show(false);
                        gr.lib["_prizeTableBoard_" + i].setText(SKBeInstant.formatCurrency(revealPrizeTableValue[i - 1]).formattedAmount);
                    }
                    buttonShuffle.show(false);
                } else {
                    //customer just buy ticket in last game, so customer can shuffle numbers
                    allGridSymbolNum = [];
                    //create the number array contains 1 to 100 
                    for (let i = 0; i < 100; i++) {
                        allGridSymbolNum[i] = i + 1;
                    }
                    allLineLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
                    for (let i = 1; i <= 16; i++) {
                        gr.lib['_prizeTableBoard_' + i].show(false);
                    }
                }

                encircleFlashFirstTime = false;
                if (!revealDataExist) {
                    getDefaultSpeed();
                }
                setGridSymbol();

                return;
            }
            setEmptyRevealDataSave(data);
        }
        getDefaultSpeed();
        if (SKBeInstant.config.gameType === 'ticketReady') {
            for (let i = 1; i <= 16; i++) {
                gr.lib['_prizeTableBoard_' + i].show(false);
            }
            encircleFlashFirstTime = false;
            setGridSymbol();
        } else {
            setUpSpine();
        }
    }

    function disableButtons() {
        buttonShuffle.enable(false);
        buttonPrizes.enable(false);
        buttonSpeed.enable(false);
        buttonDraw.enable(false);
        gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._buttonPrizes.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._buttonDraw.updateCurrentStyle({"_opacity": "0.6"});
        gr.lib._shuffleText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._prizesText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._speedText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._drawText.updateCurrentStyle({"_opacity": "0.6", "_text": {"_strokeColor": "82d3ac", "_gradient": {"_color": ['3f2b70', '5f4cb2'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._drawAnim.show(false);
    }

    function getRevealDataFromResponse(data) {
        var targetData;
        if (!data.revealData || data.revealData === "null") //jLottery MTM will return "null" revealData WFTIW-108
        {
            return;
        }
        if (SKBeInstant.isSKB()) {
            targetData = data.revealData;
        } else {
            var responseRevealData = data.revealData.replace(/\\/g, '');
            responseRevealData = JSON.parse(responseRevealData);
            targetData = responseRevealData;
        }
        return targetData;
    }

    function handleData(revealdata) {
        allGridSymbolNum = [];
        allLineLetter = [];
        revealPrizeTableValue = [];
        var strAllNumber = revealdata.allNumbers;
        var strPriceTable = revealdata.priceTables;
        if (revealdata.speed) {
            speedController = Number(revealdata.speed);
            if (speedController < 1 || speedController > 4) {
                speedController = 2;
            }
        }
        if (strAllNumber) {
            strAllNumber = strAllNumber.split(',');
            for (let i = 0; i < strAllNumber.length; i++) {
                allGridSymbolNum.push(Number(strAllNumber[i]));
            }
        }
        if (strPriceTable) {
            strPriceTable = strPriceTable.split(',');
            for (let i = 0; i < strPriceTable.length; i++) {
                var letter = strPriceTable[i].substring(0, 1);
                var price = strPriceTable[i].substring(1, strPriceTable[i].length);
                allLineLetter.push(letter);
                revealPrizeTableValue.push(price);
            }
        }
    }

    function setGridSymbol() {
        //random sort the number array
        if (!revealDataExist) {
            randomSortNum(allGridSymbolNum);
        }

        //create the map of all grid symbol
        gridSymbolLineMap = [];
        let arrIndex = 0;
        let lineIndex = 0;
        for (let index = 0; index < allLineLetter.length; index++) {
            let singleLine = {};
            let singleLineNumList = [];
            let singleLineNumState = [];
            let imgList = [];
            let colNum = 0;
            switch (Math.floor(gridSymbolLineMap.length / 4)) {
                case 0:
                {
                    colNum = 9;
                    break;
                }
                case 1:
                {
                    colNum = 7;
                    break;
                }
                case 2:
                {
                    colNum = 5;
                    break;
                }
                case 3:
                {
                    colNum = 4;
                    break;
                }
            }
            for (let j = 0; j < colNum; j++) {
                singleLineNumList[j] = allGridSymbolNum[arrIndex++];
                singleLineNumState[j] = false;
                imgList[j] = '';
                gr.lib["_BaseLineTX_" + (lineIndex + 1) + "_" + j].setText(singleLineNumList[j]);
                gr.lib["_BaseWinLineTX_" + (lineIndex + 1) + "_" + j].setText(singleLineNumList[j]);
            }
            singleLine.numList = singleLineNumList;
            singleLine.numState = singleLineNumState;
            singleLine.img = imgList;
            singleLine.state = false;
            singleLine.lineLetter = allLineLetter[index];
            if (revealDataExist) {
                singleLine.price = revealPrizeTableValue[index];
            } else {
                if (prizeTable[allLineLetter[index]]) {
                    singleLine.price = prizeTable[allLineLetter[index]];
                } else {
                    singleLine.price = 0;
                }
            }
            singleLine.drawCount = 0;
            gridSymbolLineMap.push(singleLine);
            lineIndex++;
        }
        start = null;
        showState = 1;
        stoneIndex = 1;
        window.requestAnimationFrame(playAllAnimation);
    }

    function setEmptyRevealDataSave(data) {
        json_rds.revealDataSave = {};
        json_rds.revealDataSave[ticketId] = {};
        json_rds.revealDataSave[ticketId].price = data.price;
        json_rds.revealDataSave[ticketId].allNumbers = '';
        json_rds.revealDataSave[ticketId].priceTables = '';
        json_rds.revealDataSave[ticketId].speed = '';
        publishMSG();
    }

    function setUpSpine() {
        if (backgroundInAnim !== null) {
            gr.lib._BackgroundInAnim.pixiContainer.removeChild(backgroundInAnim);
            backgroundInAnim = null;
        }
        gr.lib._BackgroundInAnim.show(true);
        backgroundInAnim = new PIXI.spine.Spine(resLib.spine.backgroundEffects_spine.spineData);
        backgroundInAnim.state.addAnimation(0, spineInAnimName, false, 0);
        backgroundInAnim.data = {"_name": "spineBackground"};
        backgroundInAnim.styleData = spineStyle;
        backgroundInAnim.x = spineStyle.x;
        backgroundInAnim.y = spineStyle.y;
        backgroundInAnim.scale.x = spineStyle.scaleX;
        backgroundInAnim.scale.y = spineStyle.scaleY;
        gr.lib._BackgroundInAnim.pixiContainer.addChild(backgroundInAnim);

        if (backgroundStaticAnim === null) {
            backgroundStaticAnim = new PIXI.spine.Spine(resLib.spine.backgroundEffects_spine.spineData);
            backgroundStaticAnim.state.addAnimation(1, spineStaticAnimName, true, 0);
            backgroundStaticAnim.data = {"_name": "spineBackground"};
            backgroundStaticAnim.styleData = spineStyle;
            backgroundStaticAnim.x = spineStyle.x;
            backgroundStaticAnim.y = spineStyle.y;
            backgroundStaticAnim.scale.x = spineStyle.scaleX;
            backgroundStaticAnim.scale.y = spineStyle.scaleY;
            gr.lib._BackgroundStaticAnim.pixiContainer.addChild(backgroundStaticAnim);
        }

        setTimeout(function () {
            if (config.audio && config.audio.GameStart) {
                audio.play(config.audio.GameStart.name, config.audio.GameStart.channel);
            }
            gr.lib._BackgroundInAnim.show(false);
            gr.lib._BackgroundStaticAnim.show(true);
            var flashTime = 0.5;
            for (let i = 1; i < 9; i++) {
                gr.lib['_encircleFlash' + i].show(true);
                gr.lib['_encircleFlash' + i].gotoAndPlay("flashSurround", flashTime);
            }
        }, 800);
        setTimeout(function () {
            if (backgroundOutAnim !== null) {
                gr.lib._BackgroundOutAnim.pixiContainer.removeChild(backgroundOutAnim);
                backgroundOutAnim = null;
            }
            gr.lib._BackgroundStaticAnim.show(false);
            gr.lib._BackgroundOutAnim.show(true);
            backgroundOutAnim = new PIXI.spine.Spine(resLib.spine.backgroundEffects_spine.spineData);
            backgroundOutAnim.state.addListener({
                complete: function (track, event) {
                    console.log(track + event);
                    gr.lib._BackgroundOutAnim.show(false);
                }
            });
            backgroundOutAnim.state.addAnimation(2, spineOutAnimName, false, 0);
            backgroundOutAnim.data = {"_name": "spineBackground"};
            backgroundOutAnim.styleData = spineStyle;
            backgroundOutAnim.x = spineStyle.x;
            backgroundOutAnim.y = spineStyle.y;
            backgroundOutAnim.scale.x = spineStyle.scaleX;
            backgroundOutAnim.scale.y = spineStyle.scaleY;
            gr.lib._BackgroundOutAnim.pixiContainer.addChild(backgroundOutAnim);
        }, 3000);
    }

    function enableButtons() {
        buttonShuffle.enable(true);
        buttonPrizes.enable(true);
        buttonContinue.enable(true);
        buttonSpeed.enable(true);
        gr.lib._buttonShuffle.updateCurrentStyle({"_opacity": "1"});
        gr.lib._buttonPrizes.updateCurrentStyle({"_opacity": "1"});
        gr.lib._buttonContinue.updateCurrentStyle({"_opacity": "1"});
        gr.lib._buttonSpeed.updateCurrentStyle({"_opacity": "1"});
        gr.lib._shuffleText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._prizesText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._continueText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "ffeda3", "_gradient": {"_color": ['ed1577', '7e042d'], "_stop": [0, 1], "_type": "vertical"}}});
        gr.lib._speedText.updateCurrentStyle({"_opacity": "1", "_text": {"_strokeColor": "5d70ff", "_color": 'fef4cf', "_gradient": {"_color": ['000000', '000000'], "_stop": [0, 1], "_type": "vertical"}}});
    }

    function escapeCharacter(rdsData) {
        return {revealDataSave: JSON.stringify(rdsData.revealDataSave), wagerDataSave: JSON.stringify(rdsData.wagerDataSave), spots: 0, amount: 0};
    }

    function publishMSG() {
        if (SKBeInstant.config.wagerType !== 'TRY') {
            if (SKBeInstant.isSKB()) {
                msgBus.publish('jLotteryGame.revealDataSave', json_rds);
            } else {
                msgBus.publish('jLotteryGame.revealDataSave', escapeCharacter(json_rds));
            }
        }
    }

    function onPlayerWantsPlayAgain() {
        revealedAll = false;
        setGridSymbolInit();
        gr.lib._centreAnim.show(false);
        gr.lib._MeterDrawsNum.setText(loader.i18n.Game.meterDrawsNum);
        for (let i = 1; i <= 16; i++) {
            gr.lib['_prizeTableBoard_' + i].show(true);
            gr.lib['_prizeTableBoard_' + i].updateCurrentStyle({'_opacity': '1'});
        }
    }

    function onReInitialize() {
        revealedAll = false;
        setGridSymbolInit();
        gr.lib._centreAnim.show(false);
        gr.lib._MeterDrawsNum.setText(loader.i18n.Game.meterDrawsNum);
        for (let i = 1; i <= 16; i++) {
            gr.lib['_prizeTableBoard_' + i].show(true);
            gr.lib['_prizeTableBoard_' + i].updateCurrentStyle({'_opacity': '1'});
        }
    }

    function onReStartUserInteraction(data) {
        if (!data.scenario) {
            return;
        }
        reStartUserInteractionBool = true;
        allLineLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        drawGridSymbolNum = [];
        drawGridSymbolTotal = 0;
        drawGridSymbolCount = 0;
        drawGridSymbolNum = data.scenario.split(',');
        drawGridSymbolTotal = drawGridSymbolNum.length;
        winValue = 0;
        //if (data.playResult === "WIN") {
        prizeValue = data.prizeValue;
        //} else {
        //    prizeValue = 0;
        //}
        json_rds = {
            revealDataSave: {},
            wagerDataSave: {},
            spots: 0,
            amount: 0
        };
        encircleFlashFirstTime = true;
        buttonShuffle.show(true);
        buttonPrizes.show(true);
        buttonContinue.show(false);
        buttonSpeed.show(true);
        for (let i = 0; i < 4; i++) {
            gr.lib['_speed_0' + i].show(false);
        }
        buttonDraw.show(true);
        disableButtons();

        if (SKBeInstant.config.wagerType !== 'TRY') {
            if (SKBeInstant.isSKB()) {
                ticketId = data.ticketId;
            } else {
                ticketId = data.scenario;
            }
            setEmptyRevealDataSave(data);
        }
        setUpSpine();
    }

    function onTicketCostChanged(prizePoint) {
        if (!setPrizeTableStyle) {
            for (let i = 1; i <= 16; i++) {
                gr.lib['_prizeTableBoard_' + i].autoFontFitText = true;
                if (config.style.prizeTable_Text) {
                    gameUtils.setTextStyle(gr.lib['_prizeTableBoard_' + i], config.style.prizeTable_Text);
                }
            }
            setPrizeTableStyle = true;
        }
        var prizeTableValue = [];
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (let i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                var pt = rc[i].prizeTable;
                for (let j = 0; j < pt.length; j++) {
                    prizeTableValue.push([pt[j].prize]);
                }
                break;
            }
        }
        prizeTableValue.sort(function (a, b) {
            return b - a;
        });
        prizeTable = {};
        if (revealDataExist) {
            for (let i = 0; i < prizeTableValue.length; i++) {
                prizeTable[prizeLetter[i]] = prizeTableValue[i];
            }
        } else {
            for (let i = 0; i < prizeTableValue.length; i++) {
                prizeTable[prizeLetter[i]] = prizeTableValue[i];
                gr.lib["_prizeTableBoard_" + (i + 1)].setText(SKBeInstant.formatCurrency(prizeTableValue[i]).formattedAmount);
                if (gridSymbolLineMap.length === prizeTableValue.length) {
                    gridSymbolLineMap[i].price = prizeTableValue[i];
                }
            }
        }
    }

    function onEnterResultScreenState() {
        buttonContinue.show(false);
        buttonPrizes.show(false);
        buttonSpeed.show(false);
        gr.lib._MeterDraws.show(false);
        revealedAll = true;
        for (let i = 1; i <= 20; i++) {
            gr.lib["_StonePatten_" + i].stopPlay();
        }
        msgBus.publish('enableButtonInfo');
    }

    function playEncircleFlashAnim() {
        if (encircleFlashInterval) {
            clearInterval(encircleFlashInterval);
            encircleFlashInterval = null;
        }
        let index = 1;
        if (!drawAnimStartBool) {
            gr.lib['_encircleFlash' + index].show(true);
            gr.lib['_encircleFlash' + index].stopPlay();
            gr.lib['_encircleFlash' + index].gotoAndPlay("flashSurround", encircleFlashTime);
            gr.lib['_encircleFlash' + index].playTimes += 1;
            setTimeout(function () {
                if (!drawAnimStartBool) {
                    gr.lib['_encircleFlash' + (index + 4)].show(true);
                    gr.lib['_encircleFlash' + (index + 4)].stopPlay();
                    gr.lib['_encircleFlash' + (index + 4)].gotoAndPlay("flashSurround", encircleFlashTime);
                    gr.lib['_encircleFlash' + (index + 4)].playTimes += 1;
                }
            }, 500);
        }
        if (!drawAnimStartBool) {
            encircleFlashInterval = setInterval(function () {
                if (index > 3) {
                    index = 1;
                } else {
                    index++;
                }
                if (!drawAnimStartBool) {
                    gr.lib['_encircleFlash' + index].show(true);
                    gr.lib['_encircleFlash' + index].stopPlay();
                    gr.lib['_encircleFlash' + index].gotoAndPlay("flashSurround", encircleFlashTime);
                    gr.lib['_encircleFlash' + index].playTimes += 1;
                    setTimeout(function () {
                        if (!drawAnimStartBool) {
                            gr.lib['_encircleFlash' + (index + 4)].show(true);
                            gr.lib['_encircleFlash' + (index + 4)].stopPlay();
                            gr.lib['_encircleFlash' + (index + 4)].gotoAndPlay("flashSurround", encircleFlashTime);
                            gr.lib['_encircleFlash' + (index + 4)].playTimes += 1;
                        }
                    }, 500);
                }
            }, 4000);
        }
    }

    function stopEncircleFlashAnim() {
        if (encircleFlashInterval) {
            clearInterval(encircleFlashInterval);
            encircleFlashInterval = null;
        }
        for (let i = 1; i < 9; i++) {
            gr.lib['_encircleFlash' + i].stopPlay();
            gr.lib['_encircleFlash' + i].show(false);
        }
    }

    function playDrawButtonSpineAnim() {
        let drawButtonAnim = new PIXI.spine.Spine(resLib.spine.skeleton.spineData);
        let style = {x: 131, y: 43, scaleX: 1, scaleY: 1};
        drawButtonAnim.state.addAnimation(0, 'buttonGlow', true, 0);
        drawButtonAnim.data = {"_name": "buttonGlow"};
        drawButtonAnim.styleData = style;
        drawButtonAnim.x = style.x;
        drawButtonAnim.y = style.y;
        drawButtonAnim.scale.x = style.scaleX;
        drawButtonAnim.scale.y = style.scaleY;
        gr.lib._drawAnim.pixiContainer.addChild(drawButtonAnim);
    }

    function getDefaultSpeed() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.defaultSpeed) {
                let speed = Number(SKBeInstant.config.customBehavior.defaultSpeed);
                if (speed === 1 || speed === 2 || speed === 3 || speed === 4) {
                    speedController = speed;
                }
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.defaultSpeed) {
                let speed = Number(loader.i18n.gameConfig.defaultSpeed);
                if (speed === 1 || speed === 2 || speed === 3 || speed === 4) {
                    speedController = speed;
                }
            }
        }
    }

    function getDefaultRevealAnimRate() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.revealAnimPlayRate) {
                let parameter = Number(SKBeInstant.config.customBehavior.revealAnimPlayRate);
                if (parameter >= 0.1 && parameter <= 1) {
                    revealAnimPlayRate = parameter;
                }
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.revealAnimPlayRate) {
                let parameter = Number(loader.i18n.gameConfig.revealAnimPlayRate);
                if (parameter >= 0.1 && parameter <= 1) {
                    revealAnimPlayRate = parameter;
                }
            }
        }
    }

    function iSFourSpeedAllreveal() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.fourSpeedAllreveal === true) {
                fourSpeedAllreveal = true;
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.fourSpeedAllreveal === true) {
                fourSpeedAllreveal = true;
            }
        }
    }

    function setStoneBreathInterval() {
        let opacity = 1;
        let addOpacity = false;
        gr.getTimer().setInterval(function () {
            if (opacity >= 1) {
                addOpacity = false;
            }
            if (opacity <= 0.5) {
                addOpacity = true;
            }
            for (let i = 0; i < 16; i++) {
                let colNum = 0;
                switch (Math.floor(i / 4)) {
                    case 0:
                    {
                        colNum = 9;
                        break;
                    }
                    case 1:
                    {
                        colNum = 7;
                        break;
                    }
                    case 2:
                    {
                        colNum = 5;
                        break;
                    }
                    case 3:
                    {
                        colNum = 4;
                        break;
                    }
                }
                for (let j = 0; j < colNum; j++) {
                    gr.lib['_stoneBreathAnim_' + (i + 1) + "_" + j].updateCurrentStyle({"_opacity": opacity});
                }
            }
            if (addOpacity) {
                opacity += 0.1;
            } else {
                opacity -= 0.1;
            }
        }, 100);
    }
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.error', function () {
        errorOn = true;
    });
    msgBus.subscribe('drawStoped', showPrizeTableText);
    msgBus.subscribe('resultDialogClosed', function () {
        revealedAll = false;
        for (let i = 0; i < 16; i++) {
            if (gridSymbolLineMap[i].drawCount === gridSymbolLineMap[i].numList.length) {
                let line = Math.floor(i / 4);
                if (line === 3) {
                    gr.lib["_StonePatten_" + (i + 1)].gotoAndPlay("pattenLight4", 0.25, true);
                    gr.lib["_StonePatten_" + ((i + 1) + 4)].gotoAndPlay("pattenLight5", 0.25, true);
                } else {
                    gr.lib["_StonePatten_" + (i + 1)].gotoAndPlay("pattenLight" + (line + 1), 0.25, true);
                }
            }
        }
    });
});

