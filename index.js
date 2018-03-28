/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const http = require('https');

const requestOptions = {
      host: 'secure.splitwise.com',
      port: '443',
      path: '/api/v3.0',
      method: 'GET',
      headers: {
        'Authorization': ''
      }
}

function getGroupsOptions(accessToken){
    requestOptions.path += '/get_groups';
    requestOptions.headers.Authorization = 'Bearer ' + accessToken;
    return requestOptions;
}

const APP_ID = 'amzn1.ask.skill.55a94fda-e3c8-463f-aa8e-393a8f52c83f'; // TODO replace with your app ID (OPTIONAL).

const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
        
        var user = this.event.session.user;
        //this.response.speak('Data Retrieved');
        //this.emit(':responseReady');
        
       // return;
        if(user && user.accessToken) {
            let groupRequestOPtions = getGroupsOptions(user.accessToken);
            console.log('varun', groupRequestOPtions);
            let request = http.request(groupRequestOPtions, (res) => {
                res.setEncoding('utf8');
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    let resJSON = JSON.parse(data);
                    
                    let groups = resJSON && resJSON.groups;
                    
                    groups = groups.map((item) => {
                        return item.name && item.name;
                    }).slice(1);
                    //console.log('here', groups.join(' AND '));
                    this.response.speak('These are the groups: ' + groups.join(' AND '));
                    this.emit(':responseReady');
                })
                
            });
            
            request.on('error', (e) =>{
                console.log(e);
                this.response.speak('Request failed but Token exists');
                this.emit(':responseReady');
            });
            
            request.end();
        }
        
        else {
            if(!user) {
                this.response.speak('USER ITSELF DOES NOT EXIST. DO YOU WISH TO CONTINUE?');
            }
            else {
                this.response.speak('TOKEN DOES NOT EXIST. DO YOU WISH TO CONTINUE?');
            }
            this.emit(':responseReady');
        }

        //this.response.speak('What do you want to do in splitwise?').listen('Can you repeat that?');
        
    },
    'AddExpenseIntent': function(){
        
        this.response.speak('Hey There!!');
        this.emit(':responseReady');
        //this.emit(':tell', 'added successfully');
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    console.log(event);
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};

