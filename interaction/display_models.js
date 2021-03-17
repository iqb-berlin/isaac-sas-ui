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

// Fetch stored models once when the script is started.
// TODO: Once the button is turned into a permanent list, call
//       the function every time a new model is added.
var respObj;
var respStatus;
fetchStoredModels();

const e = React.createElement;

class ModelIdButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
  }

  render() {
    if (this.state.clicked) {
      if ( ! doesConnectionExist(respStatus) ) {
        return "The server does not seem to be running. No connection could be established."
      }

    // Try to present the model IDs each on a separate line.
    return respObj.modelIds.toString().replace(/,/g, "  |  ");
    }

    return e(
      'button',
      { onClick: () => this.setState({ clicked: true }) },
      'Press to get all available model IDs.'
    );
  }
}


const domContainer = document.querySelector('#model_id_button_container');
ReactDOM.render(e(ModelIdButton), domContainer);