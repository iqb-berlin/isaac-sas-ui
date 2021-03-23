/**
 * Up here you get function definitions:
 * Actual interaction at the bottom of the file.
 */

function saveModelId() {
    modelId = document.getElementById('trainId').value;
    console.log("model ID is: " + modelId);
 }


function setCurrentId() {
    document.getElementById("currentId").innerHTML = modelId;
}


 function saveFileName() {
    fileName = document.getElementById('trainFile').value;
    console.log("You are using the file: " + fileName);
 }

 
function setCurrentFileName() {
    document.getElementById("currentFileName").innerHTML = fileName;
}


function readTrainFile(e) {
  var file = e.target.files[0];
  if (!file) {
    alert("Cannot read file!");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    csvContents = e.target.result;
  };
  reader.readAsText(file);
}


function processCsvData(csvAsText) {
  let allTextLines = csvAsText.split(/\r\n|\n/);

  for (let i = 0; i < allTextLines.length; i++) {
    let row = allTextLines[i].split(",");

    let col = [];

    for (let j = 0; j < row.length; j++) {
      col.push(row[j]);
    }

    csvLines.push(col);
  }
}

/**
 * Instances are created on the basis of the CSV input.
 */
function createInstances() {
  processCsvData(csvContents);
  console.log(csvLines);
}

// TODO: ShortAnswerInstance must be created.
// TODO: Input must be stored in ShortAnswerInstances and then passed to this function.
function trainFromAnswers(modelId, uploadedInstances) {
    fetch("http://127.0.0.1:9999/trainFromAnswers", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
      method: 'POST',
      body: JSON.stringify({instances: uploadedInstances, modelId: modelId})
  })
    .then(response => {
      respStatus = response.status;
      return response.json();
    })
    .then(data => respObj = data)
    .then(() => console.log(respObj))
    .catch((error) => {
        console.error('Error:', error);
    });
  }


/**
 * Here starts:
 * 1. Variable initialisation
 * 2. event handling
 */

// Initialize modelId variable for usage.
var modelId = "-";
var fileName = "-";
var csvContents = "";
var csvLines = [];
var uploadedInstances = null;
var respObj;
var respStatus;

setCurrentId();
setCurrentFileName();

// Store the modelId on click.
document.getElementById("trainIdButton").onclick = function() {saveModelId(), setCurrentId()};

// Store the file name on click.
document.getElementById('trainFile').addEventListener('change', readTrainFile, false);

// Store the file name on click.
document.getElementById("trainButton").onclick = function() {createInstances()};
// document.getElementById("trainButton").onclick = function() {createInstances(fileName), trainFromAnswers(uploadedInstances, modelId)};

