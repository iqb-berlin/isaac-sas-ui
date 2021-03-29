function savePredictModelId() {
    predictModelId = document.getElementById('predictId').value;
    console.log("Predict model ID is: " + predictModelId);
 }


function setCurrentPredictId() {
    document.getElementById("currentPredictId").innerHTML = predictModelId;
}


function readPredictFile(e) {
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
   * Note that there is no label input here because these will be predicted.
   */
  function createSinglePredictInstance(newTaskId, newItemId, newItemPrompt, newItemTargets, newLearnerId, newAnswer) {
    return {
      taskId: newTaskId,
      itemId: newItemId,
      itemPrompt: newItemPrompt,
      itemTargets: newItemTargets,
      learnerId: newLearnerId,
      answer: newAnswer
    };
  }
  
  
  function createPredictInstances() {
    tsvLines = processTsvData(tsvContents);
    // The header line is excluded, so tsvLines starts at 1, not 0.
    tsvLines = tsvLines.slice(1, tsvLines.length);
  
    instances = [];
    instanceIds = [];
    for (let i = 0; i < tsvLines.length; i++) {
      line = tsvLines[i];
  
      // The itemTargets list needs a bit of preprocessing.
      let itemTargets = line[13];
      // \u2022 represents the • symbol.
      itemTargets = itemTargets.split("\u2022");
      for (let i = 0; i < itemTargets.length; i++) {
        itemTargets[i] = itemTargets[i].replace(/\s+/g, '');
      }
  
      let newInstance = createSinglePredictInstance(
        line[8],
        line[9],
        line[11],
        itemTargets,
        line[2],
        line[5]
        );
  
      instances.push(newInstance);
      instanceIds.push(line[9])

    }
    uploadedPredictInstances = instances;
    uploadedInstanceIds = instanceIds;
  }

  function predictFromAnswers(predictModelId, uploadedPredictInstances) {
    document.getElementById("predictionIsRunning").innerHTML = "Predictions are running...";
    if (predictModelId === "-" | predictModelId === "") {
      alert("No model ID has been chosen. Choose one!");
      throw "No model ID has been chosen.";
    }
      fetch("http://127.0.0.1:9999/predictFromAnswers", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
        method: 'POST',
        body: JSON.stringify({instances: uploadedPredictInstances, modelId: predictModelId})
    })
      .then(response => {
        // Indicate that prediction is over.
        document.getElementById("predictionIsRunning").innerHTML = "Predictions complete.";
  
        return response.json();
      })
      .then(data => predictRespObj = data)
      .then(() => {
        writePredictResults();
        addInstanceIds();
        console.log(predictRespObj);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
    }


function writePredictResults() {

  let resultString = "<span>";
  let instancePredictions = predictRespObj["predictions"];

  for (let i = 0; i < instancePredictions.length; i++) {
    let prediction = instancePredictions[i]["prediction"];
    let classProbabilities = instancePredictions[i]["classProbabilities"];

    resultString += "<b>Instance " + ": </b> " + i.toString() + "<br>";
    resultString += "<b>Predicted Class:</b> " + prediction + "<br>";
    resultString += "<b>Class Probabilities:</b><br>";

    for (cls in classProbabilities) {
      resultString += "<b>" + cls + ": </b> " + classProbabilities[cls] + "<br>";

    }
    resultString += "<br>";
  }

  resultString += "</span>"
  document.getElementById("predictResults").innerHTML = resultString;
}


function addInstanceIds() {
  for (let i = 0; i < predictRespObj["predictions"].length; i++) {
    predictRespObj["predictions"][i]["itemID"] = instanceIds[i];
  }
}


const downloadPredictionsToJSONFile = (cont, fname, contType) => {
    const p = document.createElement('a');
    const predictResultsFile = new Blob([cont], {type: contType});
    
    p.href= URL.createObjectURL(predictResultsFile);
    p.download = fname;
    p.click();
    
    URL.revokeObjectURL(p.href);
    };
    
document.querySelector('#saveJSONPredictResult').addEventListener('click', () => {  
  if (predictRespObj === undefined) {
      alert("No Prediction has been done yet. To obtain predict results, enter a file with instances!");
      throw "No prediction has been done yet.";
  }
  let outputString = JSON.stringify(predictRespObj, null, 4);
  downloadPredictionsToJSONFile(outputString, predictModelId + '-predictions.json', 'text/plain');
});



var predictModelId = "-";
var tsvContents = "";
var uploadedPredictInstances = null;
var uploadedInstanceIds = null;
var predictRespObj;

setCurrentPredictId();

// Store the modelId on click.
document.getElementById("predictIdButton").onclick = function() {savePredictModelId(), setCurrentPredictId()};

document.getElementById('predictFile').addEventListener('change', readPredictFile, false);

document.getElementById("predictButton").onclick = function() {createPredictInstances(), predictFromAnswers(predictModelId, uploadedPredictInstances)};

document.getElementById("predictResults").innerHTML = "No results yet.";