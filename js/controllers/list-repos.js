module.exports = {
	name: 'ListProjectsController',
	task($scope, ProjectData) {
		
		// Make request to user's github repositories
		let getProjectData = () => {
			return ProjectData.parseGithub('margolanier');
		};

		// Initiate Mix It Up container
		const mixitup = require('mixitup');
		const container = document.querySelector('[data-ref="container"]');
		
		function render(item) {
			return `<div class="item" data-ref="item">Name: ${item.name}, Desc: ${item.desc}</div>`;
		};
		
		const mixer = mixitup(container, {
			data: {
				uidKey: 'id'
			},
			render: {
				target: render
			},
			selectors: {
				target: '[data-ref="item"]'
			}
		});
		
		let projects;
		getProjectData()
			.then( () => {
				return projects = ProjectData.getAllProjects();
			})
			.then(projects => {
				mixer.dataset(projects);
			})
			.catch(console.error.bind(console));
		
		
	},
};