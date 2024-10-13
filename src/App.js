
// Imports
import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './App.css'


function App() {

  const socketUrl = 'wss://vmivgezct0.execute-api.us-east-1.amazonaws.com/production';
  const http_url = "https://gkak4edf7g.execute-api.us-east-1.amazonaws.com/beta/data"
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket connection opened"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (error) => console.log("WebSocket error:", error)
  });
  const [info, setInfo] = useState({ labels: [], humValues: [], tempValues: [] })
  const [info2, setInfo2] = useState({ labels: [], humValues: [], tempValues: [] })

  const [data, setData] = useState({
    labels: [],
    datasets: [
      { label: "ESP32 Temperature", backgroundColor: "rgb(255, 99, 132)", borderColor: "rgb(255, 99, 132)", data: [] },
      { label: "ESP32 Humidity", backgroundColor: "rgb(132,99,255)",borderColor: "rgb(132, 99, 255)", data: [] }
    ]});

    const [data2, setData2] = useState({
      labels: [],
      datasets: [
        { label: "ESP32 Temperature", backgroundColor: "rgb(255, 99, 132)", borderColor: "rgb(255, 99, 132)", data: [] },
        { label: "ESP32 Humidity", backgroundColor: "rgb(132,99,255)",borderColor: "rgb(132, 99, 255)", data: [] }
  ]});

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const [initDate, setInitDate] = useState("2024-10-12T18:00:00");
  const [endDate, setEndDate]   = useState(formatDate(new Date()));



  async function httpGet_range(init_date, end_date) {
    init_date = new Date(initDate).getTime();
    end_date  = new Date(endDate ).getTime();
    try {
        const response = await fetch(`${http_url}?init_date=${init_date}&end_date=${end_date}`, {
          method: 'GET', // or 'POST', 'PUT', etc.
          headers: {
            'Origin': 'http://your-origin-url.com',  // Specify your client URL here
            'Content-Type': 'application/json'      // Include any other necessary headers
          },
          mode: 'cors',  // Make sure the request mode is CORS
        });
        const resp_data = await response.text();
        return JSON.parse(resp_data);
    } catch (error) {
        return console.error('Error:', error);
    }
  }

  useEffect(() => {
    if (lastMessage!=null) {
      const esp32Item = JSON.parse(lastMessage.data);
      const paragraph2 = document.getElementById('paragraph1');
      paragraph2.innerText = `Sensor realtime data: temp: ${esp32Item.temp}, hum: ${esp32Item.hum}`;

      setInfo((previnfo) => ({
        tempValues: [...previnfo.tempValues, esp32Item.temp],
        humValues : [...previnfo.humValues, esp32Item.hum],
        labels    : [...previnfo.labels, formatDate(new Date()).slice(5, -3)]
      }));
    }
  }, [lastMessage]);

  useEffect(() => {
    setData(() => ({
      labels: info.labels,
      datasets: [
        { label: "ESP32 Humidity", backgroundColor: "rgb(255, 99, 132)", borderColor: "rgb(255, 99, 132)",
          data: info.humValues },
        { label: "ESP32 Temperature", backgroundColor: "rgb(132, 99, 255)", borderColor: "rgb(132, 99, 255)",
          data: info.tempValues }] }));
  }, [info]);

  const onClickBtn2 = async () => {
    const rsp_info = await httpGet_range(initDate, endDate);

    setInfo2({
      humValues:  rsp_info.map((item) => item.hum),
      tempValues: rsp_info.map((item) => item.temp),
      labels:     rsp_info.map((item) => formatDate(new Date(item.timestamp)).slice(5,-3))
    });
  }

  useEffect(() => {
    const myData2 = {
      labels: info2.labels,
      datasets: [
        { label: "ESP32 Humidity", backgroundColor: "rgb(255, 99, 132)", borderColor: "rgb(255, 99, 132)",
          data: info2.humValues, },
        { label: "ESP32 Temperature", backgroundColor: "rgb(132, 99, 255)", borderColor: "rgb(132, 99, 255)",
          data: info2.tempValues, }
      ],
    };
    setData2(myData2);
  }, [info2]);

  const onClickBtn3 = () => {
    setInitDate("2024-10-12T18:00:00");
    setEndDate("2024-10-12T18:30:00");
  }

  return (
    <div>
      <div className="graficos">
        <div className="line-div">
          <h2>Datos en tiempo real</h2>
          <Line data={data} />
          <p id="paragraph1"></p>
        </div>
        <div className="line-div">
          <h2>Medidas entre periodos de tiempo</h2>
          <Line data={data2} />
          <div id="inputdiv">
              <label>Fecha inicial:</label>
              <input type="datetime-local" id="init_date" value={initDate}
                  onChange={(e) => setInitDate(e.target.value)}/>
              <br></br>
              <label>Fecha final:   .</label>
              <input type="datetime-local" id="end_date" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}/>
            <div id="buttondiv">
                <button id="button2" onClick={onClickBtn2}>Consultar</button>
                <button id="button3" onClick={onClickBtn3}>Rango de ejemplo</button>
            </div>
            <p id="paragraph2">Limitado a los últimos 30 valores en el rango</p>
          </div>
        </div>

      </div>
    </div>

  );
}

export default App;