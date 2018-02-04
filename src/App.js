import React, { Component } from 'react';
import { MemoryRouter, Link, NavLink, Route} from 'react-router-dom';
import QRCode from 'qrcode.react';
import Instascan from 'instascan';
import logo from './logo.png';
import './App.css';

class QRGenerator extends Component {
  constructor (props) {
    super(props);
    this.state = {
      url: 'https://example.com/',
    };
  }

  urlChanged(event) {
    const url = event.target.value;
    this.setState({ url });
  }

  render() {
    return (
      <div className="QRGenerator" >
        <div>
          <QRCode value={this.state.url} size={300} />
        </div>
        <div>
          <input className="url-input" type="search" placeholder="URL" style={{ width: '100%' }} value={this.state.url} onChange={this.urlChanged.bind(this)} autoFocus />
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
      error: null,
      seemsRearCamera: false,
    };
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  }

  setupScanner() {
    this.scanner = new Instascan.Scanner({ video: this.refs.videoScreen, mirror: ! this.state.seemsRearCamera });
    this.scanner.addListener('scan', (url) => {
      const urls = [].concat(this.state.urls);
      if (urls.indexOf(url)=== -1) {
        urls.unshift(url);
        this.setState({ urls });
      }
    });
  }

  startScan() {
    Instascan.Camera.getCameras().then((cameras) => {
      this.setState({ seemsRearCamera: cameras.length > 1 });
      if (!this.scanner) {
        this.setupScanner();
      }
      const scanner = this.scanner;
      const rearCamera = cameras[cameras.length - 1];
      if (rearCamera) {
        scanner.start(rearCamera);
      } else {
        this.setState({
          error: 'No cameras found',
        });
      }
    }).catch((e) => {
      this.setState({
        error: e,
      })
    });
  }

  stopScan() {
    this.scanner.stop();
  }

  componentDidMount() {
    this.startScan();
  }

  componentWillUnmount() {
    this.stopScan();
  }

  renderError() {
    if (!this.state.error) {
      return null;
    }

    return (
      <div>{this.state.error}</div>
    )
  }

  render() {
    return (
      <div>
        { this.renderError() }

        <div>
          <video ref="videoScreen"></video>
        </div>
        <h2>History</h2>
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
      <MemoryRouter>
        <div className="App">
          <header className="App-header">
            <div>
              <Link to="/">
                <div className="App-title"><img src={logo} title="QRMAX" style={{ width: 238, height: 80 }}/></div>
              </Link>
            </div>
            <div className="menu">
              <NavLink exact={true} to="/" activeClassName="selected">Generate</NavLink>
              <NavLink exact={true} to="/capture" activeClassName="selected">Capture</NavLink>
            </div>
          </header>
          <div className="main-content">
            <Route exact path="/" component={QRGenerator} />
            <Route path="/capture" component={QRReader} />
          </div>
        </div>
      </MemoryRouter>
    );
  }
}

export default App;
