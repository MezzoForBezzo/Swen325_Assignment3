import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BatteryPage } from './battery';

@NgModule({
  declarations: [
    BatteryPage,
  ],
  imports: [
    IonicPageModule.forChild(BatteryPage),
  ],
})
export class BatteryPageModule {}
