module.exports = {
	name: 'ProjectData',
	task($http) {
		const projects = [];
		let filtered = [];
		
		// Designate which github repos to display, and set custom options
		const highlights = require ('./repo-options');

		/* 
		 * Project constructor built from two sources:
		 * 1) default github repo info
		 * 2) customized additions (images, categories)
		 */
		function Project(repo, highlight) {
			this.id = repo.id;
			this.name = highlight.title;
			this.repoName = repo.name;
			this.image = highlight.image;
			this.full_desc = repo.description;
			// Get first sentence of repo description
			let short_desc = repo.description.substr(0, repo.description.indexOf('.')) + '.';
			this.desc = short_desc;
			this.category = highlight.category;
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
						
						// Filter repos to only the designated 'highlights'
						let repoOptions;
						if (highlights.filter(function(highlight) {
							if (highlight.name === repo.name) {
								repoOptions = highlight;
							}
							return highlight.name === repo.name;
						}).length > 0) {
							let currentRepo = new Project(repo, repoOptions);
							projects.push(currentRepo);
						}
					});
				});
			},

			getAllProjects() {
				return projects;
			},
			
			getFilteredProjects(category) {
				if (category === 'all') {
					filtered = projects;
				} else {
					filtered = projects.filter(function(project) {
						return project.category.includes(category);
					});
				}
				return filtered;
			},
		};
	},
};