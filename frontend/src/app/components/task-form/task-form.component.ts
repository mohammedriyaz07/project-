import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task-form-container">
      <div class="form-header">
        <h2>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h2>
        <a routerLink="/tasks" class="btn btn-secondary">← Back to Tasks</a>
      </div>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            class="form-control"
            placeholder="Enter task title"
            [class.error]="isFieldInvalid('title')"
          >
          <div class="error-message" *ngIf="isFieldInvalid('title')">
            Title is required
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            formControlName="description"
            class="form-control"
            rows="4"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              formControlName="completed"
              class="form-check"
            >
            <span class="checkmark"></span>
            Mark as completed
          </label>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            routerLink="/tasks"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="taskForm.invalid || loading"
          >
            {{ loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task') }}
          </button>
        </div>
      </form>

      <div class="loading" *ngIf="loading && !taskForm.value.title">
        Loading task details...
      </div>

      <div class="error-message" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .task-form-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .form-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .task-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e8ed;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
      margin-bottom: 0;
    }

    .form-check {
      margin-right: 0.75rem;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkmark {
      position: relative;
      display: inline-block;
      width: 18px;
      height: 18px;
      background: white;
      border: 2px solid #e1e8ed;
      border-radius: 3px;
      margin-right: 0.5rem;
      transition: background-color 0.3s;
    }

    .form-check:checked + .checkmark {
      background: #3498db;
      border-color: #3498db;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e1e8ed;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-size: 1rem;
      font-weight: 600;
      transition: background-color 0.3s;
      min-width: 120px;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 2rem;
    }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditing = false;
  loading = false;
  error = '';
  taskId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      completed: [false]
    });
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.taskId;

    if (this.isEditing && this.taskId) {
      this.loadTask(this.taskId);
    }
  }

  loadTask(id: string) {
    this.loading = true;
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          completed: task.completed
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load task. Please try again.';
        this.loading = false;
        console.error('Error loading task:', err);
      }
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.loading = true;
      this.error = '';

      const taskData = this.taskForm.value;

      const operation = this.isEditing && this.taskId
        ? this.taskService.updateTask(this.taskId, taskData)
        : this.taskService.createTask(taskData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.error = `Failed to ${this.isEditing ? 'update' : 'create'} task. Please try again.`;
          this.loading = false;
          console.error('Error saving task:', err);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched() {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }
}
