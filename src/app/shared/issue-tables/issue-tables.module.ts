import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { IssueTablesComponent } from './issue-tables.component';
import { ItemsPerPageDirective } from '../../core/directives/item-per-page.directive';

@NgModule({
  exports: [IssueTablesComponent],
  declarations: [IssueTablesComponent, ItemsPerPageDirective],
  imports: [CommonModule, MaterialModule, RouterModule]
})
export class IssueTablesModule {}
