import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

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

  sendForm: any;

  encrypted: any;

  wallet:any = {
    address: '',
    privateKey: '',
  }

  web3: any;

  window: any;

  constructor(@Inject(DOCUMENT) private document: Document, private formBuilder: FormBuilder){ //Angular no reconoce windows.ethereum hay que 'engañarle' con windows.document
    this.window = document.defaultView;

    //console.log(this.window.ethereum);
    
    this.loginForm = this.formBuilder.group ({
      seeds: '',
      password: ''
    });

    this.sendForm = this.formBuilder.group({
      to: '',
      amount: ''
    });


  this.encrypted = window.localStorage.getItem('seeds');  //valida que las semillas existen y están en localStorage

  //this.initWallet('feature lesson crowd eager guitar exhibit memory degree pride hole shine battle') //FUERA DE CÓDIGO: truquillo para que mientras desarrollemos no tengamos que meter todo el rato la contraseña:
  
  this.web3 = new Web3;

  this.web3.setProvider( 
    new this.web3.providers.HttpProvider('https://goerli.infura.io/v3/87388b2cafcd4bcdbb26947767a1869f')
  );
}

//feature lesson crowd eager guitar exhibit memory degree pride hole shine battle - pwd: seña

async initWallet(seeds: string) {  //método para inciar el wallet en ethereum con semillas
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

  this.wallet.privateKey = privateKey;

  this.getBalance(address);
  
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

    async getBalance(address:string){ //si iniciamos con metamask

    this.wallet.address = address; //indica la cuenta address, del div Hello en app.component.html una vez iniciada sesión
    this.wallet.balance = await this.web3.eth.getBalance(address).then((result:any) => {
      return this.web3.utils.fromWei(result, 'ether'); // convierte el balance de Wei a Ether
  });
    }


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

  loginWithMetamask() {  //método para hacer login con metamask, y se abre la ventana de metamask, curiosamente si tienes otro wallet te coje coinbase wallet en mi caso 
    if (!this.window.ethereum) {
      return alert('No tienes instalado Metamask');
    }

    //El siguente método se usa para que muestre el balance de la address en caso de loguear con Metamask

    this.window.ethereum.enable().then((accounts:any) => {  //para que funcione hay que 'trampear con window.document
      let address = accounts[0]; 
      this.getBalance(address);


      console.log(accounts)
    });

    //console.log(this.window.ethereum)
  }

  removeSeeds() {
    window.localStorage.removeItem('seeds');
    this.encrypted = '';
    this.wallet = {
      address: '',
      balance: ''
    };
  }

async sendEther(sendData:any){
if (sendData.to == '' || sendData.amount == null) {
  return alert('Algún campo está vacío')
}

if ( ! util.isValidAddress(sendData.to)) {
  return alert('La dirección no es válida');
}

// en las siguentes lineas método de transacción
var rawData = {
  from: this.wallet.address,  //usuario origen, es decir, nuestra wallet
  to: sendData.to,
  value: sendData.amount,
  gasPrice: this.web3.utils.toHex(10000000000),
  gasLimit: this.web3.utils.toHex(1000000),
  nonce: await this.web3.eth.getTransactionCount(this.wallet.address)
};

var signed = await this.web3.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString("hex"));

    console.log(signed);

    //console.log(sendData);
  }
}