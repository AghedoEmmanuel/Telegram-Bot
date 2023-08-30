require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const { TOKEN, SERVER_URL } = process.env
const { Telegraf } = require('telegraf')
const bot = new Telegraf(TOKEN)
const decision_tree = require('decision-tree')

// const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
// const URI = `/webhook/${TOKEN}`
// const WEBHOOK_URL = SERVER_URL+URI

// bot.use((ctx) => {
//     ctx.reply("Hi Human!!!")
// })

const diseases = [
    { name: 'malaria', symptoms: ['darkening of skin', 'difficulty in swallowing', 'dizziness', 'fever', 'headache', 'vomiting'] },
    { name: 'diarrhea', symptoms: ['abdominal swelling', 'fatigue', 'vomiting', 'food cravings', 'itching', 'pain in breast area', 'red eye', 'stomach pain', 'swollen breast', 'weakness'] },
    { name: 'typhoid fever', symptoms: ['constipation', 'cough', 'headache'] },
    { name: 'ulcer', symptoms: ['food cravings', 'loss of appetite', 'stomach pain', 'unexplained weight loss', 'vomiting'] },
    { name: 'hyperthermia', symptoms: ['abdominal swelling', 'darkening of skin', 'headache', 'sweating', 'weakness'] },
    { name: 'high blood pressure', symptoms: ['blurred vision', 'headache', 'nose bleed', 'shortness of breadth', 'sweating'] },
    { name: 'dysentry', symptoms: ['excessive thirst', 'excessive urination', 'fatigue', 'weakness'] },
    { name: 'cholera', symptoms: ['dehydration', 'diarrhea', 'fever', 'headache', 'nausea', 'painful urination', 'rash', 'rash discharge from breast', 'vomiting'] },
    { name: 'hemochromatosis', symptoms: ['fainting', 'darkening of skin', 'fracture', 'nose bleed', 'pain in breast area'] },
    { name: 'anemia', symptoms: ['difficulty in swallowing', 'dizziness', 'fatigue', 'headache'] },
    { name: 'appendicitis', symptoms: ['abdominal swelling', 'back pain', 'constipation', 'diarrhea', 'inability to pass gas', 'loss of appetite', 'nausea', 'painful urination', 'vomiting'] },
    { name: 'celiac sprue', symptoms: ['cough', 'diarrhea', 'nose bleed', 'sweating', 'swollen breast'] },
    { name: 'kidney disease', symptoms: ['bone pain', 'easy bruising', 'excessive urination', 'fatigue', 'fracture', 'headache', 'insomnia', 'itching', 'loss of appetite', 'loss of sexual desire', 'vomiting'] },
    { name: 'ovarian cancer', symptoms: ['confusion', 'excessive thirst', 'fatigue', 'unexplained weight loss', 'weakness'] },
]

const symptomList = Array.from(new Set(diseases.flatMap(entry=>entry.symptoms)))

const disease = diseases.map (entry =>({entry, 
symptoms: symptomList.map(symptom =>entry.symptoms.includes(symptom)? 1:0)
}))

const decisionTree = new decision_tree(disease,"name",symptomList )

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to DP! Please enter your symptoms separated by commas.");
  });
  
  bot.onText(/^(?!\/start)(.*)$/, (msg, match) => {
    const inputSymptoms = match[1].split(",").map(symptom => symptom.trim().toLowerCase());
  
    if (inputSymptoms.length === 0) {
      bot.sendMessage(msg.chat.id, "Please provide valid symptoms.");
      return;
    }
  
    const inputVector = symptomList.map(symptom => inputSymptoms.includes(symptom) ? 1 : 0);
    const predictedDisease = decisionTree.predict(inputVector);
  
    bot.sendMessage(msg.chat.id, `Based on your symptoms, the predicted disease is: ${predictedDisease}`);
  });

// bot.start((ctx) => {
//     ctx.reply("Welcome to HDDP!! what sickness would you like to check for?")

//     ctx.replyWithMarkdownV2(`*${diseases.map(d=>d.name).join('*\n*')}*`, 
//     // Telegraf.Extra.markup((markup)=>{
//     //     return markup.resize(true).keyboard(diseases.map(d => d.name));
//     // }))
// )})

// // bot.use((ctx)=>{
// //     console.log(ctx.message)
// // })

// bot.hears(diseases.map(d => d.name), async(ctx) => {
//     const diseaseName = ctx.message.text;
//     const disease = diseases.find(d => d.name === diseaseName);
//     ctx.session.disease = disease;
//     ctx.reply(`Please enter the symptoms for ${diseaseName} seperated by commas.`)
// })

// bot.on('text', async (ctx) => {
//     const symptoms = ctx.message.text.split(',').map((s) => s.trim())
//     const disease = ctx.session.disease;
//     const matchingSymptoms = symptoms.filter(s => disease.symptoms.include(s))
//     if (matchingSymptoms.length > 0) {
//         const message = `The following symptoms match ${disease.name}:\n\n${matchingSymptoms.join('\n')}`
//         ctx.reply(message)
//     } else {
//         ctx.reply(`Sorry, none of the symptoms you have provided match ${disease.name}.`)
//     }
// })

bot.launch()
