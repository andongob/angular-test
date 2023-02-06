import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import * as Mnemonic from "bitcore-mnemonic";
import * as CryptoJS from "crypto-js";
import * as bip39 from "bip39";
import { hdkey } from 'ethereumjs-wallet';
import * as util from "ethereumjs-util";
import Web3 from 'web3';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-ndg';

  loginForm: any;

  encrypted: any;

  wallet:any = {
    address: ''
  }

  web3: any;

  constructor(private formBuilder: FormBuilder){
    this.loginForm = this.formBuilder.group ({
      seeds: '',
      password: ''
    });

  this.encrypted = window.localStorage.getItem('seeds');  //valida que las semillas existen y están en localStorage

  this.initWallet('feature lesson crowd eager guitar exhibit memory degree pride hole shine battle') //FUERA DE CÓDIGO: truquillo para que mientras desarrollemos no tengamos que meter todo el rato la contraseña:
  
  this.web3 = new Web3;

  this.web3.setProvider( 
    new this.web3.providers.HttpProvider('https://goerli.infura.io/v3/87388b2cafcd4bcdbb26947767a1869f')
  );
}

//feature lesson crowd eager guitar exhibit memory degree pride hole shine battle - pwd: seña

async initWallet(seeds: string) {  //método para inciar el wallet en ethereum
  var mnemonic = new Mnemonic(seeds);
  var seed = await bip39.mnemonicToSeed(mnemonic.toString());
  var path = "m/44'/60'/0'70/0";

  var wallet = hdkey
  .fromMasterSeed(seed)
  .derivePath(path)
  .getWallet();

  var privateKey = wallet.getPrivateKey();
  var publicKey = util.privateToPublic(privateKey);
  var address = "0x" + util.pubToAddress(publicKey).toString("hex"); //convierte las palabras clave en semillas

  this.wallet.address = address; //indica la cuenta address, del div Hello en app.component.html una vez iniciada sesión

  this.wallet.balance = await this.web3.eth.getBalance(address).then((result:any) => {
    return this.web3.utils.fromWei(result, 'ether'); // convierte el balance de Wei a Ether
  });
  //console.log(address);
  //console.log(privateKey);
  //console.log(publicKey);
 

}

  /*sendLogin(loginData:any){ //pide semillas y contraseña
    if (loginData.seeds == '' || loginData.password == ''){
      return alert('Campos vacíos, por favor introduce credenciales'); //aparece si alguno de los campos está vacío
    } */

 sendLogin(loginData:any){ //solo pide contraseña
    if (loginData.password == ''){
      return alert('Por favor, introduce tu contraseña'); 
    }

    if (this.encrypted) {//guardadas las semillas en el localStorage solo solicita password - min 24:00
      var decrypt = CryptoJS.AES.decrypt(this.encrypted, loginData.password);
      loginData.seeds = decrypt.toString(CryptoJS.enc.Utf8);
    }

    if (!Mnemonic.isValid(loginData.seeds)) {
      return alert('Semilla inválida') //aparece si la semilla es incorrecta
    }

    //console.log(loginData);

    var encrypted = CryptoJS.AES.encrypt(loginData.seeds, loginData.password).toString();

    //console.log(encrypted);

    window.localStorage.setItem('seeds', encrypted);

    this.loginForm.reset(); //reinicia el formulario

    this.initWallet(loginData.seeds);

  }
}