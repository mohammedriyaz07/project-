import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="task-list-container">
      <div class="task-header">
        <h2>My Tasks</h2>
        <a routerLink="/tasks/new" class="btn btn-primary">Add New Task</a>
      </div>

      <div class="task-stats">
        <div class="stat">
          <span class="stat-number">{{ totalTasks }}</span>
          <span class="stat-label">Total Tasks</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ completedTasks }}</span>
          <span class="stat-label">Completed</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ pendingTasks }}</span>
          <span class="stat-label">Pending</span>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        Loading tasks...
      </div>

      <div class="error-message" *ngIf="error">
        {{ error }}
      </div>

      <div class="tasks-grid" *ngIf="!loading && !error">
        <div
          class="task-card"
          *ngFor="let task of tasks"
          [class.completed]="task.completed"
        >
          <div class="task-content">
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="task-date">
                Created: {{ task.createdAt | date:'short' }}
              </span>
            </div>
          </div>

          <div class="task-actions">
            <button
              class="btn btn-sm btn-toggle"
              [class.btn-success]="!task.completed"
              [class.btn-secondary]="task.completed"
              (click)="toggleTask(task._id!)"
              [disabled]="loading"
            >
              {{ task.completed ? 'Mark Pending' : 'Mark Complete' }}
            </button>

            <a
              [routerLink]="['/tasks/edit', task._id]"
              class="btn btn-sm btn-warning"
            >
              Edit
            </a>

            <button
              class="btn btn-sm btn-danger"
              (click)="deleteTask(task._id!)"
              [disabled]="loading"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="tasks.length === 0">
          <h3>No tasks found</h3>
          <p>Get started by creating your first task!</p>
          <a routerLink="/tasks/new" class="btn btn-primary">Create Task</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .task-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .task-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .task-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .task-card.completed {
      opacity: 0.7;
    }

    .task-content {
      padding: 1.5rem;
    }

    .task-title {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1.2rem;
    }

    .task-description {
      color: #7f8c8d;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .task-meta {
      font-size: 0.85rem;
      color: #95a5a6;
    }

    .task-actions {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-size: 0.9rem;
      transition: background-color 0.3s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-success:hover {
      background: #229954;
    }

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-warning:hover {
      background: #e67e22;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
    }

    .btn-toggle {
      flex: 1;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #7f8c8d;
      margin-bottom: 2rem;
    }

    .loading, .error-message {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      grid-column: 1 / -1;
    }

    .error-message {
      color: #e74c3c;
      background: #fdf2f2;
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error = '';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error('Error loading tasks:', err);
      }
    });
  }

  toggleTask(id: string) {
    this.loading = true;
    this.taskService.toggleTask(id).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (err) => {
        this.error = 'Failed to update task. Please try again.';
        this.loading = false;
        console.error('Error toggling task:', err);
      }
    });
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          this.error = 'Failed to delete task. Please try again.';
          this.loading = false;
          console.error('Error deleting task:', err);
        }
      });
    }
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(task => !task.completed).length;
  }
}
