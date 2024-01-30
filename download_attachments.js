const fs = require('fs-extra');
const Axios = require('axios');

async function downloadFile(url, filepath) {
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}

const privateAttachmentsArray = require('./processed_package/private_messages/_attachments.json');
const publicAttachmentsArray = require('./processed_package/public_messages/_attachments.json');

let firstAttachment = 0; // increment this by attachmentIncrement at a time
const lastAttachment = 100; // stop incrementing firstAttachment when it reaches this number
const attachmentIncrement = 20; // number of attachments to download per batch

async function downloadAttachmentBatch(attachmentsArray, attachmentsFolder) {
	for (let index = firstAttachment; index < firstAttachment + attachmentIncrement; index++) {
		if (index + 1 > attachmentsArray.length) { // prevents hard error caused by downloading attachments that don't exist (because they are out of index)
			continue;
		}
		
		const attachments = attachmentsArray[index].split(' ');
	
		for (let subindex = 0; subindex < attachments.length; subindex++) {
			const fileName = `${index + 1}_${subindex + 1}_${attachments[subindex].split('/').slice(-1)}` // get file name and extension (found after last slash in URL)
	
			downloadFile(attachments[subindex], `./processed_package/${attachmentsFolder}_messages/attachments/${fileName}`);
		
			console.log(`Downloaded attachment ${index + 1}/${attachmentsArray.length}: ${fileName}`);
		}
	}

	console.log('Downloads complete.');
}

async function downloadAllAttachments() {
	for (let batchIndex = firstAttachment; batchIndex < lastAttachment; batchIndex += attachmentIncrement) {
		await downloadAttachmentBatch(privateAttachmentsArray, "private");
		firstAttachment += attachmentIncrement;
	}
}

downloadAllAttachments();