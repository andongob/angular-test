import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as Mnemonic from "bitcore-mnemonic";
import * as CryptoJS from "crypto-js";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-ndg';

  loginForm: any;

  encrypted: any

  constructor(private formBuilder: FormBuilder){
    this.loginForm = this.formBuilder.group ({
      seeds: '',
      password: ''
    });

  this.encrypted = window.localStorage.getItem('seeds');  //valida que las semillas existen y están en localStorage
  }

//feature lesson crowd eager guitar exhibit memory degree pride hole shine battle - pwd: seña

  /*sendLogin(loginData:any){ 
    if (loginData.seeds == '' || loginData.password == ''){
      return alert('Campos vacíos, por favor introduce credenciales'); //aparece si alguno de los campos está vacío
    } */

 sendLogin(loginData:any){ 
    if (loginData.password == ''){
      return alert('Por favor, introduce tu contraseña'); 
    }

    if (this.encrypted) {//guardadas las semillas en el localStorage solo solicita password
      var decrypt = CryptoJS.AES.decrypt(this.encrypted, loginData.password);
      loginData.seeds = decrypt.toString(CryptoJS.enc.Utf8);
    }

    if (!Mnemonic.isValid(loginData.seeds)) {
      return alert('Semilla inválida') //aparece si la semilla es incorrecta
    }

    console.log(loginData);

    var encrypted = CryptoJS.AES.encrypt(loginData.seeds, loginData.password).toString();

    console.log(encrypted);

    window.localStorage.setItem('seeds', encrypted);


  }
}