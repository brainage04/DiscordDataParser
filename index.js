const fs = require('fs-extra');
const Papa = require('papaparse');

fs.ensureDirSync('./processed_package/private_messages/attachments');
fs.ensureDirSync('./processed_package/private_messages/messages');

fs.ensureDirSync('./processed_package/public_messages/attachments');
fs.ensureDirSync('./processed_package/public_messages/messages');

const messageIndex = require('./package/messages/index.json');

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
			messageIndex[index] = index;
		}

		let discordMessages = fs.readFileSync(`./package/messages/c${index}/messages.csv`, { encoding: 'utf8', flag: 'r' });
		discordMessages = discordMessages.split('\n').slice(1,-1).join('\n'); // remove 'ID,Timestamp,Contents,Attachments\r\n'
		discordMessages = Papa.parse(discordMessages, {
			dynamicTyping: true,
			encoding: 'utf-8'
		});
		discordMessages = discordMessages.data;

		if (messageIndex[index].includes('Direct Message with ')) { // parse private message channel contents
			for (subindex in discordMessages) {
				if (discordMessages[subindex][3] !== null) { // if message contains attachments
					privateAttachmentsArray.push(discordMessages[subindex][3]);
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
	
			if (privateMessageObjectTag.includes('Deleted User ')) { // filter deleted users
				privateDeletedUsersContainer[privateMessageObjectTag] = privateMessageObject; // put objects in array container
			}
	
			fs.writeFileSync(`./processed_package/private_messages/messages/${privateMessageObjectTag}.json`, JSON.stringify(privateMessageObject, null, '\t'));
		} else { // parse public message channel contents
			for (subindex in discordMessages) {
				if (discordMessages[subindex][3] !== null) { // if message contains attachments
					publicAttachmentsArray.push(discordMessages[subindex][3]);
				}
			}
	
			let publicMessageObjectTag = messageIndex[index]; // get name of discord channel
			for (index in replaceList) {
				publicMessageObjectTag = publicMessageObjectTag.replace(replaceList[index][0], replaceList[index][1]); // name validation for file names
			}
	
			let publicMessageObject = {
				"messages": discordMessages
			};
	
			publicMessagesContainer[publicMessageObjectTag] = publicMessageObject;
	
			fs.writeFileSync(`./processed_package/public_messages/messages/${publicMessageObjectTag}.json`, JSON.stringify(publicMessageObject, null, '\t'));
		}
	}

	fs.writeFileSync('./processed_package/private_messages/_attachments.json', JSON.stringify(privateAttachmentsArray, null, '\t'));
	fs.writeFileSync('./processed_package/private_messages/_messages.json', JSON.stringify(privateMessagesContainer, null, '\t'));
	fs.writeFileSync('./processed_package/private_messages/_deleted_messages.json', JSON.stringify(privateDeletedUsersContainer, null, '\t'));

	fs.writeFileSync('./processed_package/public_messages/_attachments.json', JSON.stringify(publicAttachmentsArray, null, '\t'));
	fs.writeFileSync('./processed_package/public_messages/_messages.json', JSON.stringify(publicMessagesContainer, null, '\t'));
}

parseDiscordPackage();