/**
 * @module game/meters
 * @description meters control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/currencyHelper/currencyHelper',
    'game/gameUtils',
    'game/configController'
], function (msgBus, gr, loader, SKBeInstant, currencyHelper, gameUtils, config) {

    var resultData = null;
    var MTMReinitial = false;

    function onStartUserInteraction(data) {
        resultData = data;
    }

    function onEnterResultScreenState() {
        if(resultData.prizeValue > 0 || SKBeInstant.isWLA()){
            gr.lib._winsValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
            gameUtils.fixMeter(gr);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        if (MTMReinitial && SKBeInstant.config.balanceDisplayInGame) {
            gr.lib._balanceText.show(true);
            gr.lib._balanceValue.show(true);
            gr.lib._meterDivision0.show(true);
        }
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }
    
    function onUpdateBalance(data){
        if (SKBeInstant.config.balanceDisplayInGame) {
            if (SKBeInstant.isSKB()) {
                gr.lib._balanceValue.setText(currencyHelper.formatBalance(data.balance));
            } else {
                gr.lib._balanceValue.setText(data.formattedBalance);
            }
            gameUtils.fixMeter(gr);
        }
    }
    
    function onGameParametersUpdated(){
        if(SKBeInstant.config.balanceDisplayInGame === false || SKBeInstant.config.wagerType === 'TRY'){
            gr.lib._balanceValue.show(false);
            gr.lib._balanceText.show(false);
            gr.lib._meterDivision0.show(false);
        }
        
        if (config.style.balanceText) {
            gameUtils.setTextStyle(gr.lib._balanceText, config.style.balanceText);
        }
        var balanceText = SKBeInstant.isWLA() ? loader.i18n.Game.balance.toUpperCase() : loader.i18n.Game.balance;
        gr.lib._balanceText.setText(balanceText);
        if (config.style.balanceValue) {
            gameUtils.setTextStyle(gr.lib._balanceValue, config.style.balanceValue);
        }
        if(!SKBeInstant.isSKB()){
           gr.lib._balanceValue.setText('');
        }
        if (config.style.winsText) {
            gameUtils.setTextStyle(gr.lib._winsText, config.style.winsText);
        }
        if (config.style.winsValue) {
            gameUtils.setTextStyle(gr.lib._winsValue, config.style.winsValue);
        }
        if (config.style.ticketCostMeterText) {
            gameUtils.setTextStyle(gr.lib._ticketCostMeterText, config.style.ticketCostMeterText);
        }
        if (config.style.ticketCostMeterValue) {
            gameUtils.setTextStyle(gr.lib._ticketCostMeterValue, config.style.ticketCostMeterValue);
        }
        if (config.style.meterDivision0) {
            gameUtils.setTextStyle(gr.lib._meterDivision0, config.style.meterDivision0);
        }
        if (config.style.meterDivision1) {
            gameUtils.setTextStyle(gr.lib._meterDivision1, config.style.meterDivision1);
        }
        
        var meterWager = SKBeInstant.isWLA() ? loader.i18n.Game.meter_wager.toUpperCase() : loader.i18n.Game.meter_wager;
        gr.lib._ticketCostMeterText.setText(meterWager);
        gr.lib._meterDivision0.setText(loader.i18n.Game.meter_division);
        gr.lib._meterDivision1.setText(loader.i18n.Game.meter_division);
        
        gr.lib._balanceText.originFontSize = gr.lib._balanceText._currentStyle._font._size;
		
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        if(SKBeInstant.config.wagerType === 'BUY'){
            var wins = SKBeInstant.isWLA() ? loader.i18n.Game.wins.toUpperCase() : loader.i18n.Game.wins;
            gr.lib._winsText.setText(wins);
        }else{
            var wins_demo = SKBeInstant.isWLA() ? loader.i18n.Game.wins_demo.toUpperCase() : loader.i18n.Game.wins_demo;
            gr.lib._winsText.setText(wins_demo);
        }
        gameUtils.fixMeter(gr);

    }
    
    function onTicketCostChanged(prizePoint){
        if (SKBeInstant.config.wagerType === 'BUY') {
            var wins = SKBeInstant.isWLA() ? loader.i18n.Game.wins.toUpperCase() : loader.i18n.Game.wins;
            gr.lib._winsText.setText(wins);
            gr.lib._ticketCostMeterValue.setText(SKBeInstant.formatCurrency(prizePoint).formattedAmount);
        } else {
            var wins_demo = SKBeInstant.isWLA() ? loader.i18n.Game.wins_demo.toUpperCase() : loader.i18n.Game.wins_demo;
            gr.lib._winsText.setText(wins_demo);
            gr.lib._ticketCostMeterValue.setText(loader.i18n.Game.demo + SKBeInstant.formatCurrency(prizePoint).formattedAmount);
        }
        gameUtils.fixMeter(gr);
    }
    function onPlayerWantsPlayAgain(){
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }
    
    function onBeforeShowStage(data){
        gr.lib._balanceValue.setText(currencyHelper.formatBalance(data.response.Balances["@totalBalance"]));
        gameUtils.fixMeter(gr);
        gr.forceRender();
    }
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',function(){
        MTMReinitial = true;
    });
    msgBus.subscribe('winboxError', function(){
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    });
    return {};
});