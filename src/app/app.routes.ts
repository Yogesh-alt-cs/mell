import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Auth routes (no guard)
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
  },

  // Authenticated routes
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'friends',
    loadComponent: () => import('./pages/friends/friends.page').then(m => m.FriendsPage),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./pages/leaderboard/leaderboard.page').then(m => m.LeaderboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'generate',
    loadComponent: () => import('./pages/generate/generate.page').then(m => m.GeneratePage),
    canActivate: [authGuard],
  },
  {
    path: 'play',
    loadComponent: () => import('./pages/play/play.page').then(m => m.PlayPage),
    canActivate: [authGuard],
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then(m => m.ResultsPage),
    canActivate: [authGuard],
  },

  // Wildcard — redirect to home
  { path: '**', redirectTo: 'home' },
];
