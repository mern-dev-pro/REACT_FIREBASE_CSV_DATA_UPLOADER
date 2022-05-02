import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from './firebase';
import './App.css';

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
        array.map((item) => {
          const res = addDoc(collection(db,'address'), {...item});          
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
