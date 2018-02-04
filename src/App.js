import React, { Component } from 'react';
import { MemoryRouter, Link, NavLink, Route} from 'react-router-dom';
import QRCode from 'qrcode.react';
import logo from './logo.png';
import './App.css';

const Instascan = window.Instascan;

class QRGenerator extends Component {
  constructor (props) {
    super(props);
    this.state = {
      url: 'https://qr.sushi.money/',
    };
  }

  urlChanged(event) {
    const url = event.target.value;
    this.setState({ url });
  }

  render() {
    return (
      <div className="QRGenerator" >
        <div className="qr-container">
          <QRCode value={this.state.url} size={200} />
        </div>
        <div>
          <textarea className="url-input" type="search" placeholder="URL" value={this.state.url} onChange={this.urlChanged.bind(this)} autoFocus />
        </div>
      </div>
    );
  }
}

class QRReader extends Component {
  constructor (props) {
    super(props);
    let urls = [];
    try {
      const urlsInStorage = JSON.parse(localStorage.getItem('history'));
      if (urlsInStorage) {
        urls = urlsInStorage;
      }
    } catch (ignore) { };

    this.state = {
      urls: urls,
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
      const urls = [].concat(this.state.urls).filter(u => u !== url);
      urls.unshift(url);
      this.setState({ urls });
      try {
        localStorage.setItem('history', JSON.stringify(urls));
      } catch (ignore) { };
    });
  }

  removeHistory() {
    try {
      localStorage.clear();
    } catch (ignore) { };
    this.setState({ urls: [] });
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

  renderHistory() {
    if (!this.state.urls.length > 0) {
      return null;
    }

    return (
      <div>
        <ul className="history">
          {this.state.urls.map((url) => { return this.renderURL(url); })}
        </ul>
        <button type="button" onClick={this.removeHistory.bind(this)}>Clear History</button>
      </div>
    );
  }

  render() {
    return (
      <div className="QRReader">
        { this.renderError() }

        <div className="video-container">
          <video ref="videoScreen"></video>
          <div className="scanning">SCANNING</div>
        </div>
        { this.renderHistory() }
      </div>
    );
  }

  renderURL(url) {
    if (url.match(/^https?:\/\//)) {
      return (
        <li key={`link-${url}`}>
          <a href={url} target="_blank" rel="nofollow noopener noreferrer">{url}</a>
        </li>
      );
    } else {
      return (
        <li key={`code-${url}`}><code>{url}</code></li>
      );
    }
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
                <h1 className="App-title"><img src={logo} alt="QR" title="QR" style={{ height: '10vh' }} /></h1>
                <p className="App-description">QR Code Generator &amp; Scanner</p>
              </Link>
            </div>
            <div className="menu">
              <NavLink exact={true} to="/" activeClassName="selected">Generate</NavLink>
              <NavLink exact={true} to="/scan" activeClassName="selected">Scan</NavLink>
            </div>
          </header>
          <div className="main-content">
            <Route exact path="/" component={QRGenerator} />
            <Route path="/scan" component={QRReader} />
          </div>
        </div>
      </MemoryRouter>
    );
  }
}

export default App;
