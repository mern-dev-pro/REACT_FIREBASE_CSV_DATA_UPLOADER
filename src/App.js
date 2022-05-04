import React, { useState } from 'react';
import Geocode from 'react-geocode';
import { collection, addDoc } from "firebase/firestore";
import { db } from './firebase';
import './App.css';

Geocode.setApiKey("AIzaSyBoY4Yn60USF1fDNIm65QVpRBowNeBBgbA");
Geocode.setLanguage('de');
Geocode.setRegion('de');
Geocode.enableDebug(true);
const addressToGeoCoords = async (address) => {
  console.log(address);
  try {
    const res = await Geocode.fromAddress(address);
    const { lat, lng } = res.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error(error.message);
  }
};

function App() {
  const [file, setFile] = useState();
  const [array, setArray] = useState([]);
  const fileReader = new FileReader();

  const handleOnChange = (e) => {
      setFile(e.target.files[0]);
  };

  const handleOnSubmit = (e) => {
      e.preventDefault();

      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
  };

  const csvFileToArray = string => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(";");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const currentArray = csvRows.map(i => {
      const values = i.split(";");
      const obj = csvHeader.reduce((object, header, index) => {
        const headerKey = header.split(" ").join("");
        object[headerKey] = values[index];
        return object;
      }, {}); 
      delete obj.Ignored;
      return obj;
    });

    setArray(currentArray);
  };

  const headerKeys = Object.keys(Object.assign({}, ...array));

  const uploadToFirebse = async() => {
    if(array.length){
      console.log("start........");
      await Promise.all(
        array.map(async(item, index) => {
          const geoCode = await addressToGeoCoords(item?.PostalCode);
          const res = await addDoc(collection(db,'address'), {...item, geoCoords: geoCode, assigned: '0', id: index });          
          return res.id
        })
      );
      console.log("end........");
    }
  }

  return (
    <div className="App">
      <h1>REACTJS CSV IMPORT EXAMPLE </h1>
        <form>
            <input
                type={"file"}
                id={"csvFileInput"}
                accept={".csv"}
                onChange={handleOnChange}
            />

            <button
                onClick={(e) => {
                    handleOnSubmit(e);
                }}
            >
                IMPORT CSV
            </button>
            <button
                onClick={uploadToFirebse}
                type="button"
            >
              Upload to FireBase
            </button>
        </form>
        <br/>
        <table>
          <thead>
            <tr key={"header"}>
              {headerKeys.map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {array.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((val, index) => (
                  <td key={index}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
      </table>
    </div>
  );
}

export default App;
