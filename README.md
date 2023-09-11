# Web APP

## Content
### Dataset
This folder contains all the ASL 1 data, both the raw data and the preprocessed data.

### EncodingASP
This folder contains all the encodings to perform the optimization.
Both the input and the optimization is performed when the app is running: the first time you select a place (Bordighera, Sanremo, Imperia) the AI engine executes the encoding and computes the result in real time. After the first execution, the results are stored in memory (cached). Thank to this procedure, when you select again a place you have previously selected, the app is able to save time due to the fact that the data will be uploaded from the previous execution.

### Visualization
This folder contains the webapp itself.
  - Backend: node.js
  - Frontend: html, css and d3.js (for the charts).


## Run the app
To run the app you must execute the following steps:
1. Open the "visualization" folder.
2. Run the command ***npm install*** to install all the node modules required.
3. Run the command ***node webApp.js*** to start the app. It will listen at the port 3000.
4. After the app is running, open any browser you want and go to ***localhost:3000/home.html*** address.