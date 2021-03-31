function setCurrentPredictId() {
  predictModelId = document.getElementById("predictId").value;
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
      instanceIds.push(line[2]);
      // If there are labels in the file, they are added here as well.
      predictLabels.push(line[6]);

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
        addInstanceIds();
        writePredictResults();
      })
      .catch((error) => {
          console.error('Error:', error);
      });
    }


function writePredictResults() {

  let resultString = "<span>";
  let instancePredictions = predictRespObj["predictions"];

  let num_instances = instancePredictions.length
  let classLabels = instancePredictions[0]["classProbabilities"];
  let classNames = [];
  let classes = {};
  let confusion_matrices = {};
  let total_correct = 0;

  for (cls in classLabels) {
    classes[cls] = 0;
    classNames.push(cls);
    confusion_matrices[cls] = {"tp": 0, "fp":0, "fn": 0, "tn": 0};
  }

  for (let i = 0; i < num_instances; i++) {
    let prediction = instancePredictions[i]["prediction"];

    classes[prediction] += 1;

    // This also works if there are labels.
    let actual = predictLabels[i];

    /**
     * If the model predicts a class that is not present in the possible predictable
     * labels, an error is thrown.
     */
    try {
      if (actual == prediction) {
        confusion_matrices[prediction]["tp"] += 1;
        confusion_matrices[actual]["tn"] += 1;
        total_correct += 1;
      } else {
        confusion_matrices[prediction]["fp"] += 1;
        confusion_matrices[actual]["fn"] += 1;
      }
    } catch (error) {
      alert("It seems that your predict instances are not compatible with the input model. Please Check!")
      console.error(error);
      return;
    }
  }
  resultString += "<b>There are " + num_instances + " instances in total.</b><br><br>";

  for (cls in classes) {
    resultString += "Class '" + cls + "' was predicted " + classes[cls] + " time(s).<br>";
  }
  resultString += "<br>";

  // Set up some advanced metrics if labels exist.
  

  // Set up overall metrics.
  let macro_precision = 0;
  let macro_recall = 0;
  let macro_f1 = 0;

  // Set up metrics by class.
  for (cls in confusion_matrices) {
    let accuracy = (confusion_matrices[cls]["tp"] / classes[cls]);

    let actual_pos = confusion_matrices[cls]["tp"] + confusion_matrices[cls]["fn"];
    let predicted_pos = confusion_matrices[cls]["tp"] + confusion_matrices[cls]["fp"];
    let true_pos = confusion_matrices[cls]["tp"];

    let precision = (true_pos / predicted_pos);
    let recall = (true_pos / actual_pos);
    let f1 = 2 * ((precision * recall) / (precision + recall));

    macro_precision += precision;
    macro_recall += recall;
    macro_f1 += f1;

    resultString += "<b>Class " + cls + "</b><br>";
    resultString += "Class '" + cls + "' was predicted correctly " + true_pos + " time(s)<br>";
    resultString += "Accuracy: " + accuracy.toFixed(2) + "%.<br>";
    resultString += "F1 Score: " + f1.toFixed(2) + "%.<br>";
    resultString += "Recall: " + recall.toFixed(2) + "%.<br>";
    resultString += "Precision: " + precision.toFixed(2) + "%.<br>";
    resultString += "<br>";
  }
  resultString += "<br>";

  accuracy = total_correct / num_instances;
  num_classes = classNames.length;
  macro_f1 = macro_f1 / num_classes;
  macro_precision = macro_precision / num_classes;
  macro_recall = macro_recall / num_classes;

  resultString += "<b>Overall: </b><br><br>"
  resultString += "Accuracy: " + accuracy.toFixed(2) + "%.<br>";
  resultString += "F1 Score: " + macro_f1.toFixed(2) + "%.<br>";
  resultString += "Recall: " + macro_recall.toFixed(2) + "%.<br>";
  resultString += "Precision: " + macro_precision.toFixed(2) + "%.<br>";
  resultString += "<br><br>";

  resultString += "If a value is 'NaN', that is because none of the instances was classified as this class.";
  resultString += "</span>"
  document.getElementById("predictResults").innerHTML = resultString;
}


function addInstanceIds() {
  for (let i = 0; i < predictRespObj["predictions"].length; i++) {
    predictRespObj["predictions"][i]["instanceId"] = instanceIds[i];
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



var predictModelId;
var tsvContents = "";
var uploadedPredictInstances = null;
var uploadedInstanceIds = null;
var predictRespObj;
var previousIds = [];
// If there are already labels for the data, 
// they are stored here (not the typical prediction case).
var predictLabels = [];

setCurrentPredictId();

document.getElementById('currentPredictId').addEventListener('change', setCurrentPredictId, false);

document.getElementById('predictFile').addEventListener('change', readPredictFile, false);

document.getElementById("predictButton").onclick = function() {createPredictInstances(), predictFromAnswers(predictModelId, uploadedPredictInstances)};

document.getElementById("predictResults").innerHTML = "No results yet.";

// Constantly update the predict ID for models.
setInterval(function() {

  if (ids !== undefined) {
    var select = document.getElementById("predictId"); 

    for(var i = 0; i < ids.length; i++) {
      var opt = ids[i];
      if (!previousIds.includes(opt)) {
        select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        previousIds.push(opt);
      }
    
    }
  }
  
  }, 6000);
