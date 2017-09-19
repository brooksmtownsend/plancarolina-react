import * as React from 'react'
import { observer } from 'mobx-react'
import { scheduleStore } from '../ScheduleStore'
import { uiStore } from '../UIStore'
import '../styles/LoginPopup.css'
import GoogleLogin from 'react-google-login'
import FacebookLogin from 'react-facebook-login';

@observer
export default class LoginPopup extends React.Component {
  responseGoogle = (response: any) => {
    console.log(response);
  }
  responseFacebook = (response: any) => {
    console.log(response);
  }

  render() {
    let display = uiStore.loginPopupActive ? {display: 'flex'} : {display: 'none'};
    return (
      <div className="LoginPopup" style={display}> 
        <GoogleLogin
          clientId="724319730394-0p2g3j67ju1l310deto92mvqv3hasshn.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={this.responseGoogle}
          onFailure={this.responseGoogle}
          style={{
            color: '#121212', 
            fontSize: '20px',
            height: '80%',
            border: '1px solid hsl(0, 0%, 60%)',
            cursor: 'pointer',
            display: 'block',
            background: 'url(https://madeby.google.com/static/images/google_g_logo.svg) no-repeat left',
            backgroundSize: 'contain',
            textAlign: 'right',
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            width: '120px'
          }}
        />

        <FacebookLogin
          appId="1088597931155576"
          autoLoad={true}
          fields="name,email,picture"
          callback={this.responseFacebook}
          size="small"
        />
        
      </div>
    )
  }
}

function onSignIn(googleUser: any) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
}