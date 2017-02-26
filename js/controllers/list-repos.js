module.exports = {
	name: 'ListProjects',
	task($scope, ProjectData) {
		
		// Make request to user's github repositories
		let getProjectData = () => {
			return ProjectData.parseGithub('margolanier');
		};

		
		/*
		 * Initiate Mix It Up container
		 */
		const mixitup = require('mixitup');
		const container = document.querySelector('[data-ref="container"]');
		
		function render(item) {
			return `<div class="item" data-ref="item">
				<img src="${item.image}" alt="${item.name}">
				Name: ${item.name},
				Desc: ${item.desc},
				Categ: ${item.category}
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
		
		
		/*
		 * Set up filter toolbar
		 */
		const controls = document.querySelector('[data-ref="controls"]');
		const filters	= document.querySelectorAll('[data-ref="filter"]');
		const sorts = document.querySelectorAll('[data-ref="sort"]');
		
		// Keep track of active filter for sorting
		let activeCategory = '';
		
		// Add 'control-active' class for styling
		function activateButton(activeButton, siblings) {
			let button;
			for (let i=0; i<siblings.length; i++) {
				button = siblings[i];
				button.classList[button === activeButton ? 'add' : 'remove']('control-active');
			}
		}
		
		
		/*
		 * Event handler on button click to detect button type and attributes
		 */
		const filterItems = (button) => {
			let category  = activeCategory;
			let sortBy = 'id';
			let order  = 'asc';
			
			// Determine action (filter by category, sort order, etc.)
			if (button.classList.contains('control-active') || mixer.isMixing()) {
				return; // If button is already active, do nothing
			} else if (button.matches('[data-ref="filter"]')) {
				// Filter button
				activateButton(button, filters);
				activeCategory = button.getAttribute('data-category');
				category = activeCategory;
			} else if (button.matches('[data-ref="sort"]')) {
				// Sort button
				activateButton(button, sorts);
				sortBy = button.getAttribute('data-key');
				order = button.getAttribute('data-order');
			}
			
			// Get projects that match active category
			
			getProjectData()
			/*api.get({ // 'projects' var
				category: category,
				$sort_by: sortBy,
				$order: order
			})*/
			.then(function(items) {
				// Our api returns an array of items which we can send
				// straight to our mixer using the .dataset() method
				return mixer.dataset(items);
			})
			.catch(console.error.bind(console));
			
			
			// Event listener for filter buttons
            controls.addEventListener('click', function(e) {
                filterItems(e.target);
            });
			
            // Set defaults for filter and sort
            activateButton(controls.querySelector('[data-category="all"]'), filters);
            activateButton(controls.querySelector('[data-order="asc"]'), sorts);
            
			mixer.dataset(items)
                .then(function(state) {
                    console.log('loaded ' + state.activeDataset.length + ' items');
                });
        };
		
	},
};