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

function fetchStoredModels() {
  fetch("http://127.0.0.1:9999/fetchStoredModels", {
    method: 'POST',
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





// Todo: Output all IDs as a bulleted list.
// function prepare_output(resp_obj) {
//   for (i=0; i<resp_obj.modelIds.length; i++) {

//   }
// }

var respObj;
var respStatus;

fetchStoredModels();

setInterval(function() {
  fetchStoredModels();
}, 50000);


setInterval(function() {
  document.getElementById("ids").innerHTML = respObj.modelIds.toString().replace(/,/g, "  |  ");//respObj.modelIds.toString().replace(/,/g, "  |  ");
}, 5000);


setInterval(function() {
  if (doesConnectionExist(respStatus)) {
    document.getElementById("connection")
    .innerHTML = "Connection established. Server is running.";
  }
  else {
    document.getElementById("connection")
    .innerHTML = "The server does not seem to be running. No connection could be established.";
  }
}, 2000);
