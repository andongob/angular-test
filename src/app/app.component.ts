import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as Mnemonic from "bitcore-mnemonic";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-ndg';

  loginForm: any;

  constructor(private formBuilder: FormBuilder){
    this.loginForm = this.formBuilder.group ({
      seeds: '',
      password: ''
    });

  }

  sendLogin(loginData:any){
    if (loginData.seeds == '' || loginData.password == ''){
      return alert('Campos vacíos, por favor introduce credenciales');
    }

    if (!Mnemonic.isValid(loginData.seeds)) {
      return alert('Semilla inválida')
    }


    console.log(loginData);
  }
}