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

const firstAttachment = 0; // increment this by 100 at a time

function downloadAttachmentBatch(attachmentsArray) {
	for (let index = firstAttachment; index < firstAttachment + 100; index++) {
		const attachments = attachmentsArray[index].split(' ');
	
		for (let subindex = 0; subindex < attachments.length; subindex++) {
			const fileName = `${index + 1}_${subindex + 1}_${attachments[subindex].split('/').slice(-1)}` // get file name and extension (found after last slash in URL)
	
			downloadFile(attachments[subindex], `./processed_package/attachments/${fileName}`);
		
			console.log(`Downloaded attachment ${index + 1}/${attachmentsArray.length}: ${fileName}`);
		}
	}
}

downloadAttachmentBatch(privateAttachmentsArray);