import React from 'react'
import { Button } from 'reactstrap';


export function LoginButton(props) {
  return (
    <Button color="primary" onClick={props.onClick}>
      Přihlásit se
    </Button>
  );
}

export function LogoutButton(props) {
  return (
    <Button color="primary" onClick={props.onClick}>
      Odhlásit se
    </Button>
  );
}
