/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
    style: {
        win_Text: {dropShadow: true, dropShadowDistance: 1, dropShadowAlpha: 0.4, dropShadowAngle: Math.PI / 3, dropShadowBlur: 5, dropShadowColor: "#a3001f"},
        win_Try_Text: {dropShadow: true, dropShadowDistance: 2, dropShadowAlpha: 0.8, dropShadowAngle: Math.PI / 3, dropShadowBlur: 5, dropShadowColor: "#a3001f"},
        win_Value_color: {dropShadow: true, dropShadowDistance: 0, dropShadowAlpha: 0.8, dropShadowBlur: 5, dropShadowColor: "#a3001f"},
        simpleWinText: {dropShadow: true, dropShadowDistance: 1, dropShadowAlpha: 0.4, dropShadowAngle: Math.PI / 3, dropShadowBlur: 5, dropShadowColor: "#a3001f"},
        simpleWinTryText: {dropShadow: true, dropShadowDistance: 2, dropShadowAlpha: 0.8, dropShadowAngle: Math.PI / 3, dropShadowBlur: 5, dropShadowColor: "#a3001f"},
        simpleWinValue: {dropShadow: true, dropShadowDistance: 0, dropShadowAlpha: 0.8, dropShadowBlur: 5, dropShadowColor: "#a3001f"},
        nonWin_Text: {dropShadow: true, dropShadowDistance: 2, dropShadowAlpha: 0.8, dropShadowAngle: Math.PI / 3, dropShadowBlur: 5, dropShadowColor: "#37070b"},
        errorText: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.8, dropShadowBlur: 10},
        warningText: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.8, dropShadowBlur: 10},
        tutorialTitleText: {dropShadow: false, dropShadowDistance: 5, dropShadowAlpha: 0.8, dropShadowBlur: 10, dropShadowColor: "#37070b"},
        tutorialText: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.8, dropShadowBlur: 10, dropShadowColor: "#110323"},
        winUpToText: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.5, dropShadowBlur: 5, dropShadowColor: "#060317"},
        winUpToValue: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.5, dropShadowBlur: 5, dropShadowColor: "#060317"},
        draw_Text: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.8, dropShadowAngle: Math.PI / 3, dropShadowBlur: 20, dropShadowColor: "#181313"},
        ticketCost_Text: {dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.8, dropShadowAngle: Math.PI / 3, dropShadowBlur: 20, dropShadowColor: "#020415"},
        prizeTable_Text: {dropShadow: true, dropShadowDistance: 4, dropShadowAlpha: 0.5, dropShadowAngle: 0, dropShadowBlur: 10, dropShadowColor: "#444444"},
        symbolWin_Text: {dropShadow: true, dropShadowDistance: 0, dropShadowAlpha: 0.7, dropShadowBlur: 10, dropShadowColor: "#256e9a"},
        //symbolBase_Text: {dropShadow: false, dropShadowDistance: 1, dropShadowAlpha: 0.4, dropShadowAngle: Math.PI / 3, dropShadowBlur: 5, dropShadowColor: "#c24c1e"},
        powerBallText: {dropShadow: true, dropShadowDistance: 0, dropShadowAlpha: 0.7, dropShadowBlur: 10, dropShadowColor: "#256e9a"}
    },
    backgroundStyle: {
        "splashSize": "100% 100%",
        "gameSize": "100% 100%"
    },
    winMaxValuePortrait: true,
    winUpToTextFieldSpace: 10,
    textAutoFit: {
        "buyText": {
            "isAutoFit": true
        },
        "tryText": {
            "isAutoFit": true
        },
        "shuffleText": {
            "isAutoFit": true
        },
        "prizesText": {
            "isAutoFit": true
        },
        "continueText": {
            "isAutoFit": true
        },
        "speedText": {
            "isAutoFit": true
        },
        "drawText": {
            "isAutoFit": true
        },
        "drawedText": {
            "isAutoFit": true
        },
        "meterDrawsText": {
            "isAutoFit": true
        },
        "meterDrawsNum": {
            "isAutoFit": true
        },
        "powerBallText": {
            "isAutoFit": true
        },
        "warningExitText": {
            "isAutoFit": true
        },
        "warningContinueText": {
            "isAutoFit": true
        },
        "warningText": {
            "isAutoFit": true
        },
        "errorExitText": {
            "isAutoFit": true
        },
        "errorTitle": {
            "isAutoFit": true
        },
        "errorText": {
            "isAutoFit": false
        },
        "exitText": {
            "isAutoFit": true
        },
        "winBoxErrorExitText": {
            "isAutoFit": true
        },
        "winBoxErrorText": {
            "isAutoFit": true
        },
        "playAgainText": {
            "isAutoFit": true
        },
        "playAgainMTMText": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        },
        "win_Text": {
            "isAutoFit": true
        },
        "win_Try_Text": {
            "isAutoFit": true
        },
        "win_Value": {
            "isAutoFit": true
        },
        "simpleWinText": {
            "isAutoFit": true
        },
        "simpleWinTryText": {
            "isAutoFit": true
        },
        "simpleWinValue": {
            "isAutoFit": true
        },
        "closeWinText": {
            "isAutoFit": true
        },
        "nonWin_Text": {
            "isAutoFit": true
        },
        "closeNonWinText": {
            "isAutoFit": true
        },
        "win_Value_color": {
            "isAutoFit": true
        },
        "ticketCostText": {
            "isAutoFit": true
        },
        "ticketCostValue": {
            "isAutoFit": true
        },
        "tutorialTitleText": {
            "isAutoFit": true
        },
        "closeTutorialText": {
            "isAutoFit": true
        },
        "winUpToText": {
            "isAutoFit": true
        },
        "winUpToValue": {
            "isAutoFit": true
        },
        "prizeTableText": {
            "isAutoFit": true
        },
        "prizeText": {
            "isAutoFit": true
        },
        "prizeWinText": {
            "isAutoFit": true
        },
        "versionText": {
            "isAutoFit": true
        }
    },
    audio: {
        "gameLoop": {
            "name": "MusicLoop",
            "channel": "0"
        },
        "gameWin": {
            "name": "MusicLoopTermWin",
            "channel": "0"
        },
        "gameNoWin": {
            "name": "MusicLoopTermLose",
            "channel": "0"
        },
        "ButtonSoundOn": {
            "name": "UiMoveToMoney",
            "channel": "3"
        },
        /* "ButtonSoundOff": {
         "name": "Button_SoundOff",
         "channel": "0"
         },*/
        "ButtonBetMax": {
            "name": "UiBetMax",
            "channel": "0"
        },
        "ButtonBetUp": {
            "name": "UiBetUp",
            "channel": ["0", "1"]
        },
        "ButtonBetDown": {
            "name": "UiBetDown",
            "channel": ["0", "1"]
        },
        "GameStart": {
            "name": "GameStart",
            "channel": "1"
        },
        "LineWin": {
            "name": "LineWin",
            "channel": ["4", "5", "6"]
        },
        "NumberRevealFast1": {
            "name": "NumberRevealFast_1",
            "channel": "2"
        },
        "NumberRevealFast2": {
            "name": "NumberRevealFast_2",
            "channel": "2"
        },
        "NumberRevealFast3": {
            "name": "NumberRevealFast_3",
            "channel": "2"
        },
        "NumberRevealSlow1": {
            "name": "NumberRevealSlow_1",
            "channel": "2"
        },
        "NumberRevealSlow2": {
            "name": "NumberRevealSlow_2",
            "channel": "2"
        },
        "NumberRevealSlow3": {
            "name": "NumberRevealSlow_3",
            "channel": "2"
        },
        "ButtonBuy": {
            "name": "UiBuy",
            "channel": "3"
        },
        "ButtonDraw": {
            "name": "UiDraw",
            "channel": "3"
        },
        "ButtonShuffle": {
            "name": "UiShuffle",
            "channel": "3"
        },
        "ButtonPrize": {
            "name": "UiPrizesContinue",
            "channel": "3"
        },
        "ButtonContinue": {
            "name": "UiPrizesContinue",
            "channel": "3"
        },
        "ButtonPlayAgain": {
            "name": "UiPlayAgain",
            "channel": "3"
        },
        "ButtonMoveToMoney": {
            "name": "UiMoveToMoney",
            "channel": "3"
        },
        "ButtonInfo": {
            "name": "UiInfoOpen",
            "channel": "3"
        },
        "ButtonGeneric": {
            "name": "UiInfoClose",
            "channel": "3"
        },
        "ButtonSpeed1": {
            "name": "UiSpeed1",
            "channel": "3"
        },
        "ButtonSpeed2": {
            "name": "UiSpeed2",
            "channel": "3"
        },
        "ButtonSpeed3": {
            "name": "UiSpeed3",
            "channel": "3"
        },
        "ButtonSpeed4": {
            "name": "UiSpeed4",
            "channel": "3"
        },
        "PaytableOpen": {
            "name": "UiPaytableOpen",
            "channel": "3"
        },
        "PaytableClose": {
            "name": "UiPaytableClose",
            "channel": "3"
        }
    },
    gladButtonImgName: {
        //audioController
        "buttonAudioOn": "ButtonAudioOn",
        "buttonAudioOff": "ButtonAudioOff",
        //buyAndTryController
        "buttonTry": "ButtonMeter",
        "buttonBuy": "ButtonMeter",
        //errorWarningController
        "warningContinueButton": "ButtonMeter",
        "warningExitButton": "ButtonMeter",
        "errorExitButton": "ButtonMeter",
        //exitAndHomeController
        "buttonExit": "ButtonMeter",
        "buttonHome": "ButtonHome",
        //playAgainController
        "buttonPlayAgain": "ButtonMeter",
        "buttonPlayAgainMTM": "ButtonMeter",
        //playWithMoneyController
        "buttonMTM": "ButtonMeter",
        //resultController
        "buttonWinClose": "ButtonMeterI",
        "buttonNonWinClose": "ButtonMeterI",
        //ticketCostController
        "ticketCostPlus": "ButtonPlus",
        "ticketCostMinus": "ButtonMinus",
        //tutorialController
        "iconOff": "tutorialPageIconOff",
        "iconOn": "tutorialPageIconOn",
        "tutorialButtonClose": "ButtonMeterI",
        "buttonInfo": "ButtonInfor",
        //playAnimationController
        "buttonShuffle": "ButtonMeter",
        "buttonPrizes": "ButtonMeter",
        "buttonContinue": "ButtonMeter",
        "buttonSpeed": "ButtonSpeed",
        "buttonDraw": "ButtonMeter"

    },
    gameParam: {
        //tutorialController
        "pageNum": 1,
        "arrowPlusSpecial": true,
        "popUpDialog": true
    },
    predefinedStyle: {
        "swirlName": "swirl",
        "splashLogoName": "loadLogo",
        landscape: {
            canvas: {
                width: 1440,
                height: 810
            },
            gameLogoDiv: {
                width: 331,
                height: 164,
                y: 220,
                scale: {
                    x: 1.6,
                    y: 1.6
                }
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.5,
                loop: true,
                y: 600,
                scale: {
                    x: 1,
                    y: 1
                }
            },
            brandCopyRightDiv: {
                bottom: 20,
                fontSize: 18,
                color: "#70410b",
                fontFamily: '"Arial"'
            },
            progressTextDiv: {
                y: 600,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: "Oswald",
                    stroke: "#0901da",
                    strokeThickness: 4,
                    dropShadow: true,
                    dropShadowAlpha: 0.25,
                    dropShadowAngle: Math.PI / 3,
                    dropShadowBlur: 5,
                    dropShadowColor: "#0901da",
                    dropShadowDistance: 3
                }
            }
        },
        portrait: {
            canvas: {
                width: 810,
                height: 1228
            },
            gameLogoDiv: {
                width: 331,
                height: 164,
                y: 350,
                scale: {
                    x: 1.6,
                    y: 1.6
                }
            },
            progressSwirl: {
                width: 160,
                height: 160,
                animationSpeed: 0.5,
                loop: true,
                y: 850,
                scale: {
                    x: 1,
                    y: 1
                }
            },
            brandCopyRightDiv: {
                bottom: 20,
                fontSize: 18,
                color: "#70410b",
                fontFamily: '"Arial"'
            },
            progressTextDiv: {
                y: 850,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: "Oswald",
                    stroke: "#0901da",
                    strokeThickness: 4,
                    dropShadow: true,
                    dropShadowAlpha: 0.25,
                    dropShadowAngle: Math.PI / 3,
                    dropShadowBlur: 5,
                    dropShadowColor: "#0901da",
                    dropShadowDistance: 3
                }
            }
        }
    }

});
