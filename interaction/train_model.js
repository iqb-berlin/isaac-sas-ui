function doesConnectionExist(status) {
    try {
        if (status >= 200 && status < 304) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
  }
  
function saveModelId() {
    modelId = document.getElementById('trainId').value;
    alert("The current model ID is: " + modelId);
    console.log("model ID is: " + modelId);
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
var modelId = null;

// Store the modelId on click.
document.getElementById("trainIdButton").onclick = function() {saveModelId()};

var respObj;
var respStatus;
trainFromAnswers();
