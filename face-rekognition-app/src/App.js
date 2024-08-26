import './App.css';
import { useState } from 'react';
const uuid = require('uuid'); 

function App() {
  const [image, setImage] = useState('');
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate.');
  const [visitorName, setVisitorName] = useState('place_holder.jpeg');
  const [isAuth, setAuth] = useState(false);

  function sendImage(e) {
    e.preventDefault(); 
    setVisitorName(image.name);
    const visitorImageName = uuid.v4();
    fetch(`https://crin08v6bc.execute-api.us-east-1.amazonaws.com/dev/ilios-visitor/${visitorImageName}.${image.type.split('/')[1]}`, {
      method: 'PUT',
      headers: {
        'Content-Type': image.type
      },
      body: image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      if (response.Message === 'success') {
        setAuth(true);
        setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, welcome to work. Hope you have a productive day.`);
      } else {
        setAuth(false);
        setUploadResultMessage(`Authentication Failed: ${response.Error || 'this person is not an employee.'}`);
      }
    }).catch(error => {
      setAuth(false);
      setUploadResultMessage('There is an error during the authentication. Please try again!');
      console.error(error);
    });
  }  

  async function authenticate(visitorImageName) {
    const requestUrl = `https://crin08v6bc.execute-api.us-east-1.amazonaws.com/dev/employee?` + 
    new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then((data) => {
        console.log(data);  // Log response data for inspection
        return data;
      })
      .catch(error => console.error(error));
  }

  return (
    <div className="App">
      <h2>Ilios Face Recognition System</h2>
      <form onSubmit={sendImage}>
      <input type='file' name='image' accept="image/*" onChange={e => setImage(e.target.files[0])}/>
        <button type='submit'>Authenticate</button>
      </form>
      <div className={isAuth ? 'success' : 'failure' }>{uploadResultMessage}</div>
      <img src={image ? URL.createObjectURL(image) : require(`./visitors/${visitorName}`)} alt="visitor" height={250} width={250}/>
    </div>
  );
}

export default App;