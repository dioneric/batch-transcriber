/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START speech_quickstart]
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');

var path = require('path');
var appDir = path.dirname(require.main.filename);

// Your Google Cloud Platform project ID
const projectId = 'soy-truth-214904';

const appConfig = {
  projectId: projectId,
  keyFilename: appDir + '/service_account.json' 
};

// Instantiates a client
const speechClient = new speech.SpeechClient(appConfig);
const gcsClient = new Storage(appConfig);

// Get the bucket 
var bucket = gcsClient.bucket('soy-truth-214904');

process.argv.forEach(function (val, index, array) {
	if(index > 2){

		// The name of the audio file to transcribe
		console.log("Transcribing " + process.argv[index]);
		
		var fileName = process.argv[index];
		
		// Upload a local file to a new file to be created in your bucket. 
		bucket.upload(fileName, function(err, file) {
		  if (!err) {
			  
				var uriFile = "gs://soy-truth-214904/" + file.name;
				
				var request = {
				  audio: {
					uri: uriFile
				  },
				  config: {
					  encoding: 'LINEAR16',
					  sampleRateHertz: 16000,
					  languageCode: process.argv[2]
					}
				};

				// Detects speech in the audio file. This creates a recognition job that you
				// can wait for now, or get its result later.
				speechClient.longRunningRecognize(request)
				  .then((results) => {
					const operation = results[0];
					// Get a Promise representation of the final result of the job
					return operation.promise();
				  })
				  .then((results) => {
					  
					var transcription = "";
					
					results[0].results.forEach(function (val, index, array) {
						
						transcription += results[0].results[index].alternatives[0].transcript;
						
					});
					
					var transFile = fileName + ".txt";
					
					fs.writeFile(transFile, transcription, function(err) {
						if(err) {
							return console.log(err);
						}

						console.log(transFile);
					}); 
					
					
				  })
				  .catch((err) => {
					console.error('ERROR:', err);
				  });
				// [END speech_quickstart]
				
			  
				
		  } else {
			  console.log(err);
		  }
		});
		
	}
});
