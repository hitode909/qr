import React, { Component } from 'react';
import { BrowserRouter, Link, NavLink, Route} from 'react-router-dom';
import QRCode from 'qrcode.react';
import Webcam from 'react-webcam';
import Instascan from 'instascan';
import logo from './logo.svg';
import './App.css';

class QRGenerator extends Component {
  constructor (props) {
    super(props);
    this.state = {
      url: '',
    };
  }

  urlChanged(event) {
    const url = event.target.value;
    this.setState({ url });
  }

  render() {
    return (
      <div>
        <div>
          <QRCode value={this.state.url} size={300} />
        </div>
        <div>
          <input type="url" style={{ width: '100%' }} type="url" value={this.state.url} onChange={this.urlChanged.bind(this)} autoFocus />
        </div>
      </div>
    );
  }
}

class QRReader extends Component {
  constructor (props) {
    super(props);
    this.state = {
      urls: [],
    };
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  }

  componentDidMount() {
    const scanner = new Instascan.Scanner({ video: this.webcam.getCanvas() });
    this.scanner = scanner;
    scanner.addListener('scan', (url) => {
      const urls = [].concat(this.state.urls);
      if (urls.indexOf(url)=== -1) {
        urls.push(url);
        this.setState({ urls });
      }
    });
    Instascan.Camera.getCameras().then((cameras) => {
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
      } else {
        console.error('No cameras found.');
      }
    }).catch((e) => {
      console.error(e);
    });
  }

  render() {
    return (
      <div>
        <div>
          <Webcam audio={false} ref={this.setRef} width={200} height={200} />
        </div>
        <ul>
          {this.state.urls.map((url) => { return this.renderURL(url); })}
        </ul>
      </div>
    );
  }

  renderURL(url) {
    return (
      <li key={`link-${url}`}>
        <a href={url} target="_blank" >{url}</a>
      </li>
    );
  }
}

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      url: '',
    };
  }

  urlChanged(event) {
    const url = event.target.value;
    this.setState({ url });
  }

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <header className="App-header">
            <div>
              <Link to="/">
                <h1 className="App-title">QR</h1>
              </Link>
            </div>
            <div>
              <NavLink exact={true} to="/" activeClassName="selected">Generate</NavLink>
              <NavLink exact={true} to="/capture" activeClassName="selected">Capture</NavLink>
            </div>
          </header>
          <div className="main-content">
            <Route exact path="/" component={QRGenerator} />
            <Route path="/capture" component={QRReader} />
          </div>
          <footer>
          </footer>
          </div>
      </BrowserRouter>
    );
  }
}

export default App;
