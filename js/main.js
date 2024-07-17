//Configurar SW
let swLocation = "sw.js";

//Configurar SW
if (navigator.serviceWorker) {
  if (window.location.href.includes("pwa-aforimetro.vercel.app")) swLocation = "/sw.js"; //Varia según el host
  navigator.serviceWorker.register(swLocation);
}


const serverAddress = 'http://192.168.4.1'; // Dirección IP del Arduino
let labels = [];
let data = [];
let labelsCSV = [];
let dataCSV = [];
let timePerSample = 10000; //10 segundos esto esta en milisegundos
let caudalTotal = 0; // en Litros
let tiempoTotal = 0; // en segundos
let campoNombre = "";
let fecha = "";


document.addEventListener("DOMContentLoaded", function() {if (campoNombre == ""){
  campoNombre = prompt("Por favor ingrese el nombre del Campo");
}; });


//get tipos de aforimetros
var tipos = document.getElementById("tipos");
function onChangeTipos() {
  var value = tipos.value;
  var text = tipos.options[tipos.selectedIndex].text;
  // console.log(value, text);
}
tipos.onchange = onChangeTipos;
onChangeTipos();

//get medidas del aforimetro
var medidas = document.getElementById("medidas");
function onChangeMedidas() {
  var value = medidas.value;
  var text = medidas.options[medidas.selectedIndex].text;
  // console.log(value, text);
}
medidas.onchange = onChangeMedidas;
onChangeMedidas();


const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [{
      label: 'Caudal_Instantaneo',
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  },
  options: {
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Caudal [L/s]'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Tiempo'
        }
      }]
    }
  }
});


function updateCaudal(distance) {
  var caudal = 0;
  // pedir el dato
  // fetch(URL + '/distance')
  // .then(response => response.json())
  // .then(data => {
  //formula 
  // if (tipos.value == "") {
  //   alert("Introducir el TIPO de Aforador");
  // }
  // else {
  //   if (medidas.value == "") {
  //     alert("Introducir la MEDIDA del Aforador");
  //   }
  //   else {
      if (medidas.value == "6,2") {
        caudal = 0.0163 * distance ** 2.4176;
      };
      if (medidas.value == "12,4") {
        caudal = 0.0074 * distance ** 2.7173;
      };
      if (medidas.value == "16,8") {
        caudal = 0.0065 * distance ** 2.7582;
      };
      if (medidas.value == "32,12") {
        caudal = 0.0076 * distance ** 2.6734;
      };

  //   };
  // };
  //update en la pagina
  // document.querySelector('#datetime').textContent = caudal;
  // });

  return caudal;
}

function caudalErogado(caudalTotal){
  document.getElementById("caudalErogado").innerHTML = "Caudal Total:" + Math.round(caudalTotal* 100) / 100 + "[L]";
};

function tiempoTranscurrido(timePerSample){
  tiempoTotal = timePerSample/1000 + tiempoTotal;
  document.getElementById("tiempoTotal").innerHTML = "Tiempo Total:" + tiempoTotal + "[Seg]";
};



let elementArray = 0;
let caudal;

function updateChart(distance) {
  let caudal = 0;

  if (campoNombre == "" || campoNombre == null){
    campoNombre = prompt("Por favor ingrese el nombre del Campo");
  }

  if (tipos.value == "" && medidas.value == ""){
    alert("Introducir el TIPO de Aforador y la MEDIDA");
  }
  else{  
    labels.push(updateDateTime());
    labelsCSV.push(updateDateTime());
    caudal = updateCaudal(distance);
    data.push(caudal);
    dataCSV.push(caudal);
    caudalTotal = caudal * (timePerSample/1000) + caudalTotal;
    caudalErogado(caudalTotal);
    tiempoTranscurrido(timePerSample);

    if (elementArray > 10) {
      labels.shift();
      data.shift();
    }

    elementArray = elementArray + 1;

    myChart.update();
  }
}

function fetchDistanceAndUpdateChart() {

  fetch(serverAddress + '/distance') // api for the get request
    .then(response => response.json())
    .then(data => { updateChart(data); });
}

let intervalId;

function startMeasurement() {
  intervalId = setInterval(fetchDistanceAndUpdateChart, timePerSample);
}

function stopMeasurement() {
  clearInterval(intervalId);
}

// Function to create a CSV string from an object
const csvmaker = (dataCSV, labelsCSV) => {

  // Get the values of the object
  const values1 = Object.values(labelsCSV);
  const values2 = Object.values(dataCSV);


  // Join the headers and values with commas and newlines to create the CSV string
 
  return [campoNombre, fecha, values1.join(','), values2.join(',')].join('\n');
  
}

function downloadCSV() {

  // Create the CSV string from the data
  const csvdata = csvmaker( dataCSV, labelsCSV);
  
  // Download the CSV file
  download(csvdata);
}

const download = (csvdata) => {
  // Create a Blob with the CSV data and type
  const blob = new Blob([csvdata], { type: 'text/csv' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor tag for downloading
  const a = document.createElement('a');

  // Set the URL and download attribute of the anchor tag
  a.href = url;
  a.download = campoNombre + "_" + fecha + '.csv';

  // Trigger the download by clicking the anchor tag
  a.click();
}

document.getElementById('downloadLink').addEventListener('click', downloadCSV);

function updateDateTime() {
  // create a new `Date` object
  const now = new Date();

  // get the current date and time as a string
  var currentDateTime = now.getHours().toLocaleString() + ":" +
    now.getMinutes().toLocaleString() + ":" + now.getSeconds().toLocaleString();

  var mes = now.getMonth() + 1;
  fecha = now.getDate().toLocaleString() + "_" +
  mes.toLocaleString() + "_" +
  now.getFullYear().toString();
  // update the `textContent` property of the `span` element with the `id` of `datetime`
  return currentDateTime;
}