/**
 * Up here you get function and object definitions:
 * Actual interaction at the bottom of the file.
 */


function saveModelId() {
    modelId = document.getElementById('trainId').value;
    console.log("model ID is: " + modelId);
 }


function setCurrentId() {
    document.getElementById("currentId").innerHTML = modelId;
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
    tsvContents = e.target.result;
  };
  reader.readAsText(file);
}


function processTsvData(tsvAsText) {
  var tsvLines = [];
  let allTextLines = tsvAsText.split(/\r\n|\n/);

  for (let i = 0; i < allTextLines.length; i++) {
    let row = allTextLines[i].split("\t");

    let col = [];

    for (let j = 0; j < row.length; j++) {
      col.push(row[j]);
    }
    if (col.length > 1) {
      tsvLines.push(col);
    }
    
  }
  return tsvLines;
}

/**
 * Instances are created on the basis of the CSV input.
 */
function createSingleInstance(newTaskId, newItemId, newItemPrompt, newItemTargets, newLearnerId, newAnswer, newLabel) {
  return {
    taskId: newTaskId,
    itemId: newItemId,
    itemPrompt: newItemPrompt,
    itemTargets: newItemTargets,
    learnerId: newLearnerId,
    answer: newAnswer,
    label: newLabel,
  };
}


function createInstances() {
  tsvLines = processTsvData(tsvContents);
  // The header line is excluded, so tsvLines starts at 1, not 0.
  tsvLines = tsvLines.slice(1, tsvLines.length);

  instances = [];
  for (let i = 0; i < tsvLines.length; i++) {
    line = tsvLines[i];

    // The itemTargets list needs a bit of preprocessing.
    let itemTargets = line[13];
    // \u2022 represents the • symbol.
    itemTargets = itemTargets.split("\u2022");
    for (let i = 0; i < itemTargets.length; i++) {
      itemTargets[i] = itemTargets[i].replace(/\s+/g, '');
    }

    let newInstance = createSingleInstance(
      line[8],
      line[9],
      line[11],
      itemTargets,
      line[2],
      line[5],
      (parseFloat(line[6]) >= 0) ? line[6] : "0.0"
      );

    instances.push(newInstance);
  }
  uploadedInstances = instances;
}

// TODO: ShortAnswerInstance must be created.
// TODO: Input must be stored in ShortAnswerInstances and then passed to this function.
function trainFromAnswers(modelId, uploadedInstances) {
  if (modelId === "-") {
    alert("No model ID has been chosen. Choose one!");
    throw "No model ID has been chosen.";
  }
    fetch("http://127.0.0.1:9999/trainFromAnswers", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
      method: 'POST',
      body: JSON.stringify({instances: uploadedInstances, modelId: modelId})
  })
    .then(response => {
      return response.json();
    })
    .then(data => trainRespObj = data)
    .then(() => console.log(trainRespObj))
    .catch((error) => {
        console.error('Error:', error);
    });
  }

// TODO: This function must be fixed and writing to file must be implemented.
// It seems like only node js can write directly to json. Workaround?
function writeTrainResults() {
  let trainRespObjString = "Best Model:\n\n"

  let accuracy = trainRespObj.accuracy.value;
  trainRespObjString += "Accuracy: " + accuracy.toString();

  document.getElementById("trainResults").innerHTML = trainRespObjString;
}


/**
 * Here starts:
 * 1. Variable initialisation
 * 2. event handling
 */

// Initialize modelId variable for usage.
var modelId = "-";
var tsvContents = "";
var uploadedInstances = null;
var trainRespObj;

setCurrentId();

// Store the modelId on click.
document.getElementById("trainIdButton").onclick = function() {saveModelId(), setCurrentId()};

// Store the file name and .
document.getElementById('trainFile').addEventListener('change', readTrainFile, false);

// Store the file name on click.
document.getElementById("trainButton").onclick = function() {createInstances(), trainFromAnswers(modelId, uploadedInstances), writeTrainResults()};
