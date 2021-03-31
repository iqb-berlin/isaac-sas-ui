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
    return response.json();
  })
  .then(data => respObj = data)
  .catch((error) => {
      console.error('Error:', error);
      respStatus = 400;
  });
}


var respObj;
var respStatus;
var ids;

fetchStoredModels();


setInterval(function() {
    fetchStoredModels();
  }, 10000);


setInterval(function() {
  ids = respObj.modelIds.sort();
  let idOutput = "<span>";
  for (let i = 0; i < ids.length; i++) {
    idOutput += ids[i] + "<br>"
  }
  idOutput += "</span>";
    document.getElementById("ids").innerHTML = idOutput;
  }, 6000);


setInterval(function() {
  if (doesConnectionExist(respStatus)) {
    document.getElementById("connection")
    .innerHTML = "<span style = 'color: green;'>Connection established. Server is running.</span>";
  }
  else {
    document.getElementById("connection")
  .innerHTML = "<span style = 'color: red;'>The server does not seem to be running. No connection could be established.</span>";
  }
}, 5000);
