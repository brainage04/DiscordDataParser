const fs = require('fs-extra');
const path = require('path');

fs.ensureDirSync('./processed_package/private_messages/attachments');
fs.ensureDirSync('./processed_package/private_messages/messages');

fs.ensureDirSync('./processed_package/public_messages/attachments');
fs.ensureDirSync('./processed_package/public_messages/messages');

const messageIndex = require('./package/messages/index.json');

let messageIndexCounter = 0;
let messageIndexCounterLimit = 1000;

let privateMessagesContainer = {};
let privateDeletedUsersContainer = {};
let privateAttachmentsArray = [];

let publicMessagesContainer = {};
let publicAttachmentsArray = [];

const replaceList = [
	['<', '&lt;'],
	['>', '&gt;'],
	['?', '(question mark)']
];

function parseDiscordPackage() {
	for (index in messageIndex) {
		if (messageIndex[index] === null) {
			continue;
		} else if (messageIndex[index].length < 20) {
			continue;
		} else if (messageIndexCounter > messageIndexCounterLimit) {
			continue;
		}
		
		let discordMessages = fs.readFileSync(`./package/messages/c${index}/messages.csv`, { encoding: 'utf8', flag: 'r' });
		discordMessages = discordMessages.split('\n').slice(1,-1); // remove 'ID,Timestamp,Contents,Attachments\r\n'

		if (messageIndex[index].slice(0, 20) === 'Direct Message with ') { // parse private message channel contents
			for (subindex in discordMessages) {
				privateMessageArguments = discordMessages[subindex].split(',');
				discordMessages[subindex] = {}; // convert array to object so variables can be assigned with names
				discordMessages[subindex].id = privateMessageArguments[0];
				discordMessages[subindex].timestamp = privateMessageArguments[1];
				discordMessages[subindex].contents = privateMessageArguments[2];
				discordMessages[subindex].attachments = privateMessageArguments[3];
				if (privateMessageArguments[3] && privateMessageArguments[3].slice(0, 39) === "https://cdn.discordapp.com/attachments/") {
					privateAttachmentsArray.push(privateMessageArguments[3]);
				}
			}
	
			let privateMessageObjectTag = messageIndex[index].slice(20); // get tag of discord user
			for (index in replaceList) {
				privateMessageObjectTag = privateMessageObjectTag.replace(replaceList[index][0], replaceList[index][1]); // tag validation for file names
			}
	
			let privateMessageObject = { // put messages array in object
				"messages": discordMessages
			};
	
			privateMessagesContainer[privateMessageObjectTag] = privateMessageObject; // put objects in array container
	
			if (privateMessageObjectTag.slice(0,13) === 'Deleted User ') { // filter deleted users
				privateDeletedUsersContainer[privateMessageObjectTag] = privateMessageObject; // put objects in array container
			}
	
			fs.writeFileSync(`./processed_package/private_messages/messages/${privateMessageObjectTag}.json`, JSON.stringify(privateMessageObject, null, '\t'));
		} else { // parse public message channel contents
			for (subindex in discordMessages) {
				publicMessageArguments = discordMessages[subindex].split(',');
				discordMessages[subindex] = {}; // convert array to object so variables can be assigned with names
				discordMessages[subindex].id = publicMessageArguments[0];
				discordMessages[subindex].timestamp = publicMessageArguments[1];
				discordMessages[subindex].contents = publicMessageArguments[2];
				discordMessages[subindex].attachments = publicMessageArguments[3];
				if (publicMessageArguments[3] && publicMessageArguments[3].slice(0, 39) === "https://cdn.discordapp.com/attachments/") {
					publicAttachmentsArray.push(publicMessageArguments[3]);
				}
			}
	
			let publicMessageObjectTag = messageIndex[index]; // get name of discord channel
			for (index in replaceList) {
				publicMessageObjectTag = publicMessageObjectTag.replace(replaceList[index][0], replaceList[index][1]); // tag validation for file names
			}
	
			let publicMessageObject = {
				"messages": discordMessages
			};
	
			publicMessagesContainer[publicMessageObjectTag] = publicMessageObject;
	
			fs.writeFileSync(`./processed_package/public_messages/messages/${publicMessageObjectTag}.json`, JSON.stringify(publicMessageObject, null, '\t'));
		}
	
		messageIndexCounter++;
	}

	fs.writeFileSync('./processed_package/private_messages/_attachments.json', JSON.stringify(privateAttachmentsArray, null, '\t'));
	fs.writeFileSync('./processed_package/private_messages/_messages.json', JSON.stringify(privateMessagesContainer, null, '\t'));
	fs.writeFileSync('./processed_package/private_messages/_deleted_messages.json', JSON.stringify(privateDeletedUsersContainer, null, '\t'));

	fs.writeFileSync('./processed_package/public_messages/_attachments.json', JSON.stringify(publicAttachmentsArray, null, '\t'));
	fs.writeFileSync('./processed_package/public_messages/_messages.json', JSON.stringify(publicMessagesContainer, null, '\t'));
}

parseDiscordPackage();