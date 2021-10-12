import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutoLoginGuard } from './guards/auto-login.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule),
		pathMatch: 'full',
		canLoad: [AutoLoginGuard]
	},
	{
		path: 'login',
		loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule),
		canLoad: [AutoLoginGuard]
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule),
		pathMatch: 'full',
		canLoad: [AuthGuard]
	},
	{
		path: 'profile-view',
		loadChildren: () => import('./profile/profile-view/profile-view.module').then(m => m.ProfileViewPageModule),
		pathMatch: 'full',
		canLoad: [AuthGuard]
	},
	{
		path: 'settings',
		loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule),
		pathMatch: 'full',
		canLoad: [AuthGuard]
	},
	{
		path: 'profile-password',
		loadChildren: () => import('./profile/profile-password/profile-password.module').then(m => m.ProfilePasswordPageModule),
		canLoad: [AuthGuard]
	},
	{
		path: 'notificari-list',
		loadChildren: () => import('./notificari/notificari-list/notificari-list.module').then(m => m.NotificariListPageModule),
		pathMatch: 'full',
		canLoad: [AuthGuard]
	},
	{
		path: 'notificari-view',
		loadChildren: () => import('./notificari/notificari-view/notificari-view.module').then(m => m.NotificariViewPageModule),
		pathMatch: 'full',
		canLoad: [AuthGuard]
	},
	{
		path: 'check-contract',
		loadChildren: () => import('./parking/check-contract/check-contract.module').then(m => m.CheckContractPageModule)
	},
	{
		path: 'view-contract',
		loadChildren: () => import('./parking/view-contract/view-contract.module').then(m => m.ViewContractPageModule)
	},
	{
		path: 'sesizari-blocare-auto-agent',
		loadChildren: () => import('./sesizari/sesizari-blocare-auto-agent/sesizari-blocare-auto-agent.module').then(m => m.SesizariBlocareAutoAgentPageModule)
	},
	{
		path: 'solicitari-blocari-auto-list',
		loadChildren: () => import('./parking/solicitari-blocari-auto-list/solicitari-blocari-auto-list.module').then(m => m.SolicitariBlocariAutoListPageModule)
	},
	{
		path: 'solicitari-blocari-auto-view',
		loadChildren: () => import('./parking/solicitari-blocari-auto-view/solicitari-blocari-auto-view.module').then(m => m.SolicitariBlocariAutoViewPageModule)
	},
	{
		path: 'solicitari-blocari-auto-list-filters',
		loadChildren: () => import('./parking/solicitari-blocari-auto-list-filters/solicitari-blocari-auto-list-filters.module').then(m => m.SolicitariBlocariAutoListFiltersPageModule)
	},
	{
		path: 'sign-team-day',
		loadChildren: () => import('./blocari-auto/sign-team-day/sign-team-day.module').then(m => m.SignTeamDayPageModule)
	},
	{
		path: 'gestiune-blocatoare',
		loadChildren: () => import('./blocari-auto/gestiune-blocatoare/gestiune-blocatoare.module').then(m => m.GestiuneBlocatoarePageModule)
	},
	// old stuff
	{
		path: 'page-not-found',
		loadChildren: () => import('./page-not-found/page-not-found.module').then(m => m.PageNotFoundModule)
	},
	{
		path: '**',
		redirectTo: 'page-not-found'
	}
];
@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			// This value is required for server-side rendering to work.
			initialNavigation: 'enabled',
			scrollPositionRestoration: 'enabled',
			anchorScrolling: 'enabled'
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
