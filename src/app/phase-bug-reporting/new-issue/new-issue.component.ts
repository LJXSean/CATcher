import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { Issue } from '../../core/models/issue.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueService } from '../../core/services/issue.service';
import { LabelService } from '../../core/services/label.service';
import { SUBMIT_BUTTON_TEXT } from '../../shared/view-issue/view-issue.component';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {
  newIssueForm: FormGroup;
  isFormPending = false;
  submitButtonText: string;
  filteredOptions: Observable<string[]>;
  private options: string[];

  constructor(
    private issueService: IssueService,
    private formBuilder: FormBuilder,
    private errorHandlingService: ErrorHandlingService,
    public labelService: LabelService,
    private router: Router
  ) {}

  ngOnInit() {
    this.newIssueForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(256)]],
      description: [''],
      severity: ['', Validators.required],
      type: ['', Validators.required]
    });

    this.getTitles();

    this.filteredOptions = this.title.valueChanges.pipe(
      startWith(''),
      map((value) => this.findTopKClosestMatch(value || ''))
    );

    this.submitButtonText = SUBMIT_BUTTON_TEXT.SUBMIT;
  }

  submitNewIssue(form: NgForm) {
    if (this.newIssueForm.invalid) {
      return;
    }
    this.isFormPending = true;
    this.issueService
      .createIssue(this.title.value, Issue.updateDescription(this.description.value), this.severity.value, this.type.value)
      .pipe(finalize(() => (this.isFormPending = false)))
      .subscribe(
        (newIssue) => {
          this.issueService.updateLocalStore(newIssue);
          this.router.navigateByUrl(`phaseBugReporting/issues/${newIssue.id}`);
          form.resetForm();
        },
        (error) => {
          this.errorHandlingService.handleError(error);
        }
      );
  }

  canDeactivate() {
    return (
      !this.isAttributeEditing(this.title) &&
      !this.isAttributeEditing(this.description) &&
      !this.isAttributeEditing(this.severity) &&
      !this.isAttributeEditing(this.type)
    );
  }

  isAttributeEditing(attribute: AbstractControl) {
    return attribute.value !== null && attribute.value !== '';
  }

  private findTopKClosestMatch(inputTitle: string, k = 5): string[] {
    const filterTitle = inputTitle.toLowerCase();
    return this.options.filter((option) => option.toLowerCase().includes(filterTitle)).slice(0, k);
  }

  private getTitles() {
    if (!this.issueService) {
      this.options = [];
      return;
    }

    this.issueService.getIssueTitles().subscribe((titles: string[]) => (this.options = titles));
  }

  get title() {
    return this.newIssueForm.get('title');
  }

  get description() {
    return this.newIssueForm.get('description');
  }

  get severity() {
    return this.newIssueForm.get('severity');
  }

  get type() {
    return this.newIssueForm.get('type');
  }
}
