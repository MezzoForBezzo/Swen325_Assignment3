import { Component  } from '@angular/core';
import { NavController, AlertController  } from 'ionic-angular';
import { BatteryPage } from '../battery/battery';
import { LocalNotifications } from '@ionic-native/local-notifications';
declare var Paho : any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  private mqttStatus: string = 'Disconnected';
  private mqttClient: any = null;
  private message: any = '';
  private messageToSend: string = '2018-10-28 17:10:01,toilet,1,95';
  private topic: string = 'swen325/t1';
  private clientId: string = 'myFabulousName'

  private lastMotion = { timestamp: 0, sensor_location:"No Detection", motion_status: false, battery_status: '100' };
  private lastTime: any = 0;
  private lastMotionTime: any = 0;
  private currentTime: any = 0;

  private motions = [
      { timestamp: undefined, sensor_location:"Living", motion_status: undefined, battery_status: '100' },
      { timestamp: undefined, sensor_location:"Kitchen", motion_status: undefined, battery_status: '100' },
      { timestamp: undefined, sensor_location:"dining", motion_status: undefined, battery_status: '100' },
      { timestamp: undefined, sensor_location:"toilet", motion_status: undefined, battery_status: '100' },
      { timestamp: undefined, sensor_location:"bedroom", motion_status: undefined, battery_status: '100' }
     ];

  constructor(public navCtrl: NavController, public localNotifications: LocalNotifications, private alertCtrl : AlertController ) {
    this.connect();
  }

// < ----------Tutorial Things Start----------->
  public connect = () => {
  	this.mqttStatus = 'Connecting...';
  	//this.mqttClient = new Paho.MQTT.Client('localhost', 22389, '/mqtt', this.clientId);
  	this.mqttClient = new Paho.MQTT.Client('m15.cloudmqtt.com', 39987, '/mqtt', this.clientId);
  	//this.mqttClient = new Paho.MQTT.Client('barretts.ecs.vuw.ac.nz', 8883, '/mqtt', this.clientId);

	// set callback handlers
	this.mqttClient.onConnectionLost = this.onConnectionLost;
	this.mqttClient.onMessageArrived = this.onMessageArrived;

	// connect the client
	console.log('Connecting to mqtt via websocket');
	//this.mqttClient.connect({timeout:10, userName:'avweezgt', password:'Iawb3ug7B2cQ', useSSL:true, onSuccess:this.onConnect, onFailure:this.onFailure});
	this.mqttClient.connect({timeout:10, userName:'avweezgt', password:'Iawb3ug7B2cQ', useSSL:true, onSuccess:this.onConnect, onFailure:this.onFailure});
	//this.mqttClient.connect({timeout:10, useSSL:false, onSuccess:this.onConnect, onFailure:this.onFailure});
  }

  public disconnect () {
  	if(this.mqttStatus == 'Connected') {
  		this.mqttStatus = 'Disconnecting...';
  		this.mqttClient.disconnect();
  		this.mqttStatus = 'Disconnected';
  	}
  }

  public sendMessage () {
  	if(this.mqttStatus == 'Connected') {
  		this.mqttClient.publish(this.topic, this.messageToSend);
  	}
  }

  public onConnect = () => {
  	console.log('Connected');
  	this.mqttStatus = 'Connected';

  	// subscribe
  	this.mqttClient.subscribe(this.topic);
  }

  public onFailure = (responseObject) => {
  	console.log('Failed to connect');
  	this.mqttStatus = 'Failed to connect';
  }

  public onConnectionLost = (responseObject) => {
   	if (responseObject.errorCode !== 0) {
   		this.mqttStatus = 'Disconnected';
  	}
  }

  public onMessageArrived = (message) => {
  	console.log('Received message');
    this.checkMessage(message.payloadString);

    setTimeout( () => { console.log('Notifying Inactivity....'); }, 5000);
  }

// < ----------Tutorial Things end----------->
  public goToBatteryPage = () => {
    console.log(this.motions);
    this.navCtrl.push(BatteryPage, {item:this.motions});
  }

  public checkMessage = (message: string) => {
    const splitMessage = message.split(',');

    console.log('making resonse');
    const detection = {
      timestamp: splitMessage[0],
      sensor_location: splitMessage[1],
      motion_status: splitMessage[2] == '0' ? false : true,
      battery_status: splitMessage[3]
    }

    console.log(`checking sensor_location: ${detection.sensor_location}` );

    const index = this.motions.findIndex( element => element.sensor_location.toUpperCase() == detection.sensor_location.toUpperCase() );

    if (index >=0 ) {
      this.motions[index] = detection;
      console.log('checking to see if motion is detected');

      if (detection.motion_status == true) {
        console.log(`sending detection: ${detection.sensor_location}, to lastMotionDetected`);
        this.message = message;
        this.lastMotionDetected(detection);
      }
    } else {
      this.message = 'Invalid Data';
      console.log('Room not found');
    }
  }

  public lastMotionDetected = (motion) => {
    console.log(`sensor_location: ${motion.sensor_location}`);
    console.log('checking to see if motion is lastMotionDetected');
    if ((motion.sensor_location !== this.lastMotion.sensor_location) || (motion.timestamp !== this.lastMotion.timestamp)){
      console.log(`Motion Detected ${motion.sensor_location} ${motion.timestamp}`);
      this.lastMotion = motion;
    }else{
      console.log(`Last Motion Detected: ${this.lastMotion.sensor_location} ${this.lastMotion.timestamp}`);
    }
    this.timeSinceLastMotion();
  }

  public timeSinceLastMotion = () => {
    this.lastMotionTime = new Date(this.lastMotion.timestamp);
    this.currentTime = new Date(Date.now());

    console.log(`currentTime: ${this.currentTime}`)
    console.log(`lastMotionTime: ${this.lastMotionTime}`)

    this.lastTime = Math.floor((Math.abs(this.currentTime - this.lastMotionTime) / 1000) / 60);

    if (this.lastTime >= 5) {
      console.log('making alert');
      let alert = this.alertCtrl.create({
        title: 'INACTIVITY WARNING!',
        message:  `<p>Last Detection: <b>${this.lastTime} mins</b>.</p>
                   <p>Last room detected: <b>${this.lastMotion.sensor_location.toUpperCase()}</b></p>` ,
        buttons: ['Dismiss']
      });
      alert.present();
    }

    setTimeout( () => {
      this.timeSinceLastMotion();
    }, 60000);
  }
}
