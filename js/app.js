const app = angular.module('PortfolioApp', []);

const controllers = [
	require ('./controllers/list-repos'),
];

for(let i=0; i<controllers.length; i++) {
	app.controller(controllers[i].name, controllers[i].task);
}

const services = [
	require ('./services/repo-data'),
];

for(let i=0; i<services.length; i++) {
	app.factory(services[i].name, services[i].task);
}