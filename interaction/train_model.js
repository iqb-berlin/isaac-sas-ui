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
 * Instances are created on the basis of the TSV input.
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


function trainFromAnswers(modelId, uploadedInstances) {
  document.getElementById("trainingIsRunning").innerHTML = "Training is running... This can take some minutes.";
  if (modelId === "-" | modelId === "") {
    alert("No model ID has been chosen. Choose one!");
    throw "No model ID has been chosen.";
  }
    fetch(environment.serverUrl + "/trainFromAnswers", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
      method: 'POST',
      body: JSON.stringify({instances: uploadedInstances, modelId: modelId})
  })
    .then(response => {
      // Indicate that training is over.
      document.getElementById("trainingIsRunning").innerHTML = "Training complete.";

      return response.json();
    })
    .then(data => trainRespObj = data)
    .then(() => {
      writeTrainResults();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }


function writeTrainResults() {
  let metricClasses = ["macro avg", "micro avg", "True", "False"];
  let metricTypes = ["f1-score", "recall", "precision", "support"];

  let resultString = "<span>";
  // let metricsString = JSON.stringify(trainRespObj[modelId]["accuracy"]["metrics"], null, 4);
  let metrics = trainRespObj[modelId]["accuracy"]["metrics"];
  let accuracy = metrics["accuracy"];
  resultString += "<b>Accuracy:</b> " + accuracy.toString() + "<br><br>";

  for (let i = 0; i < metricClasses.length; i++) {
    let cls = metricClasses[i];
    let clsMetrics = metrics[cls];
    let clsAddition = cls.includes("avg") ? "" : " class"
    resultString += "<b>" + cls + clsAddition + ":</b> " + "<br>";
    for (let j = 0; j < metricTypes.length; j++) {
      type = metricTypes[j];
      resultString += type + ": " + clsMetrics[type].toString() + "<br>";

    }
    resultString += "<br>";
  }
  let kappa = metrics["cohens_kappa"];
  resultString += "<b>Cohens Kappa:</b> " + kappa.toString();

  resultString += "</span>"
  document.getElementById("trainResults").innerHTML = resultString;
}


const downloadToJSONFile = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

document.querySelector('#saveJSONResult').addEventListener('click', () => {  
  if (trainRespObj === undefined) {
    alert("No model training has been done yet. To obtain training results, train a model!");
    throw "No model training has been done yet.";
  }
  let metricsString = JSON.stringify(trainRespObj[modelId]["accuracy"]["metrics"], null, 4);
  downloadToJSONFile(metricsString, modelId + '-train-metrics.json', 'text/plain');
});


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
document.getElementById("trainButton").onclick = function() {createInstances(), trainFromAnswers(modelId, uploadedInstances)};

document.getElementById("trainResults").innerHTML = "No results yet.";