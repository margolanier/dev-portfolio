module.exports = {
	name: 'ProjectData',
	task($http) {
		const projects = [];

		function Project(repo /*, image,*/) {
			this.title = repo.name;
			// this.image = image;
			this.desc = repo.description;
			this.siteLink = repo.homepage;
			this.githubLink = repo.html_url;
			this.dateCreated = repo.created_at;
			this.dateUpdated = repo.updated_at;

			return this;
		}

		return {
			parseGithub(username) {
				return $http.get(`https://api.github.com/users/${username}/repos`).then(function(response) {
					let repoData = response.data;
					repoData.forEach(repo => {
						let currentRepo = new Project(repo);
						projects.push(currentRepo);
					});
					console.log(projects);
				});
			},

			getProjects() {
				return projects;
			},
		};
	},
};