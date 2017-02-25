module.exports = {
	name: 'ListProjectsController',
	task($scope, ProjectData) {
		// Get my github repos
		let generateProjectData = () => {
			return ProjectData.parseGithub('margolanier');
		};

		generateProjectData().then(function() {
			$scope.projects = ProjectData.getProjects();
		});
	},
};