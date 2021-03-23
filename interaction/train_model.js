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
      response.json();
    })
    .then(data => respObj = data)
    .then(() => console.log(respObj))
    .catch((error) => {
        console.error('Error:', error);
    });
  }


// Initialize modelId variable for usage.
var modelId = "-";
var fileName = "-";

setCurrentId();
setCurrentFileName();

// Store the modelId on click.
document.getElementById("trainIdButton").onclick = function() {saveModelId(), setCurrentId()};

// Store the file name on click.
document.getElementById("trainFileButton").onclick = function() {saveFileName(), setCurrentFileName()};

// TODO: Extract the information and create ShortAnswerInstances.
//       Add the instances variable to the trainFromAnswers function below.

var respObj;
var respStatus;
// Store the file name on click.
document.getElementById("trainButton").onclick = function() {trainFromAnswers(modelId)};

