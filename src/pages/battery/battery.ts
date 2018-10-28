import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
/**
 * Generated class for the BatteryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-battery',
  templateUrl: 'battery.html',
})
export class BatteryPage {

  private motions: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.motions = navParams.get('item')
    console.log(this.motions);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BatteryPage');
  }

}
