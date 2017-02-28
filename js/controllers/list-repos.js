module.exports = {
	name: 'ListProjects',
	task($scope, ProjectData) {
		
		// Make request to user's github repositories
		const getPortfolio = () => {
			return ProjectData.parseGithub('margolanier');
		};
		
		
		/*
		 * Initiate empty portfolio container and dataset
		 */
		const mixitup = require('mixitup');
		const container = document.querySelector('[data-ref="container"]');
		let projects; // holds array of repository item objects
		
		// Template to render each portfolio item
		const render = item => {
			return `<div class="item" data-ref="item">
				<div class="item-image">
					<img src="${item.image}" alt="${item.name}">
				</div>
				<div class="item-info">
					<h2>${item.name}</h2>
					<p>${item.desc}</p>
					<div class="item-btns">
						<a href="${item.siteLink}" target="blank">View site</a>
						<a href="${item.githubLink}" target="blank">View code</a>
					</div>
				</div>
			</div>`;
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
			},
			layout: {
				containerClassName: 'grid'
			},
		});
		
		// Pass portfolio items into mixer dataset to render onto page
		getPortfolio()
			.then( () => {
				return ProjectData.getAllProjects();
			})
			.then(projects => {
				mixer.dataset(projects);
			})
			.catch(console.error.bind(console));
		
		
		/*
		 * Set event handlers for MixItUp buttons
		 */
		const controls = document.querySelector('[data-ref="controls"]');
		const filters = document.querySelectorAll('[data-ref="filter"]');
		const layouts = document.querySelectorAll('[data-ref="layout"]');
		let activeCategory = '';
		let activeLayout = '';
		
		// Add 'control-active' class for styling
		const activateButton = (activeButton, siblings) => {
			for (let i=0; i<siblings.length; i++) {
				let button = siblings[i];
				button.classList[button === activeButton ? 'add' : 'remove']('control-active');
			}
		};
		
		// Set defaults for filter and layout
		activateButton(controls.querySelector('[data-category="all"]'), filters);
		activateButton(controls.querySelector('[data-layout="grid"]'), layouts);
		
		// Filter portfolio by category and pass new dataset to mixer
		const getFiltered = category => {
			return ProjectData.getFilteredProjects(category);
		};
		
		const renderFiltered = category => {
			const projects = ProjectData.getFilteredProjects(category);
			mixer.dataset(projects);
		}
		
		controls.addEventListener('click', function(e) {
			filterItems(e.target);
		});
		
		
		/*
		 * On button click, detect button type => trigger corresponding event handler 
		 */
		const filterItems = button => {
			
			// Determine action (filter by category, change layout, etc.)
			if (button.classList.contains('control-active') || mixer.isMixing()) {
				// If button is already active, do nothing
				return;
			} else if (button.matches('[data-ref="filter"]')) {
				activateButton(button, filters);
				activeCategory = button.getAttribute('data-category');
			} else if (button.matches('[data-ref="layout"]')) {
				activateButton(button, layouts);
				activeLayout = button.getAttribute('data-layout');
				mixer.changeLayout('changeLayout', {
					containerClassName: activeLayout
				});
			}
			
			// Get projects that match active category
			renderFiltered(activeCategory);
			
			// Event listener for all buttons => calls 'filterItems' recursively with new target
            controls.addEventListener('click', function(e) {
                filterItems(e.target);
            });
            
			//mixer.dataset(items);
        };
		
	},
};